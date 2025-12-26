export type Platform = 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'pinterest' | 'google_drive' | 'dropbox';

export type WorkflowTrigger = {
    platform: Platform;
    event: 'new_post' | 'new_video';
    kewordFilter?: string; // Optional: Only sync if caption contains #tag
};

export type WorkflowAction = {
    platform: Platform;
    type: 'upload_video' | 'create_post';
    settings: {
        privacy?: 'public' | 'private' | 'unlisted';
        removeWatermark?: boolean;
        addIntro?: boolean;
        addOutro?: boolean;
        titleTemplate?: string; // e.g., "{{original_title}} #shorts"
        descriptionTemplate?: string;
    };
};

export type Workflow = {
    id: string;
    userId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
    lastRunAt?: string;
    createdAt: string;
    stats: {
        processedCount: number;
        failureCount: number;
    };
};

// Example workflow configuration
export const DEFAULT_WORKFLOW_TEMPLATES: Partial<Workflow>[] = [
    {
        name: "TikTok to YouTube Shorts",
        trigger: { platform: 'tiktok', event: 'new_video' },
        actions: [{
            platform: 'youtube',
            type: 'upload_video',
            settings: { removeWatermark: true, titleTemplate: "{{original_title}} #shorts" }
        }]
    },
    {
        name: "YouTube to LinkedIn",
        trigger: { platform: 'youtube', event: 'new_video' },
        actions: [{
            platform: 'linkedin',
            type: 'create_post',
            settings: { titleTemplate: "New video alert: {{original_title}}" }
        }]
    }
];
