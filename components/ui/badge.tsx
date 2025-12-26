'use client';

import { cn } from '@/lib/utils/helpers';
import { Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface BadgeProps {
    className?: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    children: React.ReactNode;
    icon?: boolean;
}

export function Badge({
    className,
    variant = 'default',
    children,
    icon = false,
}: BadgeProps) {
    const variants = {
        default: 'bg-surface text-foreground-muted',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
        info: 'bg-info/10 text-info',
    };

    const icons = {
        default: null,
        success: <Check size={12} />,
        warning: <AlertTriangle size={12} />,
        error: <AlertCircle size={12} />,
        info: <Info size={12} />,
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {icon && icons[variant]}
            {children}
        </span>
    );
}

export default Badge;
