"use client";

import React from "react";
import { User, Tag as TagIcon, FileText, Plus, Check, ArrowUpDown } from "lucide-react";
import { Tag } from "../types";

interface PlannerHeaderProps {
  storeName: string;
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
  selectedTaskCount: number;
  onExportClick: () => void;
  onPlusClick: () => void;
  filterMyTasks: boolean;
  setFilterMyTasks: (val: boolean) => void;
  filterTagId: string;
  setFilterTagId: (val: string) => void;
  tags: Tag[];
  sortBy: string;
  setSortBy: (val: any) => void;
  showAbyss: boolean;
  setShowAbyss: (val: boolean) => void;
}

export function PlannerHeader({
  storeName,
  isSelectionMode,
  setIsSelectionMode,
  selectedTaskCount,
  onExportClick,
  onPlusClick,
  filterMyTasks,
  setFilterMyTasks,
  filterTagId,
  setFilterTagId,
  tags,
  sortBy,
  setSortBy,
  showAbyss,
  setShowAbyss
}: PlannerHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                {showAbyss ? 'The Abyss' : `${storeName} Planner`}
            </h1>
            <p className="text-slate-500">
                {showAbyss ? 'Viewing archived tasks' : 'Manage your tasks and track progress'}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Sort & Filter Controls */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => setShowAbyss(!showAbyss)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    showAbyss ? 'bg-indigo-900 text-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                    {showAbyss ? 'Exit Abyss' : 'View Abyss'}
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button 
                    onClick={() => setFilterMyTasks(!filterMyTasks)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${filterMyTasks ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <User size={16} />
                    My Tasks
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-1" />
                
                <div className="relative flex items-center group">
                    <TagIcon size={16} className="absolute left-3 text-slate-400" />
                    <select 
                        value={filterTagId}
                        onChange={(e) => setFilterTagId(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer appearance-none"
                    >
                        <option value="all">All Tags</option>
                        {tags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <div className="relative flex items-center group">
                    <ArrowUpDown size={16} className="absolute left-3 text-slate-400" />
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="pl-9 pr-3 py-1.5 bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer appearance-none"
                    >
                        <option value="priority-high">Priority High</option>
                        <option value="priority-low">Priority Low</option>
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className={`px-4 py-2 border rounded-lg transition font-medium flex items-center gap-2 ${isSelectionMode ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <FileText size={18} />
                   {isSelectionMode ? 'Cancel Selection' : 'Export Mode'}
                </button>

                {isSelectionMode && selectedTaskCount > 0 && (
                    <button 
                        onClick={onExportClick}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium shadow-lg shadow-purple-200 animate-in fade-in slide-in-from-right-4"
                    >
                        <Check size={18} /> Export ({selectedTaskCount})
                    </button>
                )}

                {!isSelectionMode && (
                    <button 
                        onClick={onPlusClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} /> New Task
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}
