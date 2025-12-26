'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    Copy,
    Check,
    FileText,
    Video,
    Twitter,
    Youtube,
    Instagram,
    Linkedin,
    Hash,
    Scissors,
    MessageSquare,
    Clock,
    CheckCircle,
    Share2,
    Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';



const platformIcons: Record<string, React.ElementType> = {
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    linkedin: Linkedin,
};

export default function JobDetailPage() {
    const [job, setJob] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [extractingClip, setExtractingClip] = useState<string | null>(null);
    const [pendingClip, setPendingClip] = useState<any | null>(null);
    const params = useParams();

    // Handle clip extraction
    const handleExtractClip = async (clip: any) => {
        setPendingClip(clip);
        // Trigger file input
        const fileInput = document.getElementById('clip-video-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    const processClipExtraction = async (file: File) => {
        if (!pendingClip) return;

        const clip = pendingClip;
        setExtractingClip(clip.title);
        toast.loading(`Extracting "${clip.title}"...`, { id: 'extracting' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('startTime', clip.startTime || clip.start || '0:00');
            formData.append('endTime', clip.endTime || clip.end || '0:00');
            formData.append('clipTitle', clip.title);

            const response = await fetch('/api/clips/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to extract clip');
            }

            // Download the clip
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`"${clip.title}" extracted successfully!`, { id: 'extracting' });
        } catch (error: any) {
            console.error('Clip extraction error:', error);
            toast.error(error.message || 'Failed to extract clip', { id: 'extracting' });
        } finally {
            setExtractingClip(null);
            setPendingClip(null);
        }
    };

    // In Next 15, params is a promise.

    // Helper to clean and parse JSON
    const safeParseJSON = (content: string) => {
        if (!content) return null;
        if (typeof content !== 'string') return content;

        let jsonStr = content;

        try {
            // Try to extract JSON from markdown code blocks
            const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonBlockMatch) {
                jsonStr = jsonBlockMatch[1].trim();
            } else {
                // Try to find JSON object or array in the content
                const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1];
                }
            }

            // Fix common AI JSON issues:
            // 1. Unquoted time values like 0:00 -> "0:00"
            jsonStr = jsonStr.replace(/:\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*([,}\]])/g, ': "$1"$2');
            // 2. Trailing commas before closing brackets
            jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
            // 3. Single quotes to double quotes
            jsonStr = jsonStr.replace(/'/g, '"');

            return JSON.parse(jsonStr);
        } catch (e) {
            // Try one more time: just extract the object/array after preprocessing
            try {
                const lastTry = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                if (lastTry) {
                    return JSON.parse(lastTry[1]);
                }
            } catch { }

            console.warn('Failed to parse JSON, returning raw content');
            // Return the raw content as a fallback for non-JSON outputs
            return typeof content === 'string' ? content : null;
        }
    };

    // Helper to parse string content (remove quotes if double stringified)
    const parseStringContent = (content: string) => {
        if (!content) return '';
        if (typeof content !== 'string') return content;
        // Sometimes it's double stringified like "\"Text...\""
        if (content.startsWith('"') && content.endsWith('"')) {
            try {
                return JSON.parse(content);
            } catch {
                return content;
            }
        }
        return content;
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // In Next.js 15, we might need to await params
                // But typically params.id is available.
                // If using standard router:
                // const id = params.id;

                // Let's try to get ID from window if params is tricky in strict mode, but params should work.
                // Assuming params is available.

                const response = await fetch(`/api/jobs?id=${(params as any).id}`);
                const data = await response.json();

                if (data.job) {
                    const formattedJob = {
                        ...data.job,
                        outputs: data.job.outputs.reduce((acc: any, out: any) => {
                            let content: any = out.content;

                            // Keep trying to parse until it's not a string anymore or can't be parsed
                            const maxAttempts = 3;
                            for (let i = 0; i < maxAttempts && typeof content === 'string'; i++) {
                                // Try safeParseJSON for structured types
                                if (['summary', 'youtubeOptimization', 'hashtags', 'clips', 'clipSuggestions'].includes(out.type)) {
                                    const parsed = safeParseJSON(content);
                                    if (parsed && typeof parsed !== 'string') {
                                        content = parsed;
                                        break;
                                    }
                                }

                                // Try standard JSON.parse
                                try {
                                    const parsed = JSON.parse(content);
                                    content = parsed;
                                } catch {
                                    break; // Can't parse further
                                }
                            }

                            // Map types
                            if (out.type === 'clipSuggestions') acc.clips = content;
                            else acc[out.type] = content;

                            return acc;
                        }, {})
                    };
                    setJob(formattedJob);
                } else {
                    toast.error('Job not found');
                }
            } catch (error) {
                console.error('Error fetching job:', error);
                toast.error('Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        };

        if (params?.id) {
            fetchJob();
        }
    }, [params]);

    const copyToClipboard = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedSection(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Job not found</h2>
                <Link href="/jobs" className="text-primary hover:underline">Return to jobs</Link>
            </div>
        );
    }

    const CopyButton = ({ text, section }: { text: string; section: string }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(text, section)}
            leftIcon={copiedSection === section ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        >
            {copiedSection === section ? 'Copied!' : 'Copy'}
        </Button>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between"
            >
                <div>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">{job.inputFileName || 'Job Details'}</h1>
                    <div className="flex items-center gap-3">
                        <Badge variant={job.status === 'done' ? 'success' : job.status === 'failed' ? 'error' : 'warning'} icon>
                            {job.status === 'done' ? 'Completed' : job.status}
                        </Badge>
                        <span className="text-foreground-muted text-sm">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(job.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" leftIcon={<Calendar className="w-4 h-4" />}>
                        Schedule
                    </Button>
                    <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                        Download All
                    </Button>
                </div>
            </motion.div>

            {/* Summary */}
            {job.outputs?.summary && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Content Summary
                            </CardTitle>
                            <CopyButton
                                text={typeof job.outputs.summary === 'string' ? job.outputs.summary : (job.outputs.summary.paragraph || '')}
                                section="summary"
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {typeof job.outputs.summary === 'string' ? (
                                <pre className="whitespace-pre-wrap text-foreground-muted font-sans text-sm">{job.outputs.summary}</pre>
                            ) : (
                                <>
                                    {job.outputs.summary.oneLiner && (
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                                            <p className="text-lg font-medium">{job.outputs.summary.oneLiner}</p>
                                        </div>
                                    )}
                                    <p className="text-foreground-muted">{job.outputs.summary.paragraph}</p>
                                    {job.outputs.summary.takeaways && Array.isArray(job.outputs.summary.takeaways) && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Key Takeaways:</h4>
                                            <ul className="space-y-2">
                                                {job.outputs.summary.takeaways.map((takeaway: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                                                        <span className="text-foreground-muted">{takeaway}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Platform Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-6"
            >
                {/* Twitter Thread */}
                {job.outputs?.twitterThread && (
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                                Twitter Thread
                            </CardTitle>
                            <div className="flex gap-2">
                                <CopyButton text={job.outputs.twitterThread} section="twitter" />
                                <Button variant="secondary" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
                                    Post
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-foreground-muted font-sans text-sm p-4 rounded-xl bg-surface">
                                {job.outputs.twitterThread}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Instagram Caption */}
                {job.outputs?.instagramCaption && (
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Instagram className="w-5 h-5 text-[#E4405F]" />
                                Instagram Caption
                            </CardTitle>
                            <CopyButton text={job.outputs.instagramCaption} section="instagram" />
                        </CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-foreground-muted font-sans text-sm p-4 rounded-xl bg-surface">
                                {job.outputs.instagramCaption}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* LinkedIn Post */}
                {job.outputs?.linkedinPost && (
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                LinkedIn Post
                            </CardTitle>
                            <CopyButton text={job.outputs.linkedinPost} section="linkedin" />
                        </CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-foreground-muted font-sans text-sm p-4 rounded-xl bg-surface">
                                {job.outputs.linkedinPost}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* YouTube Optimization */}
                {job.outputs?.youtubeOptimization && (
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Youtube className="w-5 h-5 text-[#FF0000]" />
                                YouTube Optimization
                            </CardTitle>
                            <CopyButton
                                text={`${job.outputs.youtubeOptimization.title}\n\n${job.outputs.youtubeOptimization.description}`}
                                section="youtube"
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Title:</h4>
                                <p className="text-foreground-muted p-3 rounded-lg bg-surface">
                                    {job.outputs.youtubeOptimization.title}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Description:</h4>
                                <pre className="whitespace-pre-wrap text-foreground-muted font-sans text-sm p-4 rounded-xl bg-surface">
                                    {job.outputs.youtubeOptimization.description}
                                </pre>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Tags:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.outputs.youtubeOptimization.tags?.map((tag: string) => (
                                        <Badge key={tag} variant="default">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Hashtags */}
                {job.outputs?.hashtags && (
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hash className="w-5 h-5 text-primary" />
                                Optimized Hashtags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {job.outputs.hashtags.high && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground-muted mb-2">High Volume</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.outputs.hashtags.high.map((tag: string) => (
                                            <Badge key={tag} variant="success">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {job.outputs.hashtags.medium && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground-muted mb-2">Medium Volume</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.outputs.hashtags.medium.map((tag: string) => (
                                            <Badge key={tag} variant="warning">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {job.outputs.hashtags.niche && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground-muted mb-2">Niche</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.outputs.hashtags.niche.map((tag: string) => (
                                            <Badge key={tag} variant="info">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}


                {/* Clip Suggestions */}
                {job.outputs?.clips && Array.isArray(job.outputs.clips) && job.outputs.clips.length > 0 && (
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-secondary" />
                                Suggested Clips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground-muted mb-4">
                                Click Extract and select your original video to create the clip
                            </p>
                            <div className="grid gap-4">
                                {job.outputs.clips.map((clip: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-surface">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                                            <Video className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{clip.title}</h4>
                                            <p className="text-sm text-foreground-muted">{clip.reason || clip.description}</p>
                                            <p className="text-xs text-foreground-muted mt-1">
                                                {clip.startTime || clip.start || '0:00'} - {clip.endTime || clip.end || '0:00'}
                                                {clip.viralPotential && <span className="ml-2 text-primary">🔥 {clip.viralPotential}/10</span>}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleExtractClip(clip)}
                                            disabled={extractingClip === clip.title}
                                        >
                                            {extractingClip === clip.title ? 'Extracting...' : 'Extract'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Hidden file input for clip extraction */}
            <input
                type="file"
                id="clip-video-input"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        processClipExtraction(file);
                    }
                    e.target.value = ''; // Reset for next selection
                }}
            />
        </div>
    );
}
