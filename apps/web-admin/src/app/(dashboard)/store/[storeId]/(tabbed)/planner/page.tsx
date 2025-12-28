"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, CheckCircle2, Circle, Clock, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
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
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500 p-1">
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
                          onClick={() => updateTaskStatus(task.id, col.id === 'done' ? 'in-progress' : 'todo')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                          title="Move Back"
                        >
                          <ArrowLeft size={14} />
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, col.id === 'todo' ? 'in-progress' : 'done')}
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
    </div>
  );
}
