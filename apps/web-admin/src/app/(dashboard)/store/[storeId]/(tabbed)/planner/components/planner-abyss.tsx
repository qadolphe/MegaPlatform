"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlannerAbyssProps {
  isDragging: boolean;
  isInAbyss: boolean;
  setIsInAbyss: (val: boolean) => void;
  onDrop: (taskId: string) => void;
}

export function PlannerAbyss({ isDragging, isInAbyss, setIsInAbyss, onDrop }: PlannerAbyssProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-12 py-6 rounded-2xl border-2 border-dashed transition-all duration-300 z-50 flex flex-col items-center gap-2 ${
                isInAbyss 
                ? 'bg-red-50 border-red-500 text-red-600 scale-110 shadow-2xl shadow-red-200' 
                : 'bg-white/80 border-slate-300 text-slate-400 backdrop-blur-sm'
            }`}
            onDragOver={(e) => {
                e.preventDefault();
                if (!isInAbyss) setIsInAbyss(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setIsInAbyss(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) {
                    onDrop(taskId);
                    setIsInAbyss(false);
                }
            }}
        >
            <Trash2 size={isInAbyss ? 32 : 24} className={`transition-all duration-300 ${isInAbyss ? 'animate-bounce' : ''}`} />
            <span className={`font-bold transition-all duration-300 ${isInAbyss ? 'text-lg' : 'text-sm'}`}>
                {isInAbyss ? 'RELEASE TO DELETE' : 'DRAG HERE TO DELETE'}
            </span>
            {isInAbyss && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                    TRASH
                </motion.div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
