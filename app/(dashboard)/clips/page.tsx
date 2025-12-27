'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Wand2,
    Scissors,
    Download,
    Play,
    Loader2,
    Clock,
    FileVideo,
    Sparkles,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Cloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils/helpers';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@/lib/hooks/use-auth';
import toast from 'react-hot-toast';

interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}

interface SuggestedClip {
    index: number;
    start: number;
    end: number;
    duration: number;
    text: string;
    reason: string;
    downloadUrl?: string;
}

interface ExtractionResult {
    success: boolean;
    transcript: string;
    duration: number;
    segments: TranscriptSegment[];
    suggestedClips: SuggestedClip[];
    extractedCount: number;
    message: string;
}

export default function ClipsPage() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [result, setResult] = useState<ExtractionResult | null>(null);
    const [expandedClip, setExpandedClip] = useState<number | null>(null);
    const [showTranscript, setShowTranscript] = useState(false);

    // Settings
    const [numClips, setNumClips] = useState(3);
    const [style, setStyle] = useState<'viral' | 'educational' | 'funny'>('viral');
    const [autoExtract, setAutoExtract] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<'original' | '9:16' | '1:1' | '16:9' | '4:5'>('9:16');

    // Aspect ratio options for social platforms
    const ASPECT_OPTIONS = [
        { value: 'original', label: 'Original', desc: 'Keep original size' },
        { value: '9:16', label: 'TikTok / Reels', desc: 'Vertical (9:16)' },
        { value: '1:1', label: 'Instagram Square', desc: 'Square (1:1)' },
        { value: '16:9', label: 'YouTube', desc: 'Landscape (16:9)' },
        { value: '4:5', label: 'Instagram Feed', desc: 'Portrait (4:5)' },
    ];

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            setFile(droppedFile);
            setResult(null);
        } else {
            toast.error('Please drop a video file');
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const processVideo = async () => {
        if (!file) return;

        setProcessing(true);
        setUploadProgress(0);
        setProgress('Uploading to cloud...');
        setResult(null);

        try {
            // Step 1: Upload video to Firebase Storage
            const userId = user?.uid || 'anonymous';
            const { url: videoUrl } = await uploadFile(
                userId,
                file,
                (progress) => {
                    setUploadProgress(progress);
                    setProgress(`Uploading... ${Math.round(progress)}%`);
                }
            );

            setProgress('Processing video with AI...');
            setUploadProgress(100);

            // Step 2: Send URL to API for processing (no file size limit!)
            const response = await fetch('/api/clips/smart-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoUrl,
                    numClips,
                    style,
                    autoExtract,
                    aspectRatio,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process video');
            }

            setProgress('Processing complete!');
            const data: ExtractionResult = await response.json();
            setResult(data);

            toast.success(data.message);
        } catch (error) {
            console.error('Processing error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process video');
        } finally {
            setProcessing(false);
            setProgress('');
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const downloadClip = (clip: SuggestedClip) => {
        if (!clip.downloadUrl) {
            toast.error('Clip not available for download');
            return;
        }

        const link = document.createElement('a');
        link.href = clip.downloadUrl;
        link.download = `clip_${clip.index + 1}_${clip.start.toFixed(0)}s-${clip.end.toFixed(0)}s.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded clip ${clip.index + 1}`);
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        Smart Clip Extractor
                    </h1>
                    <p className="text-foreground-muted">
                        AI-powered video clip extraction • 100% Free
                    </p>
                </div>

                {/* Upload Zone */}
                <motion.div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
                        ? 'border-primary bg-primary/5'
                        : file
                            ? 'border-success bg-success/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={processing}
                    />

                    {file ? (
                        <div className="space-y-3">
                            <FileVideo className="w-12 h-12 mx-auto text-success" />
                            <div>
                                <p className="font-medium text-lg">{file.name}</p>
                                <p className="text-foreground-muted text-sm">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setResult(null);
                                }}
                            >
                                Change File
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Upload className="w-12 h-12 mx-auto text-foreground-muted" />
                            <div>
                                <p className="font-medium text-lg">
                                    Drop your video here or click to browse
                                </p>
                                <p className="text-foreground-muted text-sm">
                                    Supports MP4, MOV, WebM • Max 4MB
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Settings */}
                {file && !result && (
                    <motion.div
                        className="card p-6 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="font-semibold flex items-center gap-2">
                            <Wand2 className="w-5 h-5" />
                            Extraction Settings
                        </h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Number of Clips */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Number of Clips
                                </label>
                                <select
                                    value={numClips}
                                    onChange={(e) => setNumClips(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border"
                                    disabled={processing}
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {n} clip{n > 1 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Style */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Content Style
                                </label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value as typeof style)}
                                    className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border"
                                    disabled={processing}
                                >
                                    <option value="viral">Viral / Engaging</option>
                                    <option value="educational">Educational</option>
                                    <option value="funny">Funny / Entertainment</option>
                                </select>
                            </div>

                            {/* Platform / Aspect Ratio */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    📱 Platform Format
                                </label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
                                    className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border"
                                    disabled={processing}
                                >
                                    {ASPECT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label} ({opt.desc})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Auto Extract */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Auto Extract
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoExtract}
                                        onChange={(e) => setAutoExtract(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                        disabled={processing}
                                    />
                                    <span className="text-sm">
                                        Generate downloadable clips
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Process Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={processVideo}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {progress}
                                </>
                            ) : (
                                <>
                                    <Scissors className="w-5 h-5 mr-2" />
                                    Extract Smart Clips
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="card p-4 text-center">
                                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-2xl font-bold">
                                        {formatTime(result.duration)}
                                    </p>
                                    <p className="text-sm text-foreground-muted">Duration</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <FileVideo className="w-6 h-6 mx-auto mb-2 text-success" />
                                    <p className="text-2xl font-bold">
                                        {result.segments.length}
                                    </p>
                                    <p className="text-sm text-foreground-muted">Segments</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <Scissors className="w-6 h-6 mx-auto mb-2 text-warning" />
                                    <p className="text-2xl font-bold">
                                        {result.suggestedClips.length}
                                    </p>
                                    <p className="text-sm text-foreground-muted">AI Clips</p>
                                </div>
                            </div>

                            {/* Suggested Clips */}
                            <div className="card p-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    AI-Selected Best Clips
                                </h3>

                                {result.suggestedClips.length === 0 ? (
                                    <div className="text-center py-8 text-foreground-muted">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No clips could be extracted. Try a video with clearer speech.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {result.suggestedClips.map((clip) => (
                                            <motion.div
                                                key={clip.index}
                                                className="border border-border rounded-xl overflow-hidden"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: clip.index * 0.1 }}
                                            >
                                                <div
                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-background-secondary transition-colors"
                                                    onClick={() =>
                                                        setExpandedClip(
                                                            expandedClip === clip.index ? null : clip.index
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Play className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                Clip {clip.index + 1}
                                                            </p>
                                                            <p className="text-sm text-foreground-muted">
                                                                {formatTime(clip.start)} -{' '}
                                                                {formatTime(clip.end)} (
                                                                {clip.duration.toFixed(1)}s)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {clip.downloadUrl && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    downloadClip(clip);
                                                                }}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {expandedClip === clip.index ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedClip === clip.index && (
                                                        <motion.div
                                                            className="px-4 pb-4 pt-2 border-t border-border bg-background-secondary/50"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground-muted mb-1">
                                                                        Content:
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        "{clip.text}"
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground-muted mb-1">
                                                                        Why this clip:
                                                                    </p>
                                                                    <p className="text-sm text-primary">
                                                                        {clip.reason}
                                                                    </p>
                                                                </div>
                                                                {clip.downloadUrl && (
                                                                    <video
                                                                        src={clip.downloadUrl}
                                                                        controls
                                                                        className="w-full rounded-lg"
                                                                    />
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Full Transcript */}
                            <div className="card p-6">
                                <button
                                    className="w-full flex items-center justify-between"
                                    onClick={() => setShowTranscript(!showTranscript)}
                                >
                                    <h3 className="font-semibold">Full Transcript</h3>
                                    {showTranscript ? (
                                        <ChevronUp className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showTranscript && (
                                        <motion.div
                                            className="mt-4 p-4 bg-background-secondary rounded-lg max-h-64 overflow-y-auto"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">
                                                {result.transcript}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* New Video Button */}
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                            >
                                Process Another Video
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
