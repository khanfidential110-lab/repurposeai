'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn, signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            if (errorMessage.includes('invalid-credential')) {
                toast.error('Invalid email or password');
            } else if (errorMessage.includes('too-many-requests')) {
                toast.error('Too many attempts. Please try again later.');
            } else {
                toast.error('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome!');
            router.push('/dashboard');
        } catch (error: unknown) {
            console.error('Google sign in error:', error);

            // Extract Firebase error code for better debugging
            const firebaseError = error as { code?: string; message?: string };
            const errorCode = firebaseError.code || 'unknown';
            const errorMessage = firebaseError.message || 'Google login failed';

            // Show specific error messages based on Firebase error codes
            if (errorCode.includes('popup-closed-by-user')) {
                toast.error('Sign-in popup was closed. Please try again.');
            } else if (errorCode.includes('popup-blocked')) {
                toast.error('Popup was blocked. Please allow popups for this site.');
            } else if (errorCode.includes('unauthorized-domain')) {
                toast.error('This domain is not authorized. Check Firebase Console.');
            } else if (errorCode.includes('network-request-failed')) {
                toast.error('Network error. Please check your connection.');
            } else {
                // Show the actual error for debugging
                toast.error(`Sign-in failed: ${errorCode}`);
                console.error('Full error:', errorCode, errorMessage);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/30 rounded-full blur-[100px]" />

                <div className="relative">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">RepurposeAI</span>
                    </Link>
                </div>

                <div className="relative">
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome back to <span className="text-gradient">RepurposeAI</span>
                    </h1>
                    <p className="text-lg text-foreground-muted">
                        Continue transforming your content into viral posts across all platforms.
                    </p>
                </div>

                <div className="relative text-sm text-foreground-muted">
                    © 2024 RepurposeAI. All rights reserved.
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Sign in</h2>
                        <p className="text-foreground-muted">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        variant="secondary"
                        className="w-full mb-6"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                    >
                        {googleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-foreground-muted">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail className="w-5 h-5" />}
                            disabled={loading}
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<Lock className="w-5 h-5" />}
                            disabled={loading}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border bg-background-secondary text-primary focus:ring-primary"
                                />
                                <span className="text-foreground-muted">Remember me</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                        >
                            Sign in
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
