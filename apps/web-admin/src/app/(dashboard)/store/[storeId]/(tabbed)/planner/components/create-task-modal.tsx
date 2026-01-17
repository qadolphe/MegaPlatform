"use client";

import React, { useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { Tag, Collaborator, Task } from "../types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (taskData: any) => Promise<void>;
  tags: Tag[];
  collaborators: Collaborator[];
  setIsTagManagerOpen: (val: boolean) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  tags,
  collaborators,
  setIsTagManagerOpen
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [assignee, setAssignee] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreate({
      title,
      description: desc,
      priority,
      status,
      assignee_id: assignee || null,
      tag_ids: selectedTags
    });

    // Reset and close is handled by parent or here?
    // Usually better to let the parent handle the success logic if it needs to update state.
    // But we can reset local state here.
    setTitle("");
    setDesc("");
    setAssignee("");
    setSelectedTags([]);
    setStatus('todo');
    setPriority('medium');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-100 text-blue-700`}>
                NEW
             </span>
             <h3 className="font-bold text-lg text-slate-900">Create Task</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-lg border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="What needs to be done?"
                    autoFocus
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <div className="flex gap-2">
                        {['low', 'medium', 'high'].map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p as any)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition ${
                                    priority === p 
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <select 
                        value={assignee}
                        onChange={e => setAssignee(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="">Unassigned</option>
                        {collaborators.map(c => (
                          <option key={c.id} value={c.user_id}>
                            {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}` : (c.email || `User ${c.user_id.slice(0, 4)}`)}
                          </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => {
                                    if (isSelected) setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                    else setSelectedTags([...selectedTags, tag.id]);
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-medium border transition flex items-center gap-1 ${
                                    isSelected 
                                    ? 'ring-2 ring-offset-1' 
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                                style={{ 
                                    backgroundColor: tag.color + '20', 
                                    borderColor: tag.color, 
                                    color: tag.color,
                                    boxShadow: isSelected ? `0 0 0 2px ${tag.color}` : 'none'
                                }}
                            >
                                {tag.name} {isSelected && <Check size={10} />}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => { setIsTagManagerOpen(true); }}
                        className="px-2 py-1 rounded-full text-xs font-medium border border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center gap-1"
                    >
                        <Plus size={12} /> Manage Tags
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full min-h-[200px] border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    placeholder="Add detailed description..."
                />
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2"
            >
                <Plus size={16} /> Create Task
            </button>
        </div>
      </div>
    </div>
  );
}
