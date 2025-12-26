'use client';

import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Youtube,
    Linkedin,
    Instagram,
    Facebook,
    Twitter,
    Video,
    Film,
    Scissors,
    Wand2
} from 'lucide-react';

const icons: Record<string, any> = {
    youtube: Youtube,
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    tiktok: Video // Using Video as generic fallback or TikTok icon if available
};

// --- Source Node ---
export function SourceNode({ data }: { data: { platform: string; event: string } }) {
    const Icon = icons[data.platform] || Film;

    return (
        <Card className="min-w-[250px] border-l-4 border-l-primary shadow-lg bg-card/95 backdrop-blur">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Trigger
                    </CardTitle>
                    <Icon className="w-5 h-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="font-semibold text-lg capitalize mb-1">
                    {data.platform}
                </div>
                <Badge variant="info" className="text-xs">
                    {data.event.replace('_', ' ')}
                </Badge>
            </CardContent>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
        </Card>
    );
}

// --- Action Node ---
export function ActionNode({ data }: { data: { platform: string; action: string; settings?: any } }) {
    const Icon = icons[data.platform] || Wand2;

    return (
        <Card className="min-w-[250px] border-l-4 border-l-secondary shadow-lg bg-card/95 backdrop-blur">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-secondary" />
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Action
                    </CardTitle>
                    <Icon className="w-5 h-5 text-secondary" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="font-semibold text-lg capitalize mb-1">
                    {data.platform}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                    {data.action.replace('_', ' ')}
                </p>
                {data.settings?.removeWatermark && (
                    <Badge variant="default" className="text-[10px] mr-1">
                        No Watermark
                    </Badge>
                )}
            </CardContent>
            {/* Optional source handle for chaining multiple actions */}
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-secondary" />
        </Card>
    );
}
