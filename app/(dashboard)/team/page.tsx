'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Mail,
    Shield,
    MoreVertical,
    Plus,
    Trash2,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import toast from 'react-hot-toast';

// Mock team data
const initialMembers = [
    {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'Owner',
        avatar: 'D',
        status: 'active',
    },
    {
        id: '2',
        name: 'Sarah Conger',
        email: 'sarah@example.com',
        role: 'Editor',
        avatar: 'S',
        status: 'active',
    },
    {
        id: '3',
        name: 'Mike Ross',
        email: 'mike@example.com',
        role: 'Viewer',
        avatar: 'M',
        status: 'pending',
    },
];

const roles = ['Admin', 'Editor', 'Viewer'];

export default function TeamPage() {
    const [members, setMembers] = useState(initialMembers);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Editor');

    const handleInvite = () => {
        if (!inviteEmail) return;

        // Mock invite logic
        const newMember = {
            id: Math.random().toString(),
            name: inviteEmail.split('@')[0], // Mock name
            email: inviteEmail,
            role: inviteRole,
            avatar: inviteEmail[0].toUpperCase(),
            status: 'pending',
        };

        toast.loading('Sending invitation...', { duration: 1500 });
        setTimeout(() => {
            setMembers([...members, newMember]);
            setShowInviteModal(false);
            setInviteEmail('');
            toast.success(`Invitation sent to ${inviteEmail}`);
        }, 1500);
    };

    const handleRemove = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
        toast.success('Team member removed');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">Collaboration</span> 👥
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 font-medium leading-relaxed max-w-xl">
                        Manage your team, assign roles, and scale your content production together.
                    </p>
                </div>

                <div className="relative z-10">
                    <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg transition-all font-bold px-8 py-6"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </motion.div>

            {/* Team Members List */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            You have {members.length} active members in your team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                            {member.avatar}
                                        </div>
                                        <div>
                                            <p className="font-medium flex items-center gap-2">
                                                {member.name}
                                                {member.id === '1' && <Badge variant="default" className="text-[10px] h-5">You</Badge>}
                                            </p>
                                            <p className="text-sm text-foreground-muted">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                                                {member.status === 'active' ? 'Active' : 'Pending'}
                                            </Badge>
                                            <Badge variant="default" className="border border-border bg-background/50">
                                                {member.role}
                                            </Badge>
                                        </div>

                                        {member.role !== 'Owner' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error hover:bg-error/10"
                                                onClick={() => handleRemove(member.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Invite Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Team Member"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full pl-10 p-3 bg-background-secondary border border-border rounded-xl focus:border-primary"
                                placeholder="colleague@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <div className="grid grid-cols-3 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setInviteRole(role)}
                                    className={`p-3 rounded-xl border transition-all text-sm font-medium ${inviteRole === role
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-foreground-muted mt-2">
                            {inviteRole === 'Admin' && 'Full access to all features and settings.'}
                            {inviteRole === 'Editor' && 'Can create and edit content, but cannot manage team.'}
                            {inviteRole === 'Viewer' && 'Can only view content and analytics.'}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleInvite} disabled={!inviteEmail}>
                            Send Invitation
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
