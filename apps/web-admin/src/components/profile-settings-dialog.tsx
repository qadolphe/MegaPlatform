"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { X, Save, User as UserIcon, Loader2 } from "lucide-react";

interface ProfileSettingsDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: () => void;
}

export function ProfileSettingsDialog({ user, isOpen, onClose, onProfileUpdate }: ProfileSettingsDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    setFetching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .limit(1); // Relaxed from .single() to avoid 406 on missing rows
    
    if (data && data.length > 0) {
      setFirstName(data[0].first_name || "");
      setLastName(data[0].last_name || "");
    }
    setFetching(false);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Check if profile exists safely
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).limit(1);
    const exists = existing && existing.length > 0;

    let error;
    if (exists) {
       const { error: updateError } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user.id);
       error = updateError;
    } else {
       const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, first_name: firstName, last_name: lastName });
       error = insertError;
    }

    setLoading(false);
    if (!error) {
      onProfileUpdate();
      onClose();
    } else {
      alert('Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col relative top-0">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
          <h3 className="font-bold text-xl flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-100 rounded-lg">
                <UserIcon size={20} className="text-slate-600" />
            </div>
            Profile Settings
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {firstName ? firstName[0].toUpperCase() : (user.email?.[0].toUpperCase() || "U")}
                 </div>
                 <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="text-sm text-slate-500">Pro Plan</p>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || fetching}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
