'use client';

import { useState, useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Plus, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { SourceNode, ActionNode } from '@/components/workflows/node-types';

const nodeTypes = {
    source: SourceNode,
    action: ActionNode,
};

// Initial state for a new workflow
const initialNodes: Node[] = [
    {
        id: 'trigger-1',
        type: 'source',
        position: { x: 100, y: 200 },
        data: { platform: 'tiktok', event: 'new_video' },
    },
    {
        id: 'action-1',
        type: 'action',
        position: { x: 500, y: 200 },
        data: { platform: 'youtube', action: 'upload_video', settings: { removeWatermark: true } },
    }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'trigger-1', target: 'action-1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
];

export default function WorkflowEditorPage() {
    const router = useRouter();
    const [workflowName, setWorkflowName] = useState('My Untitled Workflow');
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds)),
        [setEdges]
    );

    const handleSave = async () => {
        // In a real app, we'd validate the graph here (e.g. must have 1 trigger)
        // and transform nodes/edges back into our JSON schema.

        // Mock API call
        const loadingToast = toast.loading('Saving workflow...');
        try {
            await new Promise(r => setTimeout(r, 1000)); // Simulate network

            // Create in store (mock call)
            await fetch('/api/workflows', {
                method: 'POST',
                body: JSON.stringify({
                    name: workflowName,
                    trigger: nodes[0].data, // Simplified for MVP
                    actions: nodes.slice(1).map(n => n.data)
                })
            });

            toast.dismiss(loadingToast);
            toast.success('Workflow saved successfully!');
            router.push('/workflows');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to save workflow');
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col">
            {/* Toolbar */}
            <div className="h-16 border-b border-border/50 bg-background/50 backdrop-blur flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/workflows">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="bg-transparent border-none text-lg font-semibold h-auto p-0 focus-visible:ring-0 w-[300px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => toast('This mock just adds a node!')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Node
                    </Button>
                    <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save Workflow
                    </Button>
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 bg-neutral-900/50 relative group">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="transition-opacity opacity-0 animate-in fade-in duration-500"
                    onInit={(instance) => {
                        // Hack to ensure it fades in after loading
                        const el = document.querySelector('.react-flow') as HTMLElement;
                        if (el) el.style.opacity = '1';
                    }}
                >
                    <Background color="#333" gap={20} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-background border border-border" />
                </ReactFlow>

                {/* Floating "Test" Button */}
                <div className="absolute bottom-8 right-8 z-10">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="shadow-2xl hover:scale-105 transition-transform"
                        onClick={() => toast.success('Running test check...')}
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Test Run
                    </Button>
                </div>
            </div>
        </div>
    );
}
