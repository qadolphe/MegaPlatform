"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendTaskAssignmentEmail } from "./actions";

// Types
import { Task, Tag, Collaborator } from "./types";
import { COLUMNS } from "./constants";

// Components
import { PlannerHeader } from "./components/planner-header";
import { TaskColumn } from "./components/task-column";
import { CreateTaskModal } from "./components/create-task-modal";
import { TaskDetailsModal } from "./components/task-details-modal";
import { ExportModal } from "./components/export-modal";
import { TagManagerModal } from "./components/tag-manager-modal";
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal";
import { PlannerAbyss } from "./components/planner-abyss";

export default function PlannerPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskPredecessorId, setNewTaskPredecessorId] = useState<string | null>(null);

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Selection & Export State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [exportText, setExportText] = useState("");
  
  // Custom Instructions
  const [customInstructions, setCustomInstructions] = useState<{id: string, title: string, content: string}[]>([]);
  const [selectedInstructionIds, setSelectedInstructionIds] = useState<Set<string>>(new Set());

  // Delete Dialog State
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("Store");

  // Filter & Sorting State
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [filterTagId, setFilterTagId] = useState<string>("all");
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'priority-high' | 'priority-low'>('priority-high');
  const [showAbyss, setShowAbyss] = useState(false);

  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isInAbyssZone, setIsInAbyssZone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('planner_custom_instructions');
    if (saved) {
      try {
        setCustomInstructions(JSON.parse(saved));
      } catch (e) { console.error("Failed to parse instructions", e); }
    }
    
    const sortSaved = localStorage.getItem('planner-sort-preference');
    if (sortSaved) setSortBy(sortSaved as any);

    fetchTasks();
    fetchTags();
    fetchCollaborators();
    fetchCurrentUser();
    fetchStoreName();
  }, [storeId]);

  useEffect(() => {
    localStorage.setItem('planner-sort-preference', sortBy);
  }, [sortBy]);

  // Data Fetching
  const fetchStoreName = async () => {
    const { data } = await supabase.from('stores').select('name').eq('id', storeId).single();
    if (data) setStoreName(data.name);
  };

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('store_task_tags').select('*').eq('store_id', storeId).order('name');
    if (data) setTags(data);
  };

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const fetchCollaborators = async () => {
    let allCollaborators: Collaborator[] = [];
    const { data, error } = await supabase.rpc('get_store_collaborators_with_meta', { store_id_param: storeId });
    if (!error && data) {
      allCollaborators = [...data];
    } else {
        const { data: basicData } = await supabase.from('store_collaborators').select('*').eq('store_id', storeId);
        if (basicData) allCollaborators = [...basicData];
    }

    const { data: store } = await supabase.from('stores').select('owner_id').eq('id', storeId).single();
    if (store) {
        if (!allCollaborators.some(c => c.user_id === store.owner_id)) {
             const { data: { user } } = await supabase.auth.getUser();
             if (user && user.id === store.owner_id) {
                 allCollaborators.push({
                     id: 'owner-placeholder',
                     user_id: user.id,
                     email: user.email,
                     first_name: user.user_metadata?.first_name || 'Store',
                     last_name: user.user_metadata?.last_name || 'Owner'
                 });
             } else {
                 allCollaborators.push({
                     id: 'owner-placeholder',
                     user_id: store.owner_id,
                     first_name: 'Store',
                     last_name: 'Owner',
                     email: ''
                 });
             }
        }
    }
    setCollaborators(allCollaborators);
  };

  // Actions
  const notifyAssignee = async (assigneeId: string, taskTitle: string) => {
    if (!assigneeId || assigneeId === currentUserId) return;
    const collaborator = collaborators.find(c => c.user_id === assigneeId);
    if (!collaborator?.email) return;

    const currentUserProfile = collaborators.find(c => c.user_id === currentUserId);
    const assignerName = currentUserProfile 
        ? (currentUserProfile.first_name || currentUserProfile.last_name 
            ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}`.trim() 
            : currentUserProfile.email) 
        : "Someone";

    await sendTaskAssignmentEmail({
      toEmail: collaborator.email,
      taskTitle,
      storeName,
      assignerName: assignerName || "Co-worker",
    });
  };

  const handleCreateTask = async (taskData: any) => {
    const { data } = await supabase
      .from('planner_tasks')
      .insert({
        store_id: storeId,
        ...taskData,
        predecessor_id: newTaskPredecessorId
      })
      .select()
      .single();

    if (data) {
      setTasks([data as Task, ...tasks]);
      if (taskData.assignee_id) {
          notifyAssignee(taskData.assignee_id, taskData.title);
      }
      setNewTaskPredecessorId(null);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Notify if assignee changed
    if (updates.assignee_id && updates.assignee_id !== tasks.find(t => t.id === taskId)?.assignee_id) {
        notifyAssignee(updates.assignee_id, updates.title || tasks.find(t => t.id === taskId)!.title);
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    await supabase.from('planner_tasks').update(updates).eq('id', taskId);
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await supabase.from('planner_tasks').update({ status: newStatus }).eq('id', taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsDeleting(true);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await supabase.from('planner_tasks').delete().eq('id', taskId);
    setDeleteTaskId(null);
    setIsDeleting(false);
  };

  const handleCreateTag = async (name: string, color: string) => {
    const { data } = await supabase.from('store_task_tags').insert({ 
        store_id: storeId, 
        name, 
        color 
    }).select().single();
    if (data) setTags([...tags, data]);
  };

  const handleDeleteTag = async (id: string) => {
    await supabase.from('store_task_tags').delete().eq('id', id);
    setTags(tags.filter(t => t.id !== id));
  };

  const handleAddInstruction = (title: string, content: string) => {
    const newInst = { id: crypto.randomUUID(), title, content };
    const updated = [...customInstructions, newInst];
    setCustomInstructions(updated);
    localStorage.setItem('planner_custom_instructions', JSON.stringify(updated));
    setSelectedInstructionIds(prev => new Set(prev).add(newInst.id));
  };

  const handleDeleteInstruction = (id: string) => {
    const updated = customInstructions.filter(i => i.id !== id);
    setCustomInstructions(updated);
    localStorage.setItem('planner_custom_instructions', JSON.stringify(updated));
    setSelectedInstructionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });
  };

  const handleCompleteAndFollowUp = (task: Task) => {
      updateTaskStatus(task.id, 'done');
      setSelectedTask(null);
      setTimeout(() => {
          setNewTaskPredecessorId(task.id);
          setIsCreateOpen(true);
      }, 300);
  };

  // Logic Helpers
  const sortedAndFilteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Abyss Filtering (4 days)
    const ABYSS_THRESHOLD = 4 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    
    if (showAbyss) {
        // Only show finished tasks older than 4 days
        result = result.filter(t => t.status === 'done' && (now - new Date(t.updated_at).getTime() > ABYSS_THRESHOLD));
    } else {
        // Default: Hide finished tasks older than 4 days
        result = result.filter(t => !(t.status === 'done' && (now - new Date(t.updated_at).getTime() > ABYSS_THRESHOLD)));
    }

    if (filterMyTasks && currentUserId) {
        result = result.filter(t => t.assignee_id === currentUserId);
    }
    
    if (filterTagId !== 'all') {
        result = result.filter(t => t.tag_ids?.includes(filterTagId));
    }

    result.sort((a, b) => {
        if (sortBy === 'priority-high' || sortBy === 'priority-low') {
            const weights = { high: 3, medium: 2, low: 1 };
            const diff = weights[a.priority] - weights[b.priority];
            return sortBy === 'priority-high' ? -diff : diff;
        }
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortBy === 'date-desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [tasks, filterMyTasks, filterTagId, sortBy, currentUserId, showAbyss]);

  const generateExportText = () => {
    const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));
    let text = "Implement these tasks:\n\n";
    
    selectedTasks.forEach((t, i) => {
        text += `${i+1}. ${t.title.toUpperCase()}\n`;
        if (t.description) text += `Description: ${t.description}\n`;
        const taskTags = tags.filter(tag => t.tag_ids?.includes(tag.id)).map(tag => tag.name);
        if (taskTags.length > 0) text += `Tags: ${taskTags.join(', ')}\n`;
        text += `Priority: ${t.priority}\n\n`;
    });

    if (selectedInstructionIds.size > 0) {
        text += "--- CUSTOM INSTRUCTIONS ---\n";
        customInstructions.forEach(inst => {
            if (selectedInstructionIds.has(inst.id)) {
                text += `\n[${inst.title}]\n${inst.content}\n`;
            }
        });
    }

    setExportText(text);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleDragStart = (id: string) => setActiveId(id);
  const handleDragEnd = (taskId: string, destStatus: Task['status'] | 'delete') => {
      setActiveId(null);
      setIsInAbyssZone(false);
      if (destStatus === 'delete') {
          setDeleteTaskId(taskId);
      } else {
          updateTaskStatus(taskId, destStatus);
      }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-12rem)]">
      
      <PlannerHeader 
        storeName={storeName}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        selectedTaskCount={selectedTaskIds.size}
        onExportClick={() => { generateExportText(); setIsExportOpen(true); }}
        onPlusClick={() => { setNewTaskPredecessorId(null); setIsCreateOpen(true); }}
        filterMyTasks={filterMyTasks}
        setFilterMyTasks={setFilterMyTasks}
        filterTagId={filterTagId}
        setFilterTagId={setFilterTagId}
        tags={tags}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showAbyss={showAbyss}
        setShowAbyss={setShowAbyss}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => (
          <TaskColumn 
            key={column.id}
            column={column}
            tasks={sortedAndFilteredTasks.filter(t => t.status === column.id)}
            tags={tags}
            collaborators={collaborators}
            isSelectionMode={isSelectionMode}
            selectedTaskIds={selectedTaskIds}
            onToggleSelection={toggleTaskSelection}
            onTaskClick={setSelectedTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            setIsInAbyssZone={setIsInAbyssZone}
          />
        ))}
      </div>

      <PlannerAbyss 
        isDragging={!!activeId} 
        isInAbyss={isInAbyssZone} 
        setIsInAbyss={setIsInAbyssZone}
        onDrop={(taskId) => handleDragEnd(taskId, 'delete')}
      />

      {/* Modals */}
      <CreateTaskModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTask}
        tags={tags}
        collaborators={collaborators}
        setIsTagManagerOpen={setIsTagManagerOpen}
      />

      <TaskDetailsModal 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onUpdateStatus={updateTaskStatus}
        onCompleteAndFollowUp={handleCompleteAndFollowUp}
        tags={tags}
        collaborators={collaborators}
        setIsTagManagerOpen={setIsTagManagerOpen}
      />

      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        exportText={exportText}
        setExportText={setExportText}
        onCopy={handleCopyExport}
        exportCopied={exportCopied}
        selectedTaskCount={selectedTaskIds.size}
        customInstructions={customInstructions}
        onAddInstruction={handleAddInstruction}
        onDeleteInstruction={handleDeleteInstruction}
        selectedInstructionIds={selectedInstructionIds}
        onToggleInstruction={(id) => setSelectedInstructionIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        })}
      />

      <TagManagerModal 
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tags}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={async () => {
            if (deleteTaskId) {
                await handleDeleteTask(deleteTaskId);
            }
        }}
        taskTitle={tasks.find(t => t.id === deleteTaskId)?.title || ""}
        isDeleting={isDeleting}
      />

    </div>
  );
}
