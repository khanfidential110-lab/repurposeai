'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Twitter,
    Youtube,
    Instagram,
    Linkedin,
    ArrowUp,
    ArrowDown,
    Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock analytics data
const overviewStats = [
    { label: 'Total Reach', value: '124.5K', change: '+23%', up: true, icon: Eye },
    { label: 'Engagement', value: '8.2K', change: '+18%', up: true, icon: Heart },
    { label: 'Comments', value: '1.4K', change: '+12%', up: true, icon: MessageCircle },
    { label: 'Shares', value: '892', change: '-5%', up: false, icon: Share2 },
];

const platformStats = [
    {
        platform: 'Twitter',
        icon: Twitter,
        color: '#1DA1F2',
        followers: '12.4K',
        engagement: '4.2%',
        posts: 45,
        impressions: '89.2K',
    },
    {
        platform: 'YouTube',
        icon: Youtube,
        color: '#FF0000',
        followers: '5.2K',
        engagement: '6.8%',
        posts: 12,
        impressions: '45.6K',
    },
    {
        platform: 'Instagram',
        icon: Instagram,
        color: '#E4405F',
        followers: '8.9K',
        engagement: '5.4%',
        posts: 28,
        impressions: '67.3K',
    },
    {
        platform: 'LinkedIn',
        icon: Linkedin,
        color: '#0A66C2',
        followers: '3.1K',
        engagement: '3.2%',
        posts: 18,
        impressions: '23.4K',
    },
];

const topContent = [
    {
        title: 'AI Content Creation Thread',
        platform: 'twitter',
        views: '45.2K',
        engagement: '2.1K',
        type: 'Thread',
    },
    {
        title: 'Full Episode: AI Revolution',
        platform: 'youtube',
        views: '12.8K',
        engagement: '892',
        type: 'Video',
    },
    {
        title: 'Behind the Scenes Reel',
        platform: 'instagram',
        views: '34.5K',
        engagement: '1.8K',
        type: 'Reel',
    },
];

const platformIcons: Record<string, React.ElementType> = {
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    linkedin: Linkedin,
};

const chartData = [
    { name: 'Jan', engagement: 4000, reach: 2400 },
    { name: 'Feb', engagement: 3000, reach: 1398 },
    { name: 'Mar', engagement: 2000, reach: 9800 },
    { name: 'Apr', engagement: 2780, reach: 3908 },
    { name: 'May', engagement: 1890, reach: 4800 },
    { name: 'Jun', engagement: 2390, reach: 3800 },
    { name: 'Jul', engagement: 3490, reach: 4300 },
    { name: 'Aug', engagement: 4200, reach: 5600 },
    { name: 'Sep', engagement: 3800, reach: 6700 },
    { name: 'Oct', engagement: 5100, reach: 7800 },
    { name: 'Nov', engagement: 4600, reach: 8900 },
    { name: 'Dec', engagement: 6000, reach: 9800 },
];

export default function AnalyticsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 to-pink-600 p-8 sm:p-12 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Your Growth, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-100">Visualized</span> 📈
                    </h1>
                    <p className="text-lg sm:text-xl text-rose-100 font-medium leading-relaxed max-w-xl">
                        Deep insights into your content performance and audience engagement.
                    </p>
                </div>

                <div className="relative z-10 flex gap-3">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 hover:text-white border border-white/20"
                    >
                        Last 30 Days
                    </Button>
                    <Button
                        className="bg-white text-rose-600 hover:bg-rose-50 border-none shadow-lg transition-all font-bold"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </motion.div>

            {/* Overview Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            >
                {overviewStats.map((stat) => (
                    <Card key={stat.label} variant="glass" hover>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <Badge variant={stat.up ? 'success' : 'error'} className="text-xs">
                                    {stat.up ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                    {stat.change}
                                </Badge>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                            <p className="text-xs sm:text-sm text-foreground-muted">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card variant="glass" className="h-[400px]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Engagement Over Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#ffffff50"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff50"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="engagement"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEngagement)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="reach"
                                        stroke="#ec4899"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorReach)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Content */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                                Top Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topContent.map((content, index) => {
                                const Icon = platformIcons[content.platform];
                                return (
                                    <div key={index} className="p-4 rounded-xl bg-surface">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-4 h-4" />
                                            <Badge variant="default">{content.type}</Badge>
                                        </div>
                                        <p className="font-medium mb-2 line-clamp-2">{content.title}</p>
                                        <div className="flex items-center gap-4 text-sm text-foreground-muted">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" /> {content.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" /> {content.engagement}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Platform Performance */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Platform Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {platformStats.map((platform) => (
                                <div
                                    key={platform.platform}
                                    className="p-6 rounded-xl bg-surface hover:bg-surface-hover transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${platform.color}20` }}
                                        >
                                            <platform.icon
                                                className="w-6 h-6"
                                                style={{ color: platform.color }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{platform.platform}</p>
                                            <p className="text-sm text-foreground-muted">{platform.followers} followers</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-2xl font-bold">{platform.engagement}</p>
                                            <p className="text-xs text-foreground-muted">Engagement Rate</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{platform.posts}</p>
                                            <p className="text-xs text-foreground-muted">Posts</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground-muted">Impressions</span>
                                            <span className="font-medium">{platform.impressions}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card variant="glow">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                                <ul className="space-y-2 text-foreground-muted">
                                    <li>• Your Twitter threads get <span className="text-success font-medium">2.3x more engagement</span> than single tweets</li>
                                    <li>• Best posting time for Instagram: <span className="text-primary font-medium">12:00 PM - 2:00 PM</span></li>
                                    <li>• Content about AI topics performs <span className="text-success font-medium">45% better</span> than other topics</li>
                                    <li>• Consider posting more on LinkedIn - you&apos;re <span className="text-warning font-medium">underutilizing</span> this platform</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
