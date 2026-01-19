import { NextRequest } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { z } from 'zod';

export async function validateApiKey(request: NextRequest) {
    const apiKey = request.headers.get('X-SwatBloc-Key');

    if (!apiKey) {
        return { error: 'Missing API key', status: 401 };
    }

    const isSecretKey = apiKey.startsWith('sk_');
    const isPublicKey = apiKey.startsWith('pk_');

    if (!isSecretKey && !isPublicKey) {
        return { error: 'Invalid API key format', status: 401 };
    }

    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase.from('api_keys').select('store_id, is_active');
    
    if (isSecretKey) {
        query = query.eq('secret_key', apiKey);
    } else {
        query = query.eq('public_key', apiKey);
    }

    const { data: keyData, error: keyError } = await query.single();

    if (keyError || !keyData) {
        return { error: 'Invalid API key', status: 401 };
    }

    if (!keyData.is_active) {
        return { error: 'API key has been revoked', status: 401 };
    }

    return { storeId: keyData.store_id, supabase, isSecretKey };
}

export function validateContentItem(schemaDef: any, data: any) {
    const shape: Record<string, z.ZodTypeAny> = {};
    const referenceFields: string[] = [];
    const fields = schemaDef?.fields || [];

    for (const field of fields) {
        let validator: z.ZodTypeAny;

        switch (field.type) {
            case 'text':
            case 'image':
            case 'date': 
                validator = z.string();
                break;
            case 'number':
                validator = z.number();
                break;
            case 'boolean':
                validator = z.boolean();
                break;
            case 'json':
                validator = z.any();
                break;
            case 'reference':
                validator = z.string();
                referenceFields.push(field.key);
                break;
            default:
                validator = z.any();
        }

        if (!field.required) {
            validator = validator.optional().nullable();
        }

        shape[field.key] = validator;
    }

    const zodSchema = z.object(shape);

    const result = zodSchema.safeParse(data);

    if (!result.success) {
        throw new Error(result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
    }

    const validatedData = result.data;
    const references: string[] = [];

    for (const key of referenceFields) {
        const val = validatedData[key];
        if (typeof val === 'string' && val) {
            references.push(val);
        }
    }

    return { validatedData, references };
}
