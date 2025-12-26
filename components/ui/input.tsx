'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils/helpers';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={cn(
                            `w-full px-4 py-3 bg-background-secondary border rounded-xl
              text-foreground placeholder:text-foreground-muted/60
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed`,
                            leftIcon && 'pl-12',
                            (rightIcon || isPassword) && 'pr-12',
                            error
                                ? 'border-error focus:ring-error/50 focus:border-error'
                                : 'border-border hover:border-border-hover',
                            className
                        )}
                        disabled={disabled}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                    {!isPassword && rightIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {(error || hint) && (
                    <p
                        className={cn(
                            'mt-2 text-sm',
                            error ? 'text-error' : 'text-foreground-muted'
                        )}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
