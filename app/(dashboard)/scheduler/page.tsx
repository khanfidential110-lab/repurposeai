'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Plus,
    Twitter,
    Youtube,
    Instagram,
    Linkedin,
    Clock,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import toast from 'react-hot-toast';

// Mock scheduled posts
const mockScheduledPosts = [
    {
        id: '1',
        platform: 'twitter',
        content: 'AI is revolutionizing how creators work! Here\'s what we learned...',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'scheduled',
    },
    {
        id: '2',
        platform: 'instagram',
        content: 'NEW EPISODE DROP! 🎙️ We just explored the intersection of AI and content creation...',
        scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'scheduled',
    },
    {
        id: '3',
        platform: 'linkedin',
        content: 'I\'ve been diving deep into how AI is transforming content creation...',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
    },
    {
        id: '4',
        platform: 'youtube',
        content: 'AI Content Creation in 2024: What\'s Actually Working for Creators',
        scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'scheduled',
    },
];

const platformConfig: Record<string, { icon: React.ElementType; color: string; name: string }> = {
    twitter: { icon: Twitter, color: '#1DA1F2', name: 'X (Twitter)' },
    youtube: { icon: Youtube, color: '#FF0000', name: 'YouTube' },
    instagram: { icon: Instagram, color: '#E4405F', name: 'Instagram' },
    linkedin: { icon: Linkedin, color: '#0A66C2', name: 'LinkedIn' },
};

const optimalTimes = [
    { platform: 'Twitter', time: '9:00 AM', reason: 'Highest engagement' },
    { platform: 'Instagram', time: '12:00 PM', reason: 'Lunch break browsing' },
    { platform: 'LinkedIn', time: '8:00 AM', reason: 'Morning commute' },
    { platform: 'YouTube', time: '5:00 PM', reason: 'After work viewing' },
];

export default function SchedulerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [posts] = useState(mockScheduledPosts);

    // Generate calendar days
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];

        // Previous month days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const prevDate = new Date(year, month, -i);
            days.unshift({ date: prevDate, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    };

    const days = getDaysInMonth(selectedDate);
    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const previousMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
    };

    const getPostsForDate = (date: Date) => {
        return posts.filter(post => {
            const postDate = new Date(post.scheduledTime);
            return postDate.toDateString() === date.toDateString();
        });
    };

    const handleDelete = (id: string) => {
        toast.success('Post deleted from schedule');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 sm:p-12 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Plan your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Viral Takeover</span> 📅
                    </h1>
                    <p className="text-lg sm:text-xl text-violet-100 font-medium leading-relaxed">
                        Schedule content across all platforms. Visualize your consistency and dominate the feed.
                    </p>
                </div>

                <div className="relative z-10 flex-shrink-0">
                    <Button
                        size="lg"
                        className="bg-white text-violet-600 hover:bg-violet-50 border-none shadow-lg hover:ring-4 hover:ring-white/20 transition-all font-bold text-lg px-8 py-6"
                        onClick={() => setShowNewPostModal(true)}
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Schedule Post
                    </Button>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                {monthName}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={previousMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={nextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-1">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center py-2 text-sm font-medium text-foreground-muted">
                                        {day}
                                    </div>
                                ))}
                                {days.map(({ date, isCurrentMonth }, index) => {
                                    const dayPosts = getPostsForDate(date);
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[80px] p-2 rounded-lg border border-transparent transition-colors ${isCurrentMonth ? 'bg-surface/50' : 'bg-surface/20'
                                                } ${isToday ? 'border-primary' : 'hover:border-border'}`}
                                        >
                                            <p className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-foreground' : 'text-foreground-muted'
                                                } ${isToday ? 'text-primary' : ''}`}>
                                                {date.getDate()}
                                            </p>
                                            <div className="space-y-1">
                                                {dayPosts.slice(0, 2).map((post) => {
                                                    const config = platformConfig[post.platform];
                                                    const Icon = config.icon;
                                                    return (
                                                        <div
                                                            key={post.id}
                                                            className="flex items-center gap-1 p-1 rounded text-xs"
                                                            style={{ backgroundColor: `${config.color}20` }}
                                                        >
                                                            <Icon className="w-3 h-3" style={{ color: config.color }} />
                                                            <span className="truncate">{post.content.slice(0, 15)}...</span>
                                                        </div>
                                                    );
                                                })}
                                                {dayPosts.length > 2 && (
                                                    <p className="text-xs text-foreground-muted">+{dayPosts.length - 2} more</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Upcoming Posts */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-secondary" />
                                Upcoming Posts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {posts.slice(0, 4).map((post) => {
                                const config = platformConfig[post.platform];
                                const Icon = config.icon;
                                return (
                                    <div key={post.id} className="p-4 rounded-xl bg-surface">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-4 h-4" style={{ color: config.color }} />
                                                <span className="text-sm font-medium">{config.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    className="p-1.5 hover:bg-surface-hover rounded text-primary hover:text-primary/80"
                                                    title="Post Now"
                                                    onClick={() => {
                                                        toast.loading(`Posting to ${config.name}...`, { duration: 2000 });
                                                        setTimeout(() => {
                                                            toast.success('Posted successfully!');
                                                            // In a real app, this would update the status to 'posted'
                                                        }, 2000);
                                                    }}
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 hover:bg-surface-hover rounded">
                                                    <Edit className="w-3.5 h-3.5 text-foreground-muted" />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-surface-hover rounded"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-foreground-muted hover:text-error" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground-muted truncate mb-2">
                                            {post.content}
                                        </p>
                                        <p className="text-xs text-foreground-muted">
                                            {post.scheduledTime.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Optimal Posting Times */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="text-sm">Optimal Posting Times</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {optimalTimes.map((item) => (
                                <div key={item.platform} className="flex items-center justify-between p-2 rounded-lg bg-surface">
                                    <span className="text-sm">{item.platform}</span>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-primary">{item.time}</p>
                                        <p className="text-xs text-foreground-muted">{item.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* New Post Modal */}
            <Modal
                isOpen={showNewPostModal}
                onClose={() => setShowNewPostModal(false)}
                title="Schedule New Post"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Platform</label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(platformConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        className="p-4 rounded-xl border border-border hover:border-primary transition-colors flex flex-col items-center gap-2"
                                    >
                                        <Icon className="w-6 h-6" style={{ color: config.color }} />
                                        <span className="text-xs">{config.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <textarea
                            className="w-full p-3 bg-background-secondary border border-border rounded-xl resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            rows={4}
                            placeholder="Enter your post content..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Date</label>
                            <input
                                type="date"
                                className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Time</label>
                            <input
                                type="time"
                                className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => {
                            toast.success('Post scheduled successfully!');
                            setShowNewPostModal(false);
                        }}>
                            Schedule Post
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
