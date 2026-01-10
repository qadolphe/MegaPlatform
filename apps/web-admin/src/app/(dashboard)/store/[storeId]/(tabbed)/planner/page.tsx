"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, CheckCircle2, Circle, Clock, Trash2, ArrowRight, ArrowLeft, Pencil, X, Save } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
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

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');

  useEffect(() => {
    fetchTasks();
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
        status: 'todo'
      })
      .select()
      .single();

    if (data) {
      setTasks([data as Task, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDesc("");
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
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('planner_tasks').delete().eq('id', taskId);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(false);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
  };

  const saveTaskChanges = async () => {
    if (!selectedTask || !editTitle.trim()) return;

    const updatedTask = {
      ...selectedTask,
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      status: editStatus
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
        status: editStatus
      })
      .eq('id', selectedTask.id);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planner</h1>
          <p className="text-slate-500">Collaborate and track tasks with your team</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> New Task
        </button>
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
              {tasks.filter(t => t.status === col.id).map(task => (
                <motion.div 
                  layoutId={task.id}
                  key={task.id} 
                  onClick={() => openTaskDialog(task)}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} 
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
                    <div className="text-xs text-slate-400">
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1">
                      {col.id !== 'todo' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, col.id === 'done' ? 'in-progress' : 'todo'); }}
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
              ))}
              
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
    </div>
  );
}
