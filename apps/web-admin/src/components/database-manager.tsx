"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Database, Table, Trash2, Save, X, Edit2, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContentModel = {
    id: string;
    name: string;
    slug: string;
    schema: {
        fields: {
            key: string;
            type: string;
            required?: boolean;
            label?: string;
        }[];
    };
    created_at: string;
};

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'True/False' },
    { value: 'image', label: 'Image' },
    { value: 'date', label: 'Date' },
    { value: 'json', label: 'JSON' },
    { value: 'reference', label: 'Reference' },
];

export function DatabaseManager({ storeId }: { storeId: string }) {
    const [models, setModels] = useState<ContentModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [newFields, setNewFields] = useState<ContentModel['schema']['fields']>([]);

    const supabase = createClient();

    useEffect(() => {
        loadModels();
    }, [storeId]);

    async function loadModels() {
        setLoading(true);
        const { data, error } = await supabase
            .from('content_models')
            .select('*')
            .eq('store_id', storeId)
            .order('name');
        
        if (data) setModels(data);
        setLoading(false);
    }

    // Auto-generate slug
    useEffect(() => {
        if (isCreating) {
            setNewSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [newName, isCreating]);

    function addField() {
        setNewFields([...newFields, { key: `field_${newFields.length + 1}`, type: 'text', label: '', required: false }]);
    }

    function removeField(index: number) {
        setNewFields(newFields.filter((_, i) => i !== index));
    }

    function updateField(index: number, key: keyof typeof newFields[0], value: any) {
        const updated = [...newFields];
        updated[index] = { ...updated[index], [key]: value };
        setNewFields(updated);
    }

    async function handleCreate() {
        setSaving(true);
        const { data, error } = await supabase
            .from('content_models')
            .insert({
                store_id: storeId,
                name: newName,
                slug: newSlug,
                schema: { fields: newFields }
            })
            .select()
            .single();

        if (error) {
            alert(error.message);
        } else {
            setModels([...models, data]);
            setIsCreating(false);
            setNewName("");
            setNewFields([]);
        }
        setSaving(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Custom Databases</h2>
                    <p className="text-zinc-500 mt-1">Defines schemas for dynamic content collections.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Database
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map(model => (
                        <div key={model.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Database className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                                    {model.schema?.fields?.length || 0} fields
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{model.name}</h3>
                            <code className="text-xs text-zinc-500 font-mono block mb-4 flex items-center gap-1">
                                <Code2 className="w-3 h-3"/> {model.slug}
                            </code>
                            
                            <div className="text-sm text-zinc-500 space-y-1">
                                <p className="font-medium text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-wider mb-2">Schema Preview</p>
                                {model.schema.fields.length === 0 && <p className="italic text-zinc-400">No strict schema</p>}
                                {model.schema.fields.slice(0, 4).map(f => (
                                    <div key={f.key} className="flex justify-between text-xs">
                                        <span>{f.key}</span>
                                        <span className="text-zinc-400 font-mono">{f.type}</span>
                                    </div>
                                ))}
                                {model.schema.fields.length > 4 && <div className="text-xs text-zinc-400 italic">+{model.schema.fields.length - 4} more...</div>}
                            </div>
                        </div>
                    ))}

                    {models.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-dashed border-2 border-zinc-200">
                            <Table className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                            <h3 className="font-medium text-zinc-900">No databases yet</h3>
                            <p className="text-zinc-500 text-sm mt-1">Create your first collection to start storing structured data.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">New Database</h2>
                                    <p className="text-sm text-zinc-500">Define the schema for your collection.</p>
                                </div>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="e.g. Liability Photos"
                                            className="w-full px-3 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Slug (API Key)</label>
                                        <input 
                                            type="text" 
                                            value={newSlug}
                                            onChange={(e) => setNewSlug(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-mono text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <label className="text-sm font-medium">Schema Fields</label>
                                        <button 
                                            onClick={addField}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1 px-2 py-1 bg-blue-50 rounded"
                                        >
                                            <Plus className="w-3 h-3" /> Add Field
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {newFields.map((field, i) => (
                                            <div key={i} className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg group border border-transparent hover:border-zinc-200 transition-colors">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Field Key</label>
                                                    <input 
                                                        type="text" 
                                                        value={field.key}
                                                        onChange={(e) => updateField(i, 'key', e.target.value)}
                                                        placeholder="field_key"
                                                        className="w-full text-sm bg-white dark:bg-zinc-900 border rounded px-2 py-1 outline-none font-mono focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Type</label>
                                                    <select 
                                                        value={field.type}
                                                        onChange={(e) => updateField(i, 'type', e.target.value)}
                                                        className="w-full text-sm bg-white dark:bg-zinc-900 border rounded px-2 py-1 outline-none"
                                                    >
                                                        {FIELD_TYPES.map(t => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="pt-6">
                                                     <label className="text-xs flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                                         <input 
                                                             type="checkbox" 
                                                             checked={field.required}
                                                             onChange={(e) => updateField(i, 'required', e.target.checked)}
                                                             className="rounded border-zinc-300"
                                                         /> 
                                                         <span className="select-none">Required</span>
                                                     </label>
                                                </div>
                                                <div className="pt-6 pl-2">
                                                    <button 
                                                        onClick={() => removeField(i)}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {newFields.length === 0 && (
                                            <div className="text-center py-8 text-zinc-400 text-sm italic bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                No fields defined. This collection will store generic JSON.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white dark:bg-zinc-900 p-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreate}
                                    disabled={saving || !newName}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                                    Create Database
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
