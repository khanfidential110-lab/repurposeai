'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/helpers';

interface CardProps {
    className?: string;
    children: ReactNode;
    variant?: 'default' | 'glass' | 'glow';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    className,
    children,
    variant = 'default',
    hover = false,
    padding = 'md',
}: CardProps) {
    const variants = {
        default: 'bg-background-secondary border border-border',
        glass: 'glass-card',
        glow: 'glass-card-glow',
    };

    const paddings = {
        none: '',
        sm: 'p-5',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                'rounded-2xl',
                variants[variant],
                paddings[padding],
                hover && 'hover-lift cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    className?: string;
    children: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
    return (
        <div className={cn('mb-5 pb-4 border-b border-border/50', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    className?: string;
    children: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
    return (
        <h3 className={cn('text-xl font-bold text-foreground', className)}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    className?: string;
    children: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-foreground-muted mt-2', className)}>
            {children}
        </p>
    );
}

interface CardContentProps {
    className?: string;
    children: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    className?: string;
    children: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
    return (
        <div className={cn('mt-6 pt-5 border-t border-border', className)}>
            {children}
        </div>
    );
}

export default Card;
