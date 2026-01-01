import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supported models for media generation
const MEDIA_MODELS = {
    // Image models
    'gemini-2.5-flash-image': { type: 'image', provider: 'gemini' },
    'gemini-3-pro-image-preview': { type: 'image', provider: 'gemini' },
    // Video models
    'veo-3.1-generate-preview': { type: 'video', provider: 'gemini' }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, model, storeId } = body;

        if (!prompt || !model) {
            return NextResponse.json(
                { error: "Prompt and model are required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Verify user auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate model
        const modelConfig = MEDIA_MODELS[model as keyof typeof MEDIA_MODELS];
        if (!modelConfig) {
            return NextResponse.json(
                { error: `Invalid model: ${model}. Available: ${Object.keys(MEDIA_MODELS).join(', ')}` },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        let mediaUrl: string;
        let mimeType: string;

        if (modelConfig.type === 'image') {
            // Use Gemini image generation
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        number_of_images: 1,
                        safety_settings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                        ],
                        image_generation_config: {
                            aspect_ratio: "1:1",
                            output_mime_type: "image/webp"
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Image generation error:", errorData);
                return NextResponse.json(
                    { error: errorData.error?.message || "Image generation failed" },
                    { status: response.status }
                );
            }

            const result = await response.json();

            // Extract base64 image data
            const imageData = result.images?.[0]?.image_bytes || result.generated_images?.[0]?.image?.bytes;
            if (!imageData) {
                return NextResponse.json({ error: "No image generated" }, { status: 500 });
            }

            // Upload to Supabase storage
            const fileName = `generated/${Date.now()}-${crypto.randomUUID()}.webp`;
            const imageBuffer = Buffer.from(imageData, 'base64');

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, imageBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
            }

            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
            mediaUrl = publicUrl;
            mimeType = 'image/webp';

        } else if (modelConfig.type === 'video') {
            // Use Veo for video generation
            // Start the generation job
            const startResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateVideo?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        video_generation_config: {
                            aspect_ratio: "16:9",
                            duration_seconds: 5
                        }
                    })
                }
            );

            if (!startResponse.ok) {
                const errorData = await startResponse.json();
                console.error("Video generation error:", errorData);
                return NextResponse.json(
                    { error: errorData.error?.message || "Video generation failed" },
                    { status: startResponse.status }
                );
            }

            const jobResult = await startResponse.json();

            // For video, we return a job ID for polling (videos take longer)
            if (jobResult.name) {
                return NextResponse.json({
                    status: 'processing',
                    jobId: jobResult.name,
                    message: 'Video generation started. Poll for status.',
                    type: 'video'
                });
            }

            // If we got a direct result (unlikely for video)
            const videoData = jobResult.video?.bytes;
            if (!videoData) {
                return NextResponse.json({ error: "No video generated" }, { status: 500 });
            }

            const fileName = `generated/${Date.now()}-${crypto.randomUUID()}.mp4`;
            const videoBuffer = Buffer.from(videoData, 'base64');

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, videoBuffer, {
                    contentType: 'video/mp4',
                    cacheControl: '3600'
                });

            if (uploadError) {
                return NextResponse.json({ error: "Failed to save video" }, { status: 500 });
            }

            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
            mediaUrl = publicUrl;
            mimeType = 'video/mp4';
        } else {
            return NextResponse.json({ error: "Unknown media type" }, { status: 400 });
        }

        // Optionally save to store's media library
        if (storeId) {
            await supabase.from('store_media').insert({
                store_id: storeId,
                url: mediaUrl,
                mime_type: mimeType,
                source: 'ai_generated',
                prompt: prompt,
                model: model
            });
        }

        return NextResponse.json({
            status: 'complete',
            url: mediaUrl,
            type: modelConfig.type,
            mimeType
        });

    } catch (error) {
        console.error("Media generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

// Poll for video generation status
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
        return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${jobId}?key=${apiKey}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.error?.message || "Failed to check status" },
                { status: response.status }
            );
        }

        const result = await response.json();

        if (result.done) {
            // Job complete - return the video URL
            const videoData = result.response?.video?.bytes;
            if (videoData) {
                // Upload to storage
                const supabase = await createClient();
                const fileName = `generated/${Date.now()}-${crypto.randomUUID()}.mp4`;
                const videoBuffer = Buffer.from(videoData, 'base64');

                await supabase.storage
                    .from('media')
                    .upload(fileName, videoBuffer, { contentType: 'video/mp4' });

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

                return NextResponse.json({
                    status: 'complete',
                    url: publicUrl,
                    type: 'video'
                });
            }
        }

        return NextResponse.json({
            status: 'processing',
            progress: result.metadata?.progress || 0
        });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Status check failed" },
            { status: 500 }
        );
    }
}
