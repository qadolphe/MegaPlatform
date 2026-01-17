"use client";

import React from "react";
import { Check, User, Tag as TagIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Task, Tag, Collaborator } from "../types";

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  collaborators: Collaborator[];
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export function TaskCard({
  task,
  tags,
  collaborators,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  onClick,
  onDragStart
}: TaskCardProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getAssigneeName = (userId: string) => {
    const c = collaborators.find(c => c.user_id === userId);
    if (!c) return null;
    if (c.first_name || c.last_name) return `${c.first_name || ''} ${c.last_name || ''}`.trim();
    return c.email || `User ${userId.slice(0, 4)}`;
  };

  return (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
    >
        <motion.div
            layout
            onClick={() => isSelectionMode ? onToggleSelection(task.id) : onClick(task)}
            className={`group bg-white p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                isSelected 
                ? 'border-purple-500 shadow-purple-100 shadow-lg scale-[1.02]' 
                : 'border-white hover:border-slate-200'
            }`}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                    {isSelectionMode && (
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                        </div>
                    )}
                </div>
                
                <h4 className={`font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                </h4>
                
                {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {task.tag_ids && task.tag_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {task.tag_ids.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span key={tagId} 
                                    className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-100 font-medium"
                                    style={{ backgroundColor: tag.color + '15', color: tag.color }}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-400">
                        <User size={12} />
                        <span className="text-[10px] font-medium uppercase truncate max-w-[80px]">
                            {task.assignee_id ? getAssigneeName(task.assignee_id) : 'Unassigned'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px]">
                            {new Date(task.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
