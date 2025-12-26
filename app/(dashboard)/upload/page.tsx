'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    FileVideo,
    FileAudio,
    FileText,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, getFileType } from '@/lib/utils/helpers';
import { SUPPORTED_FILES } from '@/lib/utils/constants';
import { useAuth } from '@/lib/hooks/use-auth';
import toast from 'react-hot-toast';

interface UploadedFile {
    file: File;
    preview: string;
    type: 'video' | 'audio' | 'text';
    progress: number;
    status: 'uploading' | 'processing' | 'done' | 'error';
    error?: string;
}

const fileTypeIcons = {
    video: FileVideo,
    audio: FileAudio,
    text: FileText,
};

const fileTypeColors = {
    video: 'from-red-500 to-orange-500',
    audio: 'from-purple-500 to-pink-500',
    text: 'from-blue-500 to-cyan-500',
};

export default function UploadPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => {
            const type = getFileType(file.name);
            if (type === 'unknown') {
                toast.error(`Unsupported file type: ${file.name}`);
                return null;
            }

            // Check file size
            const maxSize = SUPPORTED_FILES[type].maxSize;
            if (file.size > maxSize) {
                toast.error(`File too large: ${file.name} (max ${formatFileSize(maxSize)})`);
                return null;
            }

            return {
                file,
                preview: URL.createObjectURL(file),
                type: type as 'video' | 'audio' | 'text',
                progress: 0,
                status: 'uploading' as const,
            };
        }).filter(Boolean) as UploadedFile[];

        if (newFiles.length > 0) {
            setFiles((prev) => [...prev, ...newFiles.map(f => ({ ...f, status: 'done' as const, progress: 100 }))]);
        }
    }, []);



    const removeFile = (fileName: string) => {
        setFiles((prev) => prev.filter((f) => f.file.name !== fileName));
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            toast.error('Please upload at least one file');
            return;
        }

        const allUploaded = files.every((f) => f.status === 'done');
        if (!allUploaded) {
            toast.error('Please wait for all files to finish uploading');
            return;
        }

        setIsProcessing(true);

        try {
            // Process each file
            for (const fileObj of files) {
                // 1. Transcribe (if video/audio)
                let transcription = '';
                let contentToProcess = '';

                if (fileObj.type === 'video' || fileObj.type === 'audio') {
                    toast.loading(`Transcribing ${fileObj.file.name}...`, { id: 'processing' });

                    const formData = new FormData();
                    formData.append('file', fileObj.file);

                    const transRes = await fetch('/api/ai/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!transRes.ok) throw new Error('Transcription failed');
                    const transData = await transRes.json();
                    transcription = transData.text;
                    contentToProcess = transcription;
                } else {
                    // Text file
                    contentToProcess = await fileObj.file.text();
                }

                // 2. Repurpose
                toast.loading(`Repurposing ${fileObj.file.name} with AI...`, { id: 'processing' });

                const repRes = await fetch('/api/ai/repurpose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: contentToProcess,
                        contentType: fileObj.type,
                        platforms: ['twitter', 'linkedin', 'instagram', 'youtube'] // Default platforms
                    }),
                });

                if (!repRes.ok) throw new Error('Repurposing failed');
                const repData = await repRes.json();

                // 3. Create Job
                const jobRes = await fetch('/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.uid || 'anonymous',
                        inputType: fileObj.type,
                        inputFileName: fileObj.file.name,
                        inputFileSize: fileObj.file.size
                    }),
                });

                if (jobRes.ok) {
                    const jobData = await jobRes.json();
                    const jobId = jobData.job.id;

                    // Update job with results
                    await fetch('/api/jobs', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jobId,
                            status: 'done',
                            outputs: Object.entries(repData.outputs).map(([key, val]) => ({
                                type: key,
                                platform: key.includes('twitter') ? 'twitter' : 'generic',
                                content: JSON.stringify(val)
                            })),
                            transcription
                        }),
                    });
                }
            }

            toast.success('Content processed successfully!', { id: 'processing' });
            router.push('/jobs'); // Redirect to jobs list
        } catch (error) {
            console.error(error);
            toast.error('Failed to process content. Ensure API keys are set.', { id: 'processing' });
        } finally {
            setIsProcessing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': SUPPORTED_FILES.video.extensions,
            'audio/*': SUPPORTED_FILES.audio.extensions,
            'text/*': SUPPORTED_FILES.text.extensions,
        },
        multiple: true,
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 sm:p-12 text-white shadow-2xl"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Upload your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">Masterpiece</span> 🎨
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl font-medium leading-relaxed">
                        Drag and drop your video, audio, or text. We'll handle the magic
                        and generate viral clips in minutes.
                    </p>
                </div>
            </motion.div>

            {/* Dropzone */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="glass-card p-1"
            >
                <div
                    {...getRootProps()}
                    className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-out group
            ${isDragActive
                            ? 'border-primary bg-primary/5 scale-[0.99]'
                            : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                        }
          `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center">
                        <motion.div
                            className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                ${isDragActive ? 'bg-primary/20' : 'bg-surface'}
              `}
                            animate={{ scale: isDragActive ? 1.1 : 1 }}
                        >
                            <Upload className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-foreground-muted'}`} />
                        </motion.div>

                        <h3 className="text-xl font-semibold mb-2">
                            {isDragActive ? 'Drop your files here' : 'Drag & drop files here'}
                        </h3>
                        <p className="text-foreground-muted mb-4">
                            or click to browse from your computer
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 text-sm text-foreground-muted">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface">
                                <FileVideo className="w-4 h-4" /> Video (MP4, MOV)
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface">
                                <FileAudio className="w-4 h-4" /> Audio (MP3, WAV)
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface">
                                <FileText className="w-4 h-4" /> Text (TXT, MD)
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    <h3 className="text-lg font-semibold">Uploaded Files</h3>

                    {files.map((uploadedFile, index) => {
                        const Icon = fileTypeIcons[uploadedFile.type];
                        const colorClass = fileTypeColors[uploadedFile.type];

                        return (
                            <Card key={uploadedFile.file.name} variant="glass">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {uploadedFile.file.name}
                                            </p>
                                            <p className="text-sm text-foreground-muted">
                                                {formatFileSize(uploadedFile.file.size)} • {uploadedFile.type}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {uploadedFile.status === 'uploading' && (
                                                <div className="w-32">
                                                    <Progress value={uploadedFile.progress} size="sm" />
                                                </div>
                                            )}

                                            {uploadedFile.status === 'done' && (
                                                <CheckCircle className="w-5 h-5 text-success" />
                                            )}

                                            {uploadedFile.status === 'error' && (
                                                <AlertCircle className="w-5 h-5 text-error" />
                                            )}

                                            <button
                                                onClick={() => removeFile(uploadedFile.file.name)}
                                                className="p-2.5 hover:bg-surface rounded-lg text-foreground-muted hover:text-foreground transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </motion.div>
            )}

            {/* Process Button */}
            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end"
                >
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleProcess}
                        loading={isProcessing}
                        leftIcon={<Sparkles className="w-5 h-5" />}
                    >
                        {isProcessing ? 'Processing...' : 'Repurpose with AI'}
                    </Button>
                </motion.div>
            )}

            {/* Output Options Preview */}
            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">What you&apos;ll get</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Short Clips', count: '3-5', desc: 'Viral moments' },
                                    { label: 'Twitter Threads', count: '1', desc: '5-10 tweets' },
                                    { label: 'Captions', count: '4', desc: 'Platform-specific' },
                                    { label: 'Subtitles', count: '1', desc: 'SRT format' },
                                ].map((output) => (
                                    <div
                                        key={output.label}
                                        className="p-4 rounded-xl bg-surface text-center"
                                    >
                                        <p className="text-2xl font-bold text-gradient mb-1">{output.count}</p>
                                        <p className="font-medium text-foreground text-sm">{output.label}</p>
                                        <p className="text-xs text-foreground-muted">{output.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
