'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/50 rounded-xl bg-muted/20",
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-primary/5">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="lg">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
