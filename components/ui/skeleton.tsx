'use client';

import { cn } from '@/lib/utils/helpers';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('skeleton', className)} />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr>
            <td className="p-4">
                <Skeleton className="h-4 w-32" />
            </td>
            <td className="p-4">
                <Skeleton className="h-4 w-24" />
            </td>
            <td className="p-4">
                <Skeleton className="h-6 w-16 rounded-full" />
            </td>
            <td className="p-4">
                <Skeleton className="h-4 w-20" />
            </td>
            <td className="p-4">
                <Skeleton className="h-8 w-8 rounded" />
            </td>
        </tr>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card p-6">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="glass-card p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
            </div>

            {/* Table */}
            <div className="glass-card p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Skeleton;
