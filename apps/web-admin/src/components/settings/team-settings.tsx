"use client";

import { Loader2, UserPlus, Users, Trash2 } from "lucide-react";
import { Collaborator } from "./types";

interface TeamSettingsProps {
    isOwner: boolean;
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    inviteRole: 'editor' | 'viewer';
    setInviteRole: (role: 'editor' | 'viewer') => void;
    handleInviteCollaborator: () => Promise<void>;
    inviting: boolean;
    collaborators: Collaborator[];
    handleRemoveCollaborator: (id: string) => Promise<void>;
}

export function TeamSettings({
    isOwner,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    handleInviteCollaborator,
    inviting,
    collaborators,
    handleRemoveCollaborator
}: TeamSettingsProps) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Team & Collaboration</h2>

            <div className="space-y-6">
                {/* Invite Collaborator */}
                {isOwner && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="font-medium text-slate-900 mb-4">Invite Team Member</h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="team@example.com"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                                className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <button
                                onClick={handleInviteCollaborator}
                                disabled={inviting || !inviteEmail}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {inviting ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <UserPlus size={16} />
                                )}
                                Invite
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Editors can manage products, orders, and content. Viewers have read-only access.
                        </p>
                    </div>
                )}

                {/* Team Members List */}
                <div>
                    <h3 className="font-medium text-slate-900 mb-3">Team Members</h3>
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden">
                        {/* Owner Row */}
                        <div className="p-4 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users size={18} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{isOwner ? 'You (Owner)' : 'Store Owner'}</p>
                                    <p className="text-sm text-slate-500">Full access to all settings</p>
                                </div>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                                Owner
                            </span>
                        </div>

                        {/* Collaborators */}
                        {collaborators.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Users size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No team members yet</p>
                                <p className="text-xs">Invite someone to collaborate on this store</p>
                            </div>
                        ) : (
                            collaborators.map((collab) => (
                                <div key={collab.id} className="p-4 bg-white flex items-center justify-between hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Users size={18} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {collab.email || `User ${collab.user_id.slice(0, 8)}...`}
                                            </p>
                                            <p className="text-sm text-slate-500 capitalize">{collab.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${collab.role === 'editor'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {collab.role === 'editor' ? 'Editor' : 'Viewer'}
                                        </span>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveCollaborator(collab.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition"
                                                title="Remove collaborator"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Permissions Info */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Role Permissions</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-amber-900">Editor</p>
                            <ul className="text-amber-700 mt-1 space-y-0.5">
                                <li>• Manage products & inventory</li>
                                <li>• View & update orders</li>
                                <li>• Edit store content</li>
                                <li>• Access analytics</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-amber-900">Viewer</p>
                            <ul className="text-amber-700 mt-1 space-y-0.5">
                                <li>• View products & orders</li>
                                <li>• View analytics</li>
                                <li>• No edit permissions</li>
                                <li>• No settings access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
