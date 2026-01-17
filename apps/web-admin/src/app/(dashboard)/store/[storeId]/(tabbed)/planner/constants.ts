import { Circle, Clock, CheckCircle2 } from "lucide-react";

export const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'bg-slate-100 text-slate-600' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-green-50 text-green-600' }
] as const;

export const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#64748b' },
];
