"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, CheckCircle2, Circle, Clock, Trash2, ArrowRight, ArrowLeft, Pencil, X, Save, Copy, FileText, Check, ArrowUpDown, AlertTriangle, Tag as TagIcon, Filter, User, PlayCircle, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  tag_ids?: string[];
  predecessor_id?: string;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'bg-slate-100 text-slate-600' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-green-50 text-green-600' }
];

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#64748b' },
];

export default function PlannerPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [newTaskPredecessorId, setNewTaskPredecessorId] = useState<string | null>(null);

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [editAssignee, setEditAssignee] = useState<string>("");
  const [editTags, setEditTags] = useState<string[]>([]);


  // Selection & Export State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [exportText, setExportText] = useState("");
  
  // Custom Instructions
  const [customInstructions, setCustomInstructions] = useState<{id: string, title: string, content: string}[]>([]);
  const [selectedInstructionIds, setSelectedInstructionIds] = useState<Set<string>>(new Set());
  const [newInstructionTitle, setNewInstructionTitle] = useState("");
  const [newInstructionContent, setNewInstructionContent] = useState("");
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('planner_custom_instructions');
    if (saved) {
      try {
        setCustomInstructions(JSON.parse(saved));
      } catch (e) { console.error("Failed to parse instructions", e); }
    }
  }, []);

  const saveCustomInstructions = (newInstructions: typeof customInstructions) => {
      setCustomInstructions(newInstructions);
      localStorage.setItem('planner_custom_instructions', JSON.stringify(newInstructions));
  };

  const handleAddInstruction = () => {
    if (!newInstructionTitle.trim() || !newInstructionContent.trim()) return;
    const newInst = {
        id: crypto.randomUUID(),
        title: newInstructionTitle,
        content: newInstructionContent
    };
    const updated = [...customInstructions, newInst];
    saveCustomInstructions(updated);
    setNewInstructionTitle("");
    setNewInstructionContent("");
    setIsAddingInstruction(false);
    // Auto-select the new instruction
    setSelectedInstructionIds(prev => new Set(prev).add(newInst.id));
  };

  const handleDeleteInstruction = (id: string) => {
      const updated = customInstructions.filter(i => i.id !== id);
      saveCustomInstructions(updated);
      setSelectedInstructionIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
      });
  };

  const toggleInstructionSelection = (id: string) => {
      setSelectedInstructionIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  // Delete Dialog State
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filter State
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [filterTagId, setFilterTagId] = useState<string>("all");
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].value);

  // Sorting State
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'priority-high' | 'priority-low'>('priority-high');

  useEffect(() => {
    const saved = localStorage.getItem('planner-sort-preference');
    if (saved) setSortBy(saved as any);
  }, []);

  useEffect(() => {
    localStorage.setItem('planner-sort-preference', sortBy);
  }, [sortBy]);

  useEffect(() => {
    fetchTasks();
    fetchTags();
    fetchCollaborators();
    fetchCurrentUser();
  }, [storeId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('store_task_tags').select('*').eq('store_id', storeId).order('name');
    if (data) setTags(data);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const fetchCollaborators = async () => {
    // Try to fetch with emails via RPC first
    const { data, error } = await supabase.rpc('get_store_collaborators_with_meta', { store_id_param: storeId });
    if (!error && data) {
      setCollaborators(data);
    } else {
        // Fallback to basic fetch if RPC missing
        const { data: basicData } = await supabase.from('store_collaborators').select('*').eq('store_id', storeId);
        if (basicData) setCollaborators(basicData);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName) return;
    const { data } = await supabase.from('store_task_tags').insert({ 
        store_id: storeId, 
        name: newTagName, 
        color: newTagColor 
    }).select().single();
    
    if (data) {
        setTags([...tags, data]);
        setNewTagName("");
        setNewTagColor(PRESET_COLORS[0].value);
        setIsTagManagerOpen(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    await supabase.from('store_task_tags').delete().eq('id', id);
    setTags(tags.filter(t => t.id !== id));
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { data, error } = await supabase
      .from('planner_tasks')
      .insert({
        store_id: storeId,
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        status: newTaskStatus,
        assignee_id: newTaskAssignee || null,
        tag_ids: newTaskTags,
        predecessor_id: newTaskPredecessorId
      })
      .select()
      .single();

    if (data) {
      setTasks([data as Task, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskAssignee("");
      setNewTaskTags([]);
      setNewTaskStatus('todo');
      setNewTaskPredecessorId(null);
      setNewTaskAssignee("");
      setNewTaskTags([]);
      setIsCreateOpen(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t);
    setTasks(updatedTasks);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus as any } : null);
    }

    await supabase
      .from('planner_tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
  };

  const deleteTask = async (taskId: string) => {
    setIsDeleting(true);
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('planner_tasks').delete().eq('id', taskId);
    setDeleteTaskId(null);
    setIsDeleting(false);
  };

  const confirmDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

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

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(false);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditAssignee(task.assignee_id || "");
    setEditTags(task.tag_ids || []);
  };

  const saveTaskChanges = async () => {
    if (!selectedTask || !editTitle.trim()) return;

    const updatedTask = {
      ...selectedTask,
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      status: editStatus,
      assignee_id: editAssignee || undefined,
      tag_ids: editTags
    };

    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setIsEditMode(false);

    await supabase
      .from('planner_tasks')
      .update({
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        status: editStatus,
        assignee_id: editAssignee || null,
        tag_ids: editTags
      })
      .eq('id', selectedTask.id);
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTaskIds(newSet);
  };

  // Generate export text optimized for LLM understanding
  const generateExportText = () => {
    const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));
    if (selectedTasks.length === 0) return "";

    const lines = selectedTasks.map(task => {
      let text = `## ${task.title}\n`;
      text += `**Priority:** ${task.priority.toUpperCase()}\n`;
      text += `**Status:** ${task.status.replace('-', ' ')}\n`;
      if (task.description) {
        text += `\n${task.description}\n`;
      } else {
        text += `\n_No description provided._\n`;
      }
      return text;
    });

    let finalText = `# Development Tasks\n\nThe following tasks need to be implemented:\n\n${lines.join('\n---\n\n')}`;
    
    if (selectedInstructionIds.size > 0) {
        finalText += `\n\n## Instructions\n`;
        // Sort to maintain consistency? Or just iteration order.
        customInstructions.filter(i => selectedInstructionIds.has(i.id)).forEach(inst => {
            finalText += `\n- [ ] ${inst.content}`;
        });
    }

    return finalText;
  };

  // Update export text when selection or options change
  useEffect(() => {
    if (isExportOpen) {
        setExportText(generateExportText());
    }
  }, [isExportOpen, selectedTaskIds, selectedInstructionIds, customInstructions]);

  const copyExportText = async () => {
    await navigator.clipboard.writeText(exportText);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  // Sorting logic
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const getSortedTasks = (tasksToSort: Task[]) => {
    let filtered = tasksToSort;

    // Filter by My Tasks
    if (filterMyTasks && currentUserId) {
        filtered = filtered.filter(t => t.assignee_id === currentUserId);
    }

    // Filter by Tag
    if (filterTagId && filterTagId !== 'all') {
        filtered = filtered.filter(t => t.tag_ids?.includes(filterTagId));
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority-high':
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'priority-low':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planner</h1>
          <p className="text-slate-500">Collaborate and track tasks with your team</p>
        </div>
        <div className="flex items-center gap-3">
          {/* My Tasks Toggle */}
          <button
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                filterMyTasks 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User size={16} />
            My Tasks
          </button>

          {/* Tag Filter */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg pr-2">
            <select
                value={filterTagId}
                onChange={(e) => setFilterTagId(e.target.value)}
                className="pl-3 py-2 text-sm bg-transparent outline-none cursor-pointer"
            >
                <option value="all">All Tags</option>
                {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
            </select>
            <button 
                onClick={() => setIsTagManagerOpen(true)}
                className="p-1 hover:bg-slate-100 rounded ml-1 text-slate-400"
                title="Manage Tags"
            >
                <TagIcon size={14} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority-high">Priority: High → Low</option>
            <option value="priority-low">Priority: Low → High</option>
          </select>

          {/* Selection Mode Toggle */}
          {isSelectionMode ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{selectedTaskIds.size} selected</span>
              <button
                onClick={() => { setIsExportOpen(true); }}
                disabled={selectedTaskIds.size === 0}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={18} /> Export
              </button>
              <button
                onClick={() => { setIsSelectionMode(false); setSelectedTaskIds(new Set()); }}
                className="text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 font-medium"
            >
              <FileText size={18} /> Export Tasks
            </button>
          )}

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden h-full">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className={`p-4 border-b border-slate-200 flex items-center justify-between ${col.color} bg-opacity-50`}>
              <div className="flex items-center gap-2 font-semibold">
                <col.icon size={18} />
                {col.title}
                <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getSortedTasks(tasks.filter(t => t.status === col.id)).map(task => {
                const isDone = col.id === 'done';
                const isSelected = selectedTaskIds.has(task.id);

                // Minimized card for done tasks
                if (isDone) {
                  return (
                    <motion.div 
                      layoutId={task.id}
                      key={task.id}
                      onClick={() => isSelectionMode ? toggleTaskSelection(task.id) : openTaskDialog(task)}
                      className={`bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition group cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                      }`}
                    >
                      {isSelectionMode && (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      )}
                      <h3 className="font-medium text-slate-900 flex-1 truncate">{task.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                        <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        {task.assignee_id && (
                             <span className="bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[80px]" title="Assignee">
                                {getAssigneeName(task.assignee_id)}
                             </span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDeleteTask(task.id); }} 
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'in-progress'); }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                          title="Move Back to In Progress"
                        >
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                // Full card for todo and in-progress
                return (
                  <motion.div 
                    layoutId={task.id}
                    key={task.id} 
                    onClick={() => isSelectionMode ? toggleTaskSelection(task.id) : openTaskDialog(task)}
                    className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition group cursor-pointer ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {isSelectionMode && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDeleteTask(task.id); }} 
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-slate-900 mb-1">{task.title}</h3>
                    
                    {/* Tags Display */}
                    {task.tag_ids && task.tag_ids.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.tag_ids.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                if (!tag) return null;
                                return (
                                    <span key={tagId} 
                                        className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                                        style={{ backgroundColor: tag.color + '20', borderColor: tag.color + '40', color: tag.color }}
                                    >
                                        {tag.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {task.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        {task.assignee_id && (
                          <span className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1 border border-slate-100" title="Assignee">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {getAssigneeName(task.assignee_id) || 'Unknown'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {col.id !== 'todo' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'todo'); }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Move Back"
                          >
                            <ArrowLeft size={14} />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, col.id === 'todo' ? 'in-progress' : 'done'); }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Move Forward"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
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
                    onClick={() => setIsCreateOpen(false)} 
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
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        className="w-full text-lg border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="What needs to be done?"
                        autoFocus
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select 
                            value={newTaskStatus}
                            onChange={e => setNewTaskStatus(e.target.value as any)}
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
                                    onClick={() => setNewTaskPriority(p as any)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition ${
                                        newTaskPriority === p 
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
                            value={newTaskAssignee}
                            onChange={e => setNewTaskAssignee(e.target.value)}
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
                            const isSelected = newTaskTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => {
                                        if (isSelected) setNewTaskTags(newTaskTags.filter(id => id !== tag.id));
                                        else setNewTaskTags([...newTaskTags, tag.id]);
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
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        className="w-full min-h-[200px] border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        placeholder="Add detailed description..."
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={createTask}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2"
                >
                    <Plus size={16} /> Create Task
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Dialog */
      selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(isEditMode ? editPriority : selectedTask.priority)}`}>
                    {isEditMode ? editPriority : selectedTask.priority}
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
                    onClick={() => setSelectedTask(null)} 
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
                                    {['low', 'medium', 'high'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setEditPriority(p as any)}
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
                                {selectedTask.title}
                            </h2>
                            {selectedTask.tag_ids && selectedTask.tag_ids.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedTask.tag_ids.map(tagId => {
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
                            {selectedTask.description ? (
                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {selectedTask.description}
                                </p>
                            ) : (
                                <p className="text-slate-400 italic">No description provided.</p>
                            )}
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    Status: <span className="font-medium capitalize text-slate-900">{selectedTask.status.replace('-', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Circle size={16} />
                                    ID: <span className="font-mono text-xs">{selectedTask.id.slice(0, 8)}</span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                 {selectedTask.status === 'todo' && (
                                    <button 
                                        onClick={() => updateTaskStatus(selectedTask.id, 'in-progress')}
                                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                    >
                                        <PlayCircle size={16} />
                                        Move to In Progress
                                    </button>
                                 )}

                                 {(selectedTask.status === 'in-progress' || selectedTask.status === 'done') && (
                                    <>
                                        <button 
                                            onClick={() => updateTaskStatus(selectedTask.id, 'done')}
                                            className="text-slate-600 hover:text-slate-700 font-medium flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Check size={16} />
                                            Complete
                                        </button>
                                        <button 
                                            onClick={() => {
                                                updateTaskStatus(selectedTask.id, 'done');
                                                setSelectedTask(null);
                                                // Delay opening new task to allow dialog close
                                                setTimeout(() => {
                                                    setNewTaskPredecessorId(selectedTask.id);
                                                    setNewTaskTitle(selectedTask.title);
                                                    setIsCreateOpen(true);
                                                }, 300);
                                            }}
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

             {/* Floating Timeline Navigation Buttons */}
             {selectedTask && !isEditMode && (
                <>
                   {(tasks.find(t => t.id === selectedTask.predecessor_id) || selectedTask.predecessor_id) && (
                       <button 
                           onClick={() => {
                               const pred = tasks.find(t => t.id === selectedTask.predecessor_id);
                               if (pred) setSelectedTask(pred);
                           }}
                           className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-lg transition disabled:opacity-50 hidden md:block"
                           title="Previous Task"
                           disabled={!tasks.find(t => t.id === selectedTask.predecessor_id)}
                       >
                           <ChevronLeft size={24} />
                       </button>
                   )}
                   {(tasks.find(t => t.predecessor_id === selectedTask.id)) && (
                       <button 
                           onClick={() => {
                               const succ = tasks.find(t => t.predecessor_id === selectedTask.id);
                               if (succ) setSelectedTask(succ);
                           }}
                           className="absolute -right-16 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-lg transition hidden md:block"
                           title="Next Task"
                       >
                           <ChevronRight size={24} />
                       </button>
                   )}
                </>
             )}

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
                        onClick={saveTaskChanges}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-purple-600" />
                <h3 className="font-bold text-lg">Export Tasks for AI</h3>
              </div>
              <button 
                onClick={() => setIsExportOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
              <p className="text-sm text-slate-500">
                Copy and paste this text into your AI code editor (Cursor, Lovable, etc.) to have it implement these tasks:
              </p>
              
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-slate-700">Custom Instructions</h4>
                    <button 
                        onClick={() => setIsAddingInstruction(!isAddingInstruction)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                        {isAddingInstruction ? 'Cancel' : '+ Add New'}
                    </button>
                </div>

                {isAddingInstruction && (
                    <div className="mb-4 bg-white p-3 rounded border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <input 
                            placeholder="Instruction Title (e.g. 'Build')"
                            className="w-full mb-2 px-2 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                            value={newInstructionTitle}
                            onChange={e => setNewInstructionTitle(e.target.value)}
                        />
                         <textarea 
                            placeholder="Detailed instruction text..."
                            className="w-full mb-2 px-2 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 h-20 resize-none"
                            value={newInstructionContent}
                            onChange={e => setNewInstructionContent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleAddInstruction}
                                disabled={!newInstructionTitle.trim() || !newInstructionContent.trim()}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                Add Instruction
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                    {customInstructions.length === 0 && !isAddingInstruction && (
                        <p className="text-xs text-slate-400 italic text-center py-2">No custom instructions saved.</p>
                    )}
                    
                    {customInstructions.map(inst => (
                         <div key={inst.id} className="flex items-center justify-between group hover:bg-white p-1 rounded transition">
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none flex-1 truncate">
                                <input 
                                    type="checkbox" 
                                    checked={selectedInstructionIds.has(inst.id)} 
                                    onChange={() => toggleInstructionSelection(inst.id)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="truncate" title={inst.content}>{inst.title}</span>
                            </label>
                            <button 
                                onClick={() => handleDeleteInstruction(inst.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition"
                                title="Delete Instruction"
                            >
                                <X size={14} />
                            </button>
                         </div>
                    ))}
                </div>
              </div>

              <textarea 
                value={exportText}
                onChange={(e) => setExportText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-mono text-slate-900 whitespace-pre-wrap overflow-y-auto h-[400px] w-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-500">
                {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
              </span>
              <button 
                onClick={copyExportText}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium"
              >
                {exportCopied ? <Check size={18} /> : <Copy size={18} />}
                {exportCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Delete Task?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This action cannot be undone. The task &quot;{tasks.find(t => t.id === deleteTaskId)?.title}&quot; will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteTaskId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteTask(deleteTaskId)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Clock size={16} /></motion.div>}
                  {isDeleting ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Manager Dialog */}
      {isTagManagerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Manage Tags</h3>
              <button onClick={() => setIsTagManagerOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                            onClick={handleCreateTag}
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
                                    onClick={() => handleDeleteTag(tag.id)}
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
      )}
    </div>
  );
}
