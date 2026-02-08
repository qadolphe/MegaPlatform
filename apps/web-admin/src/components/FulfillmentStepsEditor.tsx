"use client";

import { useState } from "react";
import { Plus, Trash, GripVertical, ChevronDown, ChevronUp } from "lucide-react";

export interface FulfillmentStep {
    id: string;
    label: string;
    description?: string;
    required_metadata?: string[];
}

interface FulfillmentStepsEditorProps {
    steps: FulfillmentStep[];
    onChange: (steps: FulfillmentStep[]) => void;
}

export function FulfillmentStepsEditor({ steps, onChange }: FulfillmentStepsEditorProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [newMetaField, setNewMetaField] = useState<Record<number, string>>({});

    const addStep = () => {
        const newId = `step_${steps.length + 1}_${Date.now().toString(36)}`;
        onChange([
            ...steps,
            { id: newId, label: "", description: "", required_metadata: [] },
        ]);
        setExpandedIndex(steps.length);
    };

    const removeStep = (index: number) => {
        onChange(steps.filter((_, i) => i !== index));
        if (expandedIndex === index) setExpandedIndex(null);
    };

    const updateStep = (index: number, updates: Partial<FulfillmentStep>) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], ...updates };
        onChange(newSteps);
    };

    const moveStep = (index: number, direction: "up" | "down") => {
        const newSteps = [...steps];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= steps.length) return;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        onChange(newSteps);
        setExpandedIndex(targetIndex);
    };

    const addMetaField = (index: number) => {
        const field = newMetaField[index]?.trim();
        if (!field) return;

        const current = steps[index].required_metadata || [];
        if (!current.includes(field)) {
            updateStep(index, { required_metadata: [...current, field] });
        }
        setNewMetaField({ ...newMetaField, [index]: "" });
    };

    const removeMetaField = (stepIndex: number, fieldIndex: number) => {
        const current = steps[stepIndex].required_metadata || [];
        updateStep(stepIndex, {
            required_metadata: current.filter((_, i) => i !== fieldIndex),
        });
    };

    return (
        <div className="space-y-3">
            {steps.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No fulfillment steps defined.</p>
                    <p className="text-xs mt-1">
                        Add steps to track order items through a multi-stage process.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`border rounded-lg transition-colors ${expandedIndex === idx
                                    ? "border-blue-300 bg-blue-50/30"
                                    : "border-slate-200 bg-white"
                                }`}
                        >
                            {/* Step Header */}
                            <div
                                className="flex items-center gap-2 p-3 cursor-pointer"
                                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                            >
                                <GripVertical size={14} className="text-slate-300" />
                                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={step.label}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            updateStep(idx, { label: e.target.value });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Step name (e.g., Ship Kit to Customer)"
                                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-800 focus:ring-0 placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveStep(idx, "up");
                                        }}
                                        disabled={idx === 0}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveStep(idx, "down");
                                        }}
                                        disabled={idx === steps.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeStep(idx);
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedIndex === idx && (
                                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-slate-100 mt-0">
                                    <div className="pt-3">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            Step ID (for API)
                                        </label>
                                        <input
                                            type="text"
                                            value={step.id}
                                            onChange={(e) =>
                                                updateStep(idx, {
                                                    id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                                                })
                                            }
                                            className="w-full text-xs font-mono bg-slate-100 border-none rounded px-2 py-1.5 text-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={step.description || ""}
                                            onChange={(e) => updateStep(idx, { description: e.target.value })}
                                            placeholder="Internal notes about this step..."
                                            className="w-full text-sm border border-slate-200 rounded-md p-2 h-16 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            Required Metadata Fields
                                        </label>
                                        <p className="text-[10px] text-slate-400 mb-2">
                                            Fields that must be provided when transitioning to this step (e.g., tracking_number)
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {(step.required_metadata || []).map((field, fIdx) => (
                                                <span
                                                    key={field}
                                                    className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                                                >
                                                    <code>{field}</code>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMetaField(idx, fIdx)}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMetaField[idx] || ""}
                                                onChange={(e) =>
                                                    setNewMetaField({ ...newMetaField, [idx]: e.target.value })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addMetaField(idx);
                                                    }
                                                }}
                                                placeholder="field_name"
                                                className="flex-1 text-xs font-mono border border-slate-200 rounded px-2 py-1.5"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addMetaField(idx)}
                                                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 font-medium text-sm rounded-lg transition"
            >
                <Plus size={16} />
                Add Step
            </button>
        </div>
    );
}
