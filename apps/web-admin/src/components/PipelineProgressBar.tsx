"use client";

import { Check } from "lucide-react";

interface FulfillmentStep {
    id: string;
    label: string;
    description?: string;
    required_metadata?: string[];
}

interface StepHistoryEntry {
    step_id: string;
    completed_at: string;
    metadata: Record<string, any>;
}

interface PipelineProgressBarProps {
    /** The product's fulfillment pipeline definition */
    pipeline: FulfillmentStep[];
    /** Current step ID the item is on */
    currentStepId: string | null;
    /** History of completed steps */
    stepHistory?: StepHistoryEntry[];
    /** Compact mode for order items list */
    compact?: boolean;
}

export function PipelineProgressBar({
    pipeline,
    currentStepId,
    stepHistory = [],
    compact = false,
}: PipelineProgressBarProps) {
    if (!pipeline || pipeline.length === 0) return null;

    const currentIndex = pipeline.findIndex((s) => s.id === currentStepId);
    const completedStepIds = new Set(stepHistory.map((h) => h.step_id));

    // Determine step states
    const getStepState = (step: FulfillmentStep, index: number) => {
        if (completedStepIds.has(step.id)) return "completed";
        if (step.id === currentStepId) return "current";
        if (index < currentIndex) return "completed"; // Steps before current are completed
        return "pending";
    };

    if (compact) {
        // Compact: "Step 2 of 4 • Ship Kit to Customer"
        const currentStep = pipeline.find((s) => s.id === currentStepId);
        const stepNumber = currentIndex >= 0 ? currentIndex + 1 : completedStepIds.size;

        return (
            <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                    {pipeline.map((step, idx) => {
                        const state = getStepState(step, idx);
                        return (
                            <div
                                key={step.id}
                                className={`h-1.5 w-6 rounded-full transition-colors ${state === "completed"
                                        ? "bg-green-500"
                                        : state === "current"
                                            ? "bg-blue-500"
                                            : "bg-slate-200"
                                    }`}
                            />
                        );
                    })}
                </div>
                <span className="text-slate-500">
                    Step {stepNumber} of {pipeline.length}
                </span>
                {currentStep && (
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                        {currentStep.label}
                    </span>
                )}
            </div>
        );
    }

    // Full view: circles with labels
    return (
        <div className="w-full">
            <div className="relative flex items-center justify-between">
                {/* Progress line (background) */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200" />

                {/* Progress line (filled) */}
                <div
                    className="absolute left-0 top-4 h-0.5 bg-green-500 transition-all duration-500"
                    style={{
                        width: `${((currentIndex >= 0 ? currentIndex : completedStepIds.size) / Math.max(pipeline.length - 1, 1)) * 100}%`,
                    }}
                />

                {/* Step circles */}
                {pipeline.map((step, idx) => {
                    const state = getStepState(step, idx);
                    const historyEntry = stepHistory.find((h) => h.step_id === step.id);

                    return (
                        <div key={step.id} className="relative flex flex-col items-center z-10">
                            {/* Circle */}
                            <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${state === "completed"
                                        ? "bg-green-500 border-green-500 text-white"
                                        : state === "current"
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "bg-white border-slate-300 text-slate-400"
                                    }`}
                            >
                                {state === "completed" ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <span className="text-xs font-semibold">{idx + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-center max-w-[100px]">
                                <p
                                    className={`text-xs font-medium truncate ${state === "pending" ? "text-slate-400" : "text-slate-700"
                                        }`}
                                >
                                    {step.label}
                                </p>
                                {historyEntry && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(historyEntry.completed_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
