'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FileText,
    FileVideo,
    FileAudio,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    MoreVertical,
    Trash2,
    Eye,
    Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/helpers';

interface Job {
    id: string;
    inputFileName: string;
    inputType: 'video' | 'audio' | 'text';
    status: 'pending' | 'processing' | 'done' | 'failed';
    outputs: any[];
    createdAt: string;
}

const statusConfig = {
    done: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
    processing: { label: 'Processing', variant: 'info' as const, icon: Loader2 },
    pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
    failed: { label: 'Failed', variant: 'error' as const, icon: AlertCircle },
};

const typeIcons = {
    video: FileVideo,
    audio: FileAudio,
    text: FileText,
};

export default function JobsPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/jobs');
                const data = await response.json();
                if (data.jobs) {
                    setJobs(data.jobs);
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.inputFileName?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || job.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 sm:p-12 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-100">Empire</span> 🎬
                    </h1>
                    <p className="text-lg sm:text-xl text-emerald-100 font-medium leading-relaxed max-w-xl">
                        Track, manage, and optimize your repurposing pipeline in one place.
                    </p>
                </div>

                <div className="relative z-10">
                    <Link href="/upload">
                        <Button
                            size="lg"
                            className="bg-white text-emerald-600 hover:bg-emerald-50 border-none shadow-lg hover:ring-4 hover:ring-white/20 transition-all font-bold text-lg px-8 py-6"
                        >
                            <FileVideo className="w-5 h-5 mr-2" />
                            New Upload
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="relative flex-1 max-w-md">
                    <Input
                        type="text"
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search className="w-5 h-5" />}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'done', 'processing', 'pending', 'failed'].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className="whitespace-nowrap"
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Jobs List */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card variant="glass">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">
                                            File
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">
                                            Type
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">
                                            Outputs
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">
                                            Created
                                        </th>
                                        <th className="text-right py-4 px-6 text-sm font-medium text-foreground-muted">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                                <p className="mt-2 text-foreground-muted">Loading jobs...</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredJobs.map((job, index) => {
                                            const status = statusConfig[job.status as keyof typeof statusConfig];
                                            const TypeIcon = typeIcons[job.inputType as keyof typeof typeIcons] || FileText;

                                            return (
                                                <motion.tr
                                                    key={job.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                                                >
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-11 h-11 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                                                                <TypeIcon className="w-5 h-5 text-foreground-muted" />
                                                            </div>
                                                            <span className="font-medium text-foreground truncate max-w-[250px]">
                                                                {job.inputFileName || 'Untitled'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-foreground-muted capitalize">
                                                            {job.inputType}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Badge variant={status?.variant || 'warning'} icon>
                                                            {job.status === 'processing' && (
                                                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                            )}
                                                            {status?.label || job.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-foreground-muted">
                                                            {job.outputs?.length > 0 ? `${job.outputs.length} items` : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-foreground-muted">
                                                            {formatRelativeTime(new Date(job.createdAt))}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/jobs/${job.id}`}>
                                                                <Button variant="ghost" size="sm" className="p-2">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            {job.status === 'done' && (
                                                                <Button variant="ghost" size="sm" className="p-2">
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button variant="ghost" size="sm" className="p-2 text-error hover:text-error">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredJobs.length === 0 && (
                            <EmptyState
                                title="No jobs found"
                                description={search ? 'Try adjusting your search' : 'Upload your first piece of content to get started.'}
                                icon={FileText}
                                actionLabel="Upload Content"
                                onAction={() => router.push('/upload')}
                            />
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div >
    );
}
