"use client";

import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Tag } from "../types";
import { PRESET_COLORS } from "../constants";

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}

export function TagManagerModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onDeleteTag
}: TagManagerModalProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].value);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newTagName) return;
    await onCreateTag(newTagName, newTagColor);
    setNewTagName("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Manage Tags</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
            <div className="mb-4 space-y-2">
                <label className="text-sm font-medium text-slate-700">Add New Tag</label>
                <div className="flex gap-2">
                    <input 
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tag name"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleCreate}
                        disabled={!newTagName}
                        className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setNewTagColor(c.value)}
                            className={`w-6 h-6 rounded-full border-2 transition ${newTagColor === c.value ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Existing Tags</label>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {tags.length === 0 && <span className="text-sm text-slate-400 italic">No tags created yet.</span>}
                    {tags.map(tag => (
                        <div key={tag.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span 
                                className="px-2 py-1 rounded-full text-xs font-medium border"
                                style={{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }}
                            >
                                {tag.name}
                            </span>
                            <button 
                                onClick={() => onDeleteTag(tag.id)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
