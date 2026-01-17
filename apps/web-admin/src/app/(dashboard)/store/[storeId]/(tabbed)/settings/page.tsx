"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Globe, Palette, CreditCard, Shield, Check, AlertCircle, Loader2, Users, Code2, Mail } from "lucide-react";
import { MediaManager } from "@/components/media-manager";
import { DeveloperSettings } from "@/components/developer-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { DomainSettings } from "@/components/settings/domain-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { BillingSettings } from "@/components/settings/billing-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { StoreSettings, Collaborator, SettingsTab } from "@/components/settings/types";

export default function StoreSettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = use(params);
    const supabase = createClient();

    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isOwner = settings?.owner_id === currentUser?.id;

    // Media Manager State
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<'logo' | 'favicon' | null>(null);

    // Domain verification state
    const [customDomain, setCustomDomain] = useState("");
    const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'verified' | 'pending' | 'error'>('idle');

    // Email Domain state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [emailDomains, setEmailDomains] = useState<any[]>([]);
    const [newEmailDomain, setNewEmailDomain] = useState("");
    const [addingEmailDomain, setAddingEmailDomain] = useState(false);

    // Team/Collaboration State
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
    const [inviting, setInviting] = useState(false);
    
    // Invite Dialog State
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [pendingInviteEmail, setPendingInviteEmail] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser({ id: user.id });
            
            await Promise.all([
                fetchSettings(),
                fetchEmailDomains(),
                fetchCollaborators()
            ]);
            setLoading(false);
        };
        load();
    }, [storeId]);

    const fetchCollaborators = async () => {
        const { data, error } = await supabase
            .rpc('get_store_collaborators_with_meta', { store_id_param: storeId });
        
        if (error) {
            console.error("Error fetching collaborators:", error);
        } else if (data) {
            setCollaborators(data);
        }
    };

    const handleInviteCollaborator = async () => {
        if (!inviteEmail) return;
        setInviting(true);

        // Check if user exists first
        const { data: existingUserId } = await supabase
            .rpc('get_user_id_by_email', { email_param: inviteEmail })
            .single();

        if (!existingUserId) {
            // User doesn't exist - prompt for invite
            setPendingInviteEmail(inviteEmail);
            setShowInviteDialog(true);
            setInviting(false);
            return;
        }

        // User exists - add directly
        await executeInvite(inviteEmail);
    };

    const confirmInvite = async () => {
        setShowInviteDialog(false);
        setInviting(true);
        await executeInvite(pendingInviteEmail);
        setPendingInviteEmail("");
    };

    const executeInvite = async (email: string) => {
        try {
            const res = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, storeId, role: inviteRole }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ type: 'success', text: data.isNewUser ? 'Invitation sent!' : 'Collaborator added successfully!' });
                setInviteEmail("");
                fetchCollaborators();
            } else {
                 setMessage({ type: 'error', text: data.error || 'Failed to add collaborator' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId: string) => {
        if (!confirm("Remove this collaborator?")) return;

        const { error } = await supabase
            .from("store_collaborators")
            .delete()
            .eq("id", collaboratorId);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            fetchCollaborators();
        }
    };

    const fetchEmailDomains = async () => {
        const { data } = await supabase
            .from("store_email_domains")
            .select("*")
            .eq("store_id", storeId);
        if (data) setEmailDomains(data);
    };



    const handleAddEmailDomain = async () => {
        if (!newEmailDomain) return;
        setAddingEmailDomain(true);
        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newEmailDomain, storeId }),
            });
            const data = await res.json();
            if (data.success) {
                setNewEmailDomain("");
                fetchEmailDomains();
                setMessage({ type: 'success', text: 'Domain added successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to add domain' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to add domain' });
        } finally {
            setAddingEmailDomain(false);
        }
    };

    const handleConnectStripe = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/stripe/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to connect Stripe' });
                setSaving(false);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to connect Stripe' });
            setSaving(false);
        }
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .single();

        if (error) {
            console.error("Error fetching settings:", error);
            return;
        }

        setSettings(data);
        setCustomDomain(data.custom_domain || "");
    };

    const saveSettings = async (updates: Partial<StoreSettings>) => {
        setSaving(true);
        setMessage(null);

        const { error } = await supabase
            .from("stores")
            .update(updates)
            .eq("id", storeId);

        setSaving(false);

        if (error) {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
            return false;
        }

        setSettings(prev => prev ? { ...prev, ...updates } : null);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        return true;
    };

    const handleDomainSave = async () => {
        if (!customDomain) {
            await saveSettings({ custom_domain: null });
            setDomainStatus('idle');
            return;
        }

        // Basic domain validation
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!domainRegex.test(customDomain)) {
            setMessage({ type: 'error', text: 'Please enter a valid domain name (e.g., mystore.com)' });
            return;
        }

        setDomainStatus('checking');

        // Save domain to database
        const success = await saveSettings({ custom_domain: customDomain.toLowerCase() });

        if (success) {
            setDomainStatus('pending');
        } else {
            setDomainStatus('error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Copied to clipboard!' });
        setTimeout(() => setMessage(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Store not found</p>
            </div>
        );
    }

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Shield size={18} /> },
        { id: 'domains', label: 'Domains', icon: <Globe size={18} /> },
        { id: 'theme', label: 'Theme', icon: <Palette size={18} /> },
        ...(isOwner ? [
            { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> } as const,
            { id: 'team', label: 'Team', icon: <Users size={18} /> } as const,
        ] : []),
        { id: 'developer', label: 'Developer', icon: <Code2 size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Store Settings</h1>
                            <p className="text-sm text-slate-500">{settings.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-56 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            {activeTab === 'general' && (
                                <GeneralSettings
                                    settings={settings}
                                    setSettings={setSettings}
                                    saveSettings={saveSettings}
                                    saving={saving}
                                    setMediaTarget={setMediaTarget}
                                    setIsMediaOpen={setIsMediaOpen}
                                />
                            )}

                            {activeTab === 'domains' && (
                                <DomainSettings
                                    settings={settings}
                                    customDomain={customDomain}
                                    setCustomDomain={setCustomDomain}
                                    domainStatus={domainStatus}
                                    handleDomainSave={handleDomainSave}
                                    emailDomains={emailDomains}
                                    newEmailDomain={newEmailDomain}
                                    setNewEmailDomain={setNewEmailDomain}
                                    handleAddEmailDomain={handleAddEmailDomain}
                                    addingEmailDomain={addingEmailDomain}
                                    copyToClipboard={copyToClipboard}
                                    saving={saving}
                                />
                            )}

                                        {/* Custom Domain */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Custom Domain
                                            </label>
                                            <p className="text-sm text-slate-500 mb-3">
                                                Connect your own domain to your store. You'll need to configure DNS settings with your domain registrar.
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customDomain}
                                                    onChange={(e) => setCustomDomain(e.target.value)}
                                                    placeholder="mystore.com"
                                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                                <button
                                                    onClick={handleDomainSave}
                                                    disabled={saving || domainStatus === 'checking'}
                                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {domainStatus === 'checking' && <Loader2 className="animate-spin" size={16} />}
                                                    {customDomain ? 'Save' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>

                            {activeTab === 'theme' && (
                                <ThemeSettings
                                    settings={settings}
                                    setSettings={setSettings}
                                    saveSettings={saveSettings}
                                    saving={saving}
                                />
                            )}

                            {activeTab === 'billing' && (
                                <BillingSettings
                                    settings={settings}
                                    handleConnectStripe={handleConnectStripe}
                                    saving={saving}
                                />
                            )}

                            {activeTab === 'team' && (
                                <TeamSettings
                                    isOwner={isOwner}
                                    inviteEmail={inviteEmail}
                                    setInviteEmail={setInviteEmail}
                                    inviteRole={inviteRole}
                                    setInviteRole={setInviteRole}
                                    handleInviteCollaborator={handleInviteCollaborator}
                                    inviting={inviting}
                                    collaborators={collaborators}
                                    handleRemoveCollaborator={handleRemoveCollaborator}
                                />
                            )}

                            {/* Developer Settings */}
                            {activeTab === 'developer' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Developer Settings</h2>
                                    <p className="text-sm text-slate-500 mb-6">Manage API keys for headless integrations with Cursor, Lovable, or custom apps.</p>

                                    <DeveloperSettings storeId={storeId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MediaManager
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={(url) => {
                    if (mediaTarget === 'logo') {
                        setSettings(prev => prev ? { ...prev, logo_url: url } : null);
                    } else if (mediaTarget === 'favicon') {
                        setSettings(prev => prev ? { ...prev, favicon_url: url } : null);
                    }
                    setIsMediaOpen(false);
                }}
            />

            {/* Invite Confirmation Dialog */}
            {showInviteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900">Invite to SwatBloc?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            The email <span className="font-medium text-slate-800">{pendingInviteEmail}</span> does not have a SwatBloc account.
                            <br /><br />
                            Would you like to send them an invite to join your team?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => { setShowInviteDialog(false); setPendingInviteEmail(""); }}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmInvite}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
