'use client';

import { cn } from '@/lib/utils/helpers';

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

export function Progress({
    value,
    max = 100,
    className,
    showLabel = false,
    variant = 'default',
    size = 'md',
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
        default: 'from-primary to-secondary',
        success: 'from-success to-success',
        warning: 'from-warning to-warning',
        error: 'from-error to-error',
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between mb-2 text-sm">
                    <span className="text-foreground-muted">Progress</span>
                    <span className="text-foreground font-medium">{Math.round(percentage)}%</span>
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-surface rounded-full overflow-hidden',
                    sizes[size]
                )}
            >
                <div
                    className={cn(
                        'h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out',
                        variants[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default Progress;
