import { NextRequest, NextResponse } from 'next/server';
import { generateAI } from '@/lib/ai/provider';
import { getPromptForTask, SYSTEM_PROMPTS } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, contentType, platforms = ['twitter', 'youtube', 'instagram', 'linkedin'] } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Generate outputs in parallel
        console.log('Starting parallel AI generation tasks...');
        const outputs: Record<string, unknown> = {};
        const tasks: Promise<void>[] = [];

        // 1. Summary
        tasks.push((async () => {
            outputs.summary = await generateAI(
                getPromptForTask('summary'),
                `Please analyze and summarize this content:\n\n${content}`,
                { temperature: 0.7, maxTokens: 1000 }
            );
        })());

        // 2. Twitter Thread
        if (platforms.includes('twitter')) {
            tasks.push((async () => {
                outputs.twitterThread = await generateAI(
                    getPromptForTask('thread'),
                    `Create a viral Twitter/X thread from this content:\n\n${content}`,
                    { temperature: 0.8, maxTokens: 2000 }
                );
            })());
        }

        // 3. Instagram Caption
        if (platforms.includes('instagram')) {
            tasks.push((async () => {
                outputs.instagramCaption = await generateAI(
                    getPromptForTask('caption'),
                    `Create an engaging Instagram caption from this content:\n\n${content}`,
                    { temperature: 0.8, maxTokens: 1500 }
                );
            })());
        }

        // 4. YouTube Optimization
        if (platforms.includes('youtube')) {
            tasks.push((async () => {
                outputs.youtubeOptimization = await generateAI(
                    getPromptForTask('youtube'),
                    `Create YouTube SEO-optimized title, description, and tags for this content:\n\n${content}`,
                    { temperature: 0.7, maxTokens: 2000 }
                );
            })());
        }

        // 5. LinkedIn Post
        if (platforms.includes('linkedin')) {
            tasks.push((async () => {
                outputs.linkedinPost = await generateAI(
                    getPromptForTask('linkedin'),
                    `Adapt this content for a professional LinkedIn post:\n\n${content}`,
                    { temperature: 0.7, maxTokens: 1500 }
                );
            })());
        }

        // 6. Hashtags
        tasks.push((async () => {
            outputs.hashtags = await generateAI(
                getPromptForTask('hashtags'),
                `Generate optimized hashtags for this content:\n\n${content}`,
                { temperature: 0.7, maxTokens: 500 }
            );
        })());

        // 7. Clips
        if (contentType === 'video' || contentType === 'audio') {
            tasks.push((async () => {
                outputs.clipSuggestions = await generateAI(
                    getPromptForTask('clips'),
                    `Identify the best moments for short clips from this transcription:\n\n${content}`,
                    { temperature: 0.7, maxTokens: 1500 }
                );
            })());
        }

        await Promise.all(tasks);

        // Debug: log what was generated
        console.log('Generated outputs:', {
            hasClips: !!outputs.clipSuggestions,
            hasYoutube: !!outputs.youtubeOptimization,
            hasSummary: !!outputs.summary,
            clipsPreview: outputs.clipSuggestions ? String(outputs.clipSuggestions).substring(0, 100) : 'none',
            youtubePreview: outputs.youtubeOptimization ? String(outputs.youtubeOptimization).substring(0, 100) : 'none',
        });

        return NextResponse.json({
            success: true,
            outputs,
            message: 'Content repurposed successfully',
        });
    } catch (error) {
        console.error('AI repurpose error:', error);
        return NextResponse.json(
            { error: 'Failed to process content. Please try again.' },
            { status: 500 }
        );
    }
}
