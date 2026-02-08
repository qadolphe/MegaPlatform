import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../shared';
import { Resource } from 'sst';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

interface TransitionRequest {
    stepId: string;
    metadata?: Record<string, any>;
    status?: 'processing' | 'completed' | 'cancelled';
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });

    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required' }, { status: 403 });
    }

    const { supabase, storeId } = api;
    const { id: orderId, itemId } = await params;
    const body: TransitionRequest = await request.json();

    // 1. Get order and verify it belongs to this store
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, store_id')
        .eq('id', orderId)
        .eq('store_id', storeId)
        .single();

    if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Get order item with product data
    const { data: item, error: itemError } = await supabase
        .from('order_items')
        .select(`
            *,
            product:products(id, fulfillment_pipeline)
        `)
        .eq('id', itemId)
        .eq('order_id', orderId)
        .single();

    if (itemError || !item) {
        return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    // 3. Validate step exists in product's pipeline
    const pipeline = item.product?.fulfillment_pipeline || [];
    const step = pipeline.find((s: any) => s.id === body.stepId);

    if (!step) {
        return NextResponse.json({
            error: `Invalid step ID: ${body.stepId}. Valid steps: ${pipeline.map((s: any) => s.id).join(', ')}`
        }, { status: 400 });
    }

    // 4. Validate required metadata
    const requiredMetadata = step.required_metadata || [];
    const providedMetadata = body.metadata || {};
    const missingFields = requiredMetadata.filter((field: string) => !providedMetadata[field]);

    if (missingFields.length > 0) {
        return NextResponse.json({
            error: `Missing required metadata for step "${step.label}": ${missingFields.join(', ')}`
        }, { status: 400 });
    }

    // 5. Build new step history entry
    const historyEntry = {
        step_id: body.stepId,
        completed_at: new Date().toISOString(),
        metadata: providedMetadata
    };

    const currentHistory = item.step_history || [];
    const newHistory = [...currentHistory, historyEntry];

    // 6. Update order item
    const { data: updatedItem, error: updateError } = await supabase
        .from('order_items')
        .update({
            current_step_id: body.stepId,
            step_history: newHistory
        })
        .eq('id', itemId)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 7. Optionally update order status
    if (body.status) {
        await supabase
            .from('orders')
            .update({
                status: body.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
    }

    // 8. Fire webhooks (async via SQS)
    try {
        const { data: subscriptions } = await supabase
            .from('webhook_subscriptions')
            .select('url, secret_key, events')
            .eq('store_id', storeId)
            .eq('is_active', true);

        const relevantSubs = (subscriptions || []).filter(
            (sub: any) => sub.events.includes('item.step_updated') || sub.events.includes('*')
        );

        for (const sub of relevantSubs) {
            await sqs.send(new SendMessageCommand({
                QueueUrl: Resource.WebhookQueue.url,
                MessageBody: JSON.stringify({
                    url: sub.url,
                    secretKey: sub.secret_key,
                    event: 'item.step_updated',
                    data: {
                        order_id: orderId,
                        item_id: itemId,
                        step_id: body.stepId,
                        step_label: step.label,
                        metadata: providedMetadata,
                        timestamp: historyEntry.completed_at
                    }
                })
            }));
        }
    } catch (webhookError) {
        // Log but don't fail - webhooks are async
        console.error('Failed to enqueue webhooks:', webhookError);
    }

    return NextResponse.json(updatedItem);
}
