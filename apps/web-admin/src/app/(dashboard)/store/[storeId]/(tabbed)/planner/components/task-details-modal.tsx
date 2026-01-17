"use client";

import React, { useState, useEffect } from "react";
import { 
    X, Pencil, Save, Clock, Circle, PlayCircle, 
    Check, CheckCircle2, Plus 
} from "lucide-react";
import { Tag, Collaborator, Task } from "../types";

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onUpdateStatus: (taskId: string, status: Task['status']) => Promise<void>;
  onCompleteAndFollowUp: (task: Task) => void;
  tags: Tag[];
  collaborators: Collaborator[];
  setIsTagManagerOpen: (val: boolean) => void;
}

export function TaskDetailsModal({
  task,
  onClose,
  onUpdate,
  onUpdateStatus,
  onCompleteAndFollowUp,
  tags,
  collaborators,
  setIsTagManagerOpen
}: TaskDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<Task['priority']>('medium');
  const [editStatus, setEditStatus] = useState<Task['status']>('todo');
  const [editAssignee, setEditAssignee] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description || "");
      setEditPriority(task.priority);
      setEditStatus(task.status);
      setEditAssignee(task.assignee_id || "");
      setEditTags(task.tag_ids || []);
      setIsEditMode(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    await onUpdate(task.id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      status: editStatus,
      assignee_id: editAssignee || undefined,
      tag_ids: editTags
    });
    setIsEditMode(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(isEditMode ? editPriority : task.priority)}`}>
                {isEditMode ? editPriority : task.priority}
             </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode && (
                <button 
                    onClick={() => setIsEditMode(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                    title="Edit Task"
                >
                    <Pencil size={18} />
                </button>
            )}
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {isEditMode ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full text-lg border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select 
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value as any)}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setEditPriority(p)}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize border transition ${
                                            editPriority === p 
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
                                value={editAssignee}
                                onChange={e => setEditAssignee(e.target.value)}
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
                                const isSelected = editTags.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => {
                                            if (isSelected) setEditTags(editTags.filter(id => id !== tag.id));
                                            else setEditTags([...editTags, tag.id]);
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
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            className="w-full min-h-[200px] border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            placeholder="Add detailed description..."
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                            {task.title}
                        </h2>
                        {task.tag_ids && task.tag_ids.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {task.tag_ids.map(tagId => {
                                    const tag = tags.find(t => t.id === tagId);
                                    if (!tag) return null;
                                    return (
                                        <span key={tagId} 
                                            className="text-xs px-2 py-1 rounded-full border font-medium"
                                            style={{ backgroundColor: tag.color + '20', borderColor: tag.color + '40', color: tag.color }}
                                        >
                                            {tag.name}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        {task.description ? (
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {task.description}
                            </p>
                        ) : (
                            <p className="text-slate-400 italic">No description provided.</p>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                Status: <span className="font-medium capitalize text-slate-900">{task.status.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Circle size={16} />
                                ID: <span className="font-mono text-xs">{task.id.slice(0, 8)}</span>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                             {task.status === 'todo' && (
                                <button 
                                    onClick={() => onUpdateStatus(task.id, 'in-progress')}
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                >
                                    <PlayCircle size={16} />
                                    Move to In Progress
                                </button>
                             )}

                             {(task.status === 'in-progress' || task.status === 'done') && (
                                <>
                                    <button 
                                        onClick={() => onUpdateStatus(task.id, 'done')}
                                        className="text-slate-600 hover:text-slate-700 font-medium flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                                    >
                                        <Check size={16} />
                                        Complete
                                    </button>
                                    <button 
                                        onClick={() => onCompleteAndFollowUp(task)}
                                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                    >
                                        <CheckCircle2 size={16} />
                                        Complete & Follow Up
                                    </button>
                                </>
                             )}
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Buttons for Edit Mode (Cancel) */}
        {isEditMode && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
