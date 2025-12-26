'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, Pause, Trash2, ArrowRight } from 'lucide-react';
import { Workflow, DEFAULT_WORKFLOW_TEMPLATES } from '@/lib/workflows/types';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            setWorkflows(data.workflows);
        } catch (error) {
            toast.error('Failed to load workflows');
        } finally {
            setIsLoading(false);
        }
    };

    const router = useRouter();
    const handleCreateWorkflow = (templateName?: string) => {
        // In the future, we can pass the template name via query params
        router.push('/workflows/editor');
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Automation Workflows</h1>
                    <p className="text-muted-foreground mt-2">
                        Create rules to automatically repurpose and post your content.
                    </p>
                </div>
            </div>

            {/* Templates Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            New Workflow
                        </CardTitle>
                        <CardDescription>Start from a popular template</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {DEFAULT_WORKFLOW_TEMPLATES.map((t) => (
                            <div key={t.name} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border hover:border-primary transition-colors">
                                <span className="font-medium">{t.name}</span>
                                <Button size="sm" onClick={() => handleCreateWorkflow(t.name!)}>
                                    Customize
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Active Workflows Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Your automation stats</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</div>
                                <div className="text-sm text-muted-foreground">Active Workflows</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-green-500">
                                    {workflows.reduce((acc, w) => acc + w.stats.processedCount, 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Videos Repurposed</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List of Workflows */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Workflows</h2>

                {isLoading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : workflows.length === 0 ? (
                    <EmptyState
                        title="No active workflows"
                        description="Create your first automation rule to start saving time. Choose a template above."
                        icon={Play}
                    />
                ) : (
                    <div className="grid gap-4">
                        {workflows.map((workflow) => (
                            <Card key={workflow.id} className="group">
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                        <div>
                                            <h3 className="font-semibold text-lg">{workflow.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <span className="capitalize">{workflow.trigger.platform}</span>
                                                <ArrowRight className="w-3 h-3" />
                                                <span className="capitalize">{workflow.actions[0].platform}</span>
                                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full ml-2">
                                                    Processed: {workflow.stats.processedCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            {workflow.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                            {workflow.isActive ? 'Pause' : 'Resume'}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
