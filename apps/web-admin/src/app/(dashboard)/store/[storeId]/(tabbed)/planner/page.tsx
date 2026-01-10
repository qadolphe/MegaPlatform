"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, CheckCircle2, Circle, Clock, Trash2, ArrowRight, ArrowLeft, Pencil, X, Save, Copy, FileText, Check, ArrowUpDown, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  created_at: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  email?: string;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'bg-slate-100 text-slate-600' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-green-50 text-green-600' }
];

export default function PlannerPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [editAssignee, setEditAssignee] = useState<string>("");


  // Selection & Export State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  // Delete Dialog State
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

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
    fetchCollaborators();
  }, [storeId]);

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
    const { data } = await supabase.from('store_collaborators').select('*').eq('store_id', storeId);
    if (data) setCollaborators(data);
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
        status: 'todo',
        assignee_id: newTaskAssignee || null
      })
      .select()
      .single();

    if (data) {
      setTasks([data as Task, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskAssignee("");
      setIsCreateOpen(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

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
    return c.email ? c.email.split('@')[0] : `User ${userId.slice(0, 2)}`;
  };

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(false);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditAssignee(task.assignee_id || "");
  };

  const saveTaskChanges = async () => {
    if (!selectedTask || !editTitle.trim()) return;

    const updatedTask = {
      ...selectedTask,
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      status: editStatus,
      assignee_id: editAssignee || undefined
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
        assignee_id: editAssignee || null
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

    return `# Development Tasks\n\nThe following tasks need to be implemented:\n\n${lines.join('\n---\n\n')}`;
  };

  const copyExportText = async () => {
    const text = generateExportText();
    await navigator.clipboard.writeText(text);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  // Sorting logic
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const getSortedTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">New Task</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={createTask} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                  placeholder="Add details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border ${
                        newTaskPriority === p 
                          ? 'bg-blue-50 border-blue-500 text-blue-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <select
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Unassigned</option>
                  {collaborators.map(c => (
                    <option key={c.id} value={c.user_id}>
                      {c.email || `User ${c.user_id.slice(0, 4)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
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
                 <span className="text-slate-400 text-sm">
                    {new Date(selectedTask.created_at).toLocaleDateString()}
                 </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                    <button 
                        onClick={() => setIsEditMode(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        title="Edit Task"
                    >
                        <Pencil size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={saveTaskChanges}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition flex items-center gap-2 px-3"
                        title="Save Changes"
                    >
                        <Save size={16} /> Save
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
                                <select 
                                    value={editPriority}
                                    onChange={e => setEditPriority(e.target.value as any)}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
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
                                        {c.email || `User ${c.user_id.slice(0, 4)}`}
                                      </option>
                                    ))}
                                </select>
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
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                {selectedTask.title}
                            </h2>
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

                        <div className="pt-6 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                             <div className="flex items-center gap-2">
                                <Clock size={16} />
                                Status: <span className="font-medium capitalize text-slate-900">{selectedTask.status.replace('-', ' ')}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Circle size={16} />
                                ID: <span className="font-mono text-xs">{selectedTask.id.slice(0, 8)}</span>
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
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">
                Copy and paste this text into your AI code editor (Cursor, Lovable, etc.) to have it implement these tasks:
              </p>
              <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 whitespace-pre-wrap overflow-y-auto max-h-[400px]">
                {generateExportText()}
              </div>
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
    </div>
  );
}
