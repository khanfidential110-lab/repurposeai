'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Upload,
    FileText,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Sparkles,
    ChevronRight,
    User,
    Zap,
    Users,
    Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { NAV_ITEMS } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import OnboardingWizard from '@/components/dashboard/onboarding-wizard';

interface DashboardLayoutProps {
    children: ReactNode;
}

const iconMap: { [key: string]: React.ElementType } = {
    LayoutDashboard,
    Upload,
    FileText,
    Calendar,
    BarChart3,
    Settings,
    Settings,
    Users,
    Workflow,
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock user data (will be replaced with real auth)
    const user = {
        name: 'Demo User',
        email: 'demo@example.com',
        plan: 'free' as const,
        usageCount: 3,
    };

    const handleSignOut = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 sidebar-glass transform transition-transform duration-300 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-foreground">RepurposeAI</span>
                        </Link>
                        <button
                            className="lg:hidden p-2.5 hover:bg-surface rounded-lg"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-5 py-6 space-y-2">
                        {Object.entries(NAV_ITEMS).map(([key, item]) => {
                            const Icon = iconMap[item.icon] || FileText;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={key}
                                    href={item.href}
                                    className={cn(
                                        'nav-item flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group',
                                        isActive
                                            ? 'active'
                                            : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-foreground-muted group-hover:text-white")} />
                                    <span className={cn("font-medium transition-colors", isActive ? "text-white" : "group-hover:text-white")}>{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Usage Stats */}
                    <div className="px-5 py-6">
                        <div className="glass-card p-6 !bg-white/5 !border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-foreground-muted">Monthly Usage</span>
                                <span className="text-sm font-bold text-foreground">
                                    {user.usageCount}/5
                                </span>
                            </div>
                            <div className="w-full h-3 bg-surface rounded-full overflow-hidden mb-5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                    style={{ width: `${(user.usageCount / 5) * 100}%` }}
                                />
                            </div>
                            {user.plan === 'free' && (
                                <Link href="/settings">
                                    <Button variant="primary" size="sm" className="w-full" leftIcon={<Zap className="w-4 h-4" />}>
                                        Upgrade to Pro
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="p-6 border-t border-border">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{user.name}</p>
                                <p className="text-sm text-foreground-muted truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-4 w-full px-5 py-3 text-foreground-muted hover:text-error hover:bg-error/10 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full relative">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 sm:px-10 z-10">
                    <button
                        className="lg:hidden p-3 hover:bg-surface rounded-xl"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                        <Link href="/upload">
                            <Button variant="primary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                                <span className="hidden sm:inline">New Upload</span>
                                <span className="sm:hidden">Upload</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-5 sm:p-8">
                    {children}
                </main>
            </div>

            <OnboardingWizard />
        </div>
    );
}
