import { z } from 'zod';

export const extractClipSchema = z.object({
    startTime: z.string().regex(/^\d{1,2}:\d{2}$|^\d+$/, "Invalid start time format (MM:SS or seconds)"),
    endTime: z.string().regex(/^\d{1,2}:\d{2}$|^\d+$/, "Invalid end time format (MM:SS or seconds)"),
    clipTitle: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export const jobInputSchema = z.object({
    inputType: z.enum(['video', 'audio', 'text']),
    content: z.string().optional(), // Text content or URL
    // File validation is handled separately via FormData usually, but we can validate metadata here
});

export const postContentSchema = z.object({
    text: z.string().max(280, "Text too long for Twitter"), // Basic limit, platform specific logic needed elsewhere
    platform: z.enum(['youtube', 'twitter', 'tiktok', 'linkedin', 'facebook', 'pinterest']),
});
