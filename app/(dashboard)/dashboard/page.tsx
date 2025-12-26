'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Upload,
    FileText,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/helpers';

// Mock data for demo
const user = {
    name: 'Demo User',
    usageCount: 3,
};

const stats = [
    { label: 'Total Repurposes', value: '47', icon: Zap, trend: '+12%' },
    { label: 'Posts Scheduled', value: '23', icon: Clock, trend: '+8%' },
    { label: 'Published', value: '156', icon: TrendingUp, trend: '+24%' },
    { label: 'Engagement', value: '2.4K', icon: Sparkles, trend: '+18%' },
];

const recentJobs = [
    {
        id: '1',
        name: 'Tech Review Podcast Ep. 45.mp3',
        type: 'audio',
        status: 'done',
        outputs: 5,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: '2',
        name: 'Product Launch Video.mp4',
        type: 'video',
        status: 'processing',
        outputs: 0,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
        id: '3',
        name: 'Weekly Newsletter.md',
        type: 'text',
        status: 'done',
        outputs: 8,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: '4',
        name: 'Interview with CEO.mp4',
        type: 'video',
        status: 'failed',
        outputs: 0,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
];

const statusConfig = {
    done: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
    processing: { label: 'Processing', variant: 'info' as const, icon: Clock },
    pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
    failed: { label: 'Failed', variant: 'error' as const, icon: AlertCircle },
};

export default function DashboardPage() {
    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* Welcome Header */}
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl mb-8"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                                Ready to go viral, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">{user.name.split(' ')[0]}?</span> 🚀
                            </h1>
                            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl font-medium leading-relaxed">
                                You have <span className="text-white font-bold">{5 - user.usageCount} repurposes</span> remaining this month.
                                Let's turn your content into magic.
                            </p>
                        </div>
                        <Link href="/upload">
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg hover:ring-4 hover:ring-white/20 transition-all font-bold text-lg px-8 py-6">
                                <Upload className="w-6 h-6 mr-2" />
                                Start Creating
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {stats.map((stat, index) => (
                    <Card key={stat.label} variant="glass" hover>
                        <CardContent className="p-5 sm:p-7">
                            <div className="flex items-center justify-between mb-4 sm:mb-5">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                                </div>
                                <Badge variant="success" className="text-xs px-3 py-1">{stat.trend}</Badge>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold mb-2">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Link href="/upload">
                    <Card variant="glass" hover className="group cursor-pointer">
                        <CardContent className="p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Upload New Content</h3>
                                <p className="text-sm sm:text-base text-foreground-muted">
                                    Drop a video, audio, or text file
                                </p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all hidden sm:block" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/scheduler">
                    <Card variant="glass" hover className="group cursor-pointer">
                        <CardContent className="p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Schedule Posts</h3>
                                <p className="text-sm sm:text-base text-foreground-muted">
                                    Plan and automate your calendar
                                </p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-foreground-muted group-hover:text-secondary group-hover:translate-x-1 transition-all hidden sm:block" />
                        </CardContent>
                    </Card>
                </Link>
            </motion.div>

            {/* Recent Jobs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
                        <CardTitle className="text-base sm:text-lg">Recent Jobs</CardTitle>
                        <Link href="/jobs">
                            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                <span className="hidden sm:inline">View All</span>
                                <span className="sm:hidden">All</span>
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        {/* Mobile Card View */}
                        <div className="sm:hidden space-y-3">
                            {recentJobs.map((job) => {
                                const status = statusConfig[job.status as keyof typeof statusConfig];
                                return (
                                    <Link key={job.id} href={`/jobs/${job.id}`}>
                                        <div className="p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-foreground-muted" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{job.name}</p>
                                                    <p className="text-xs text-foreground-muted" suppressHydrationWarning>{formatRelativeTime(job.createdAt)}</p>
                                                </div>
                                                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-foreground-muted pl-11">
                                                <span className="capitalize">{job.type}</span>
                                                <span>{job.outputs > 0 ? `${job.outputs} outputs` : '-'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">File</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">Outputs</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">Created</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-muted">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentJobs.map((job) => {
                                        const status = statusConfig[job.status as keyof typeof statusConfig];
                                        return (
                                            <tr
                                                key={job.id}
                                                className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-foreground-muted" />
                                                        </div>
                                                        <span className="font-medium text-foreground truncate max-w-[200px]">
                                                            {job.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-foreground-muted capitalize">{job.type}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant={status.variant} icon>{status.label}</Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-foreground-muted">
                                                        {job.outputs > 0 ? `${job.outputs} items` : '-'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-foreground-muted">
                                                        <span suppressHydrationWarning>{formatRelativeTime(job.createdAt)}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <Link href={`/jobs/${job.id}`}>
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {recentJobs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-foreground-muted" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
                                <p className="text-foreground-muted mb-4">
                                    Upload your first piece of content to get started
                                </p>
                                <Link href="/upload">
                                    <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
                                        Upload Content
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
