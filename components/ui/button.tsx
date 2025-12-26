'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2 font-semibold rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-primary to-secondary text-white
        hover:opacity-90 hover:-translate-y-0.5
        focus:ring-primary shadow-lg shadow-primary/25
      `,
            secondary: `
        bg-surface border border-border text-foreground
        hover:bg-surface-hover hover:border-border-hover
        focus:ring-border
      `,
            outline: `
        bg-transparent border border-border text-foreground
        hover:bg-surface hover:text-foreground
        focus:ring-border
      `,
            ghost: `
        bg-transparent text-foreground-muted
        hover:bg-surface hover:text-foreground
        focus:ring-border
      `,
            danger: `
        bg-error text-white
        hover:bg-error/90 hover:-translate-y-0.5
        focus:ring-error shadow-lg shadow-error/25
      `,
        };

        const sizes = {
            sm: 'px-4 py-2.5 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
            icon: 'p-2',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!loading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
