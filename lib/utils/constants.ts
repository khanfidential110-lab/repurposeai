// Application constants

export const APP_NAME = 'RepurposeAI';
export const APP_DESCRIPTION = 'AI-powered content repurposing and scheduling for creators';

// Pricing tiers
export const PRICING_TIERS = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            '5 repurposes per month',
            '1 platform connection',
            'Basic AI outputs',
            'Manual downloads',
            'Community support',
        ],
        limits: {
            repurposesPerMonth: 5,
            platforms: 1,
            maxFileSize: 100 * 1024 * 1024, // 100MB
        },
    },
    pro: {
        name: 'Pro',
        price: 29,
        priceId: 'price_pro_monthly', // Stripe Price ID
        features: [
            'Unlimited repurposes',
            'All platform connections',
            'Advanced AI outputs',
            'Auto-scheduling',
            'Priority processing',
            'Email support',
        ],
        limits: {
            repurposesPerMonth: Infinity,
            platforms: Infinity,
            maxFileSize: 500 * 1024 * 1024, // 500MB
        },
    },
    team: {
        name: 'Team',
        price: 99,
        priceId: 'price_team_monthly', // Stripe Price ID
        features: [
            'Everything in Pro',
            'Up to 5 team members',
            'Approval workflows',
            'Shared content library',
            'Analytics dashboard',
            'Priority support',
        ],
        limits: {
            repurposesPerMonth: Infinity,
            platforms: Infinity,
            maxFileSize: 1024 * 1024 * 1024, // 1GB
            teamMembers: 5,
        },
    },
} as const;

// Supported file types
export const SUPPORTED_FILES = {
    video: {
        extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
        mimeTypes: ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska', 'video/webm'],
        maxSize: 500 * 1024 * 1024, // 500MB
    },
    audio: {
        extensions: ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'],
        mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4', 'audio/ogg', 'audio/flac'],
        maxSize: 100 * 1024 * 1024, // 100MB
    },
    text: {
        extensions: ['.txt', '.md'],
        mimeTypes: ['text/plain', 'text/markdown'],
        maxSize: 10 * 1024 * 1024, // 10MB
    },
} as const;

// Social platforms
export const PLATFORMS = {
    youtube: {
        name: 'YouTube',
        icon: 'youtube',
        color: '#FF0000',
        contentTypes: ['video', 'short'],
    },
    twitter: {
        name: 'X (Twitter)',
        icon: 'twitter',
        color: '#1DA1F2',
        contentTypes: ['tweet', 'thread'],
    },
    instagram: {
        name: 'Instagram',
        icon: 'instagram',
        color: '#E4405F',
        contentTypes: ['post', 'reel', 'story'],
    },
    linkedin: {
        name: 'LinkedIn',
        icon: 'linkedin',
        color: '#0A66C2',
        contentTypes: ['post', 'article'],
    },
    tiktok: {
        name: 'TikTok',
        icon: 'tiktok',
        color: '#000000',
        contentTypes: ['video'],
    },
} as const;

// Job status labels and colors
export const JOB_STATUS = {
    pending: { label: 'Pending', color: 'warning' },
    processing: { label: 'Processing', color: 'info' },
    done: { label: 'Completed', color: 'success' },
    failed: { label: 'Failed', color: 'error' },
} as const;

// Navigation items
export const NAV_ITEMS = {
    dashboard: { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    upload: { label: 'Upload', href: '/upload', icon: 'Upload' },
    jobs: { label: 'Jobs', href: '/jobs', icon: 'FileText' },
    workflows: { label: 'Workflows', href: '/workflows', icon: 'Workflow' },
    scheduler: { label: 'Scheduler', href: '/scheduler', icon: 'Calendar' },
    analytics: { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    team: { label: 'Team', href: '/team', icon: 'Users' },
    settings: { label: 'Settings', href: '/settings', icon: 'Settings' },
} as const;

// Error messages
export const ERROR_MESSAGES = {
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
    AUTH_EMAIL_IN_USE: 'This email is already registered',
    AUTH_WEAK_PASSWORD: 'Password is too weak',
    AUTH_USER_NOT_FOUND: 'No account found with this email',
    UPLOAD_FILE_TOO_LARGE: 'File exceeds the maximum size limit',
    UPLOAD_INVALID_TYPE: 'File type not supported',
    USAGE_LIMIT_REACHED: 'You have reached your monthly limit. Upgrade to continue.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;
