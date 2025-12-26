import { getActiveWorkflowTriggers, logWorkflowRun } from './store';
import { downloadVideoWithoutWatermark } from '@/lib/video/watermark';
import { postToMultiplePlatforms } from '@/lib/platforms/posting-service';
import { Workflow } from './types';

/**
 * Main function to check all active workflows and trigger processing.
 * This should be called by a Cron Job (e.g., every hour).
 */
export async function checkWorkflows() {
    const activeWorkflows = getActiveWorkflowTriggers();
    console.log(`[Engine] Checking ${activeWorkflows.length} active workflows...`);

    const results = await Promise.allSettled(
        activeWorkflows.map(workflow => processWorkflow(workflow))
    );

    return results;
}

/**
 * Process a single workflow:
 * 1. Check source platform for new content
 * 2. If new content found -> Download (remove watermark)
 * 3. Repost to destination
 */
async function processWorkflow(workflow: Workflow) {
    try {
        // 1. Check Source (Mocked for MVP)
        // In reality, we would call: platforms[workflow.trigger.platform].getLatestPost()
        // and compare ID with lastProcessedId stored in DB.

        console.log(`[Engine] Processing workflow: ${workflow.name} (${workflow.id})`);

        // MOCK: Let's assume we "found" a new video from TikTok
        const mockNewVideo = {
            id: 'mock_tiktok_video_123',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Safe sample video
            title: 'My amazing viral video #fyp',
        };

        // 2. Download & Process
        // Only download if we haven't processed this ID yet (Logic skipped for MVP demo)

        let videoBuffer: Buffer;
        if (workflow.actions.some(a => a.settings.removeWatermark)) {
            videoBuffer = await downloadVideoWithoutWatermark(mockNewVideo.url, 'tiktok');
        } else {
            // Just fetch directly
            const response = await fetch(mockNewVideo.url);
            videoBuffer = Buffer.from(await response.arrayBuffer());
        }

        // 3. Post to Destination
        for (const action of workflow.actions) {
            console.log(`[Engine] Executing action: Post to ${action.platform}`);

            // Generate title/description based on template
            const title = action.settings.titleTemplate
                ? action.settings.titleTemplate.replace('{{original_title}}', mockNewVideo.title)
                : mockNewVideo.title;

            await postToMultiplePlatforms(
                [action.platform],
                {
                    text: title,
                    media: [new File([videoBuffer], 'video.mp4', { type: 'video/mp4' })] // Mock File object
                }
            );
        }

        // 4. Log Success
        logWorkflowRun(workflow.id, true);
        console.log(`[Engine] Workflow ${workflow.id} completed successfully.`);

    } catch (error) {
        console.error(`[Engine] Workflow ${workflow.id} failed:`, error);
        logWorkflowRun(workflow.id, false);
    }
}
