"use client";

import React from "react";
import { Task, Tag, Collaborator } from "../types";
import { TaskCard } from "./task-card";

interface TaskColumnProps {
  column: {
    id: string;
    title: string;
    icon: any;
    color: string;
  };
  tasks: Task[];
  tags: Tag[];
  collaborators: Collaborator[];
  isSelectionMode: boolean;
  selectedTaskIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (taskId: string, destStatus: Task['status'] | 'delete') => void;
  setIsInAbyssZone: (val: boolean) => void;
}

export function TaskColumn({
  column,
  tasks,
  tags,
  collaborators,
  isSelectionMode,
  selectedTaskIds,
  onToggleSelection,
  onTaskClick,
  onDragStart,
  onDragEnd,
  setIsInAbyssZone
}: TaskColumnProps) {
  const Icon = column.icon;

  return (
    <div 
        className="flex flex-col gap-4 min-h-[500px]"
        onDragOver={(e) => {
            e.preventDefault();
            setIsInAbyssZone(false);
        }}
        onDrop={(e) => {
            const taskId = e.dataTransfer.getData("taskId");
            onDragEnd(taskId, column.id as any);
        }}
    >
        <div className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm ${column.color}`}>
            <div className="flex items-center gap-2">
                <Icon size={18} />
                <h3 className="font-bold uppercase tracking-wider text-xs">{column.title}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {tasks.length}
                </span>
            </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 rounded-xl transition-colors duration-200">
            {tasks.map(task => (
                <TaskCard 
                    key={task.id}
                    task={task}
                    tags={tags}
                    collaborators={collaborators}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedTaskIds.has(task.id)}
                    onToggleSelection={onToggleSelection}
                    onClick={onTaskClick}
                    onDragStart={(e, id) => {
                        e.dataTransfer.setData("taskId", id);
                        onDragStart(id);
                    }}
                />
            ))}
            
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 opacity-50">
                    <p className="text-slate-400 text-xs text-center italic">
                        Empty column
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}
