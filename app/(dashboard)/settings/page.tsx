'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    CreditCard,
    Bell,
    Shield,
    Link2,
    Check,
    Zap,
    Twitter,
    Youtube,
    Instagram,
    Linkedin,
    Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PRICING_TIERS } from '@/lib/utils/constants';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState<string | null>(null);

    // Mock user data
    const user = {
        name: 'Demo User',
        email: 'demo@example.com',
        plan: 'free' as const,
    };

    const [platformState, setPlatformState] = useState([
        { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', connected: false },
        { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1DA1F2', connected: true }, // Pre-connected for demo
        { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', connected: false },
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', connected: false },
    ]);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Settings saved successfully!');
        }, 1000);
    };

    const handleConnect = (platformId: string, platformName: string) => {
        const isConnected = platformState.find(p => p.id === platformId)?.connected;

        if (isConnected) {
            // Disconnect logic
            setPlatformState(prev => prev.map(p =>
                p.id === platformId ? { ...p, connected: false } : p
            ));
            toast.success(`Disconnected from ${platformName}`);
            return;
        }

        // Connect logic
        setConnecting(platformId);
        // Simulate OAuth window popup and processing
        setTimeout(() => {
            setConnecting(null);
            setPlatformState(prev => prev.map(p =>
                p.id === platformId ? { ...p, connected: true } : p
            ));
            toast.success(`Successfully connected to ${platformName}!`);
        }, 1500);
    };

    const handleUpgrade = (plan: string) => {
        toast.success(`Redirecting to Stripe checkout for ${plan}...`);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-zinc-900 p-8 sm:p-12 text-white shadow-2xl mb-8 border border-white/10"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-slate-400">Center</span> ⚙️
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed max-w-xl">
                        Manage your account preferences, billing details, and connected platforms.
                    </p>
                </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:w-64 flex-shrink-0"
                >
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground-muted hover:text-foreground hover:bg-surface'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1"
                >
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <Button variant="secondary" size="sm">Change Avatar</Button>
                                        <p className="text-sm text-foreground-muted mt-2">JPG, PNG or GIF. Max 2MB</p>
                                    </div>
                                </div>

                                <div className="grid gap-5">
                                    <Input
                                        label="Full Name"
                                        defaultValue={user.name}
                                        placeholder="Your name"
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        defaultValue={user.email}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button variant="primary" onClick={handleSave} loading={loading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <Card variant="glass">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Current Plan</CardTitle>
                                            <CardDescription>You are on the Free plan</CardDescription>
                                        </div>
                                        <Badge variant="default" className="text-lg px-4 py-2">Free</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
                                        <div>
                                            <p className="text-sm text-foreground-muted">Monthly Usage</p>
                                            <p className="text-2xl font-bold">3 / 5</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-foreground-muted">Next reset</p>
                                            <p className="font-medium">Jan 1, 2025</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-4">
                                {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                                    <Card
                                        key={key}
                                        variant={key === 'pro' ? 'glow' : 'glass'}
                                        className={key === 'pro' ? 'border-primary' : ''}
                                    >
                                        <CardContent className="p-6">
                                            {key === 'pro' && (
                                                <Badge variant="success" className="mb-3">Recommended</Badge>
                                            )}
                                            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-3xl font-bold">${tier.price}</span>
                                                {tier.price > 0 && <span className="text-foreground-muted">/mo</span>}
                                            </div>
                                            <ul className="space-y-2 mb-6">
                                                {tier.features.slice(0, 4).map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                                        <Check className="w-4 h-4 text-success" />
                                                        <span className="text-foreground-muted">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                variant={key === 'pro' ? 'primary' : 'secondary'}
                                                className="w-full"
                                                onClick={() => handleUpgrade(tier.name)}
                                                disabled={key === 'free'}
                                            >
                                                {key === 'free' ? 'Current Plan' : key === 'pro' ? 'Upgrade to Pro' : 'Contact Sales'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Connections Tab */}
                    {activeTab === 'connections' && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Connected Platforms</CardTitle>
                                <CardDescription>Connect your social media accounts for auto-posting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {platformState.map((platform) => (
                                        <div
                                            key={platform.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-surface transition-all hover:bg-surface-hover"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                                                    style={{ backgroundColor: `${platform.color}20` }}
                                                >
                                                    <platform.icon
                                                        className="w-6 h-6"
                                                        style={{ color: platform.color }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{platform.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${platform.connected ? 'bg-success' : 'bg-foreground-muted'}`} />
                                                        <p className="text-sm text-foreground-muted">
                                                            {platform.connected ? 'Connected' : 'Not connected'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant={platform.connected ? 'secondary' : 'primary'}
                                                onClick={() => handleConnect(platform.id, platform.name)}
                                                disabled={connecting === platform.id}
                                                className={`min-w-[120px] ${platform.connected ? 'hover:bg-error/10 hover:text-error hover:border-error/20' : ''}`}
                                            >
                                                {connecting === platform.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Connecting
                                                    </>
                                                ) : platform.connected ? (
                                                    'Disconnect'
                                                ) : (
                                                    'Connect'
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose what you want to be notified about</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Job completed', desc: 'Get notified when a repurposing job finishes' },
                                    { label: 'Job failed', desc: 'Get notified when a job fails' },
                                    { label: 'Post published', desc: 'Get notified when a scheduled post goes live' },
                                    { label: 'Weekly summary', desc: 'Receive a weekly report of your content performance' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-foreground-muted">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                                            <div className="w-11 h-6 bg-border peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <Button variant="primary" onClick={handleSave} loading={loading}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Update your password to keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input type="password" label="Current Password" placeholder="••••••••" />
                                    <Input type="password" label="New Password" placeholder="••••••••" />
                                    <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                                    <div className="flex justify-end">
                                        <Button variant="primary" onClick={handleSave} loading={loading}>
                                            Update Password
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle className="text-error">Danger Zone</CardTitle>
                                    <CardDescription>Irreversible account actions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-error/20 bg-error/5">
                                        <div>
                                            <p className="font-medium">Delete Account</p>
                                            <p className="text-sm text-foreground-muted">
                                                Permanently delete your account and all data
                                            </p>
                                        </div>
                                        <Button variant="danger">Delete Account</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
