import { SQSHandler } from 'aws-lambda';
import crypto from 'crypto';

interface WebhookPayload {
    url: string;
    secretKey: string;
    event: string;
    data: Record<string, any>;
}

/**
 * Lambda handler that processes webhook deliveries from SQS.
 * Implements HMAC-SHA256 signing for payload verification.
 */
export const handler: SQSHandler = async (event) => {
    const results = await Promise.allSettled(
        event.Records.map(async (record) => {
            const payload: WebhookPayload = JSON.parse(record.body);

            const timestamp = Date.now();
            const body = JSON.stringify({
                event: payload.event,
                data: payload.data,
                timestamp
            });

            // HMAC signature for verification
            const signature = crypto
                .createHmac('sha256', payload.secretKey)
                .update(body)
                .digest('hex');

            const response = await fetch(payload.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-SwatBloc-Signature': signature,
                    'X-SwatBloc-Timestamp': timestamp.toString()
                },
                body
            });

            if (!response.ok) {
                throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
            }

            return { url: payload.url, status: response.status };
        })
    );

    // Log results for debugging
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Webhook delivery error:', result.reason);
        }
    }
};
