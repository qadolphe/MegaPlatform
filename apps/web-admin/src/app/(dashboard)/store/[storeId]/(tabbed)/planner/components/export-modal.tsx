"use client";

import React, { useState } from "react";
import { X, Check, Copy, FileText, Plus } from "lucide-react";

interface CustomInstruction {
  id: string;
  title: string;
  content: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportText: string;
  setExportText: (text: string) => void;
  onCopy: () => void;
  exportCopied: boolean;
  selectedTaskCount: number;
  customInstructions: CustomInstruction[];
  onAddInstruction: (title: string, content: string) => void;
  onDeleteInstruction: (id: string) => void;
  selectedInstructionIds: Set<string>;
  onToggleInstruction: (id: string) => void;
}

export function ExportModal({
  isOpen,
  onClose,
  exportText,
  setExportText,
  onCopy,
  exportCopied,
  selectedTaskCount,
  customInstructions,
  onAddInstruction,
  onDeleteInstruction,
  selectedInstructionIds,
  onToggleInstruction
}: ExportModalProps) {
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [newInstructionTitle, setNewInstructionTitle] = useState("");
  const [newInstructionContent, setNewInstructionContent] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newInstructionTitle.trim() || !newInstructionContent.trim()) return;
    onAddInstruction(newInstructionTitle, newInstructionContent);
    setNewInstructionTitle("");
    setNewInstructionContent("");
    setIsAddingInstruction(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-purple-600" />
            <h3 className="font-bold text-lg">Export Tasks for AI</h3>
          </div>
          <button 
            onClick={onClose} 
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
                <div className="mb-4 bg-white p-3 rounded border border-slate-200 shadow-sm">
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
                            onClick={handleAdd}
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
                                onChange={() => onToggleInstruction(inst.id)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="truncate" title={inst.content}>{inst.title}</span>
                        </label>
                        <button 
                            onClick={() => onDeleteInstruction(inst.id)}
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
            {selectedTaskCount} task{selectedTaskCount !== 1 ? 's' : ''} selected
          </span>
          <button 
            onClick={onCopy}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium"
          >
            {exportCopied ? <Check size={18} /> : <Copy size={18} />}
            {exportCopied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
