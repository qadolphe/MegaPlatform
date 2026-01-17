"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ValidationIssue {
  id: string;
  type: string;
  issues: Array<{ path: string; message: string }>;
}

interface DeployValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationIssue[];
}

export function DeployValidationModal({ isOpen, onClose, errors }: DeployValidationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Cannot deploy</h3>
                <p className="text-sm text-slate-500">Fix the blocks below, then deploy again.</p>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-auto space-y-4">
              {errors.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{b.type}</div>
                      <div className="text-xs text-slate-500">Block ID: {b.id}</div>
                    </div>
                    <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                      {b.issues.length} issue{b.issues.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {b.issues.map((issue, idx) => (
                      <div key={idx} className="text-sm text-slate-700">
                        <span className="font-mono text-xs bg-white border border-slate-200 rounded px-2 py-0.5 mr-2">{issue.path}</span>
                        <span className="text-red-700">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
