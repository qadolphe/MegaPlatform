"use client";

import { Check, Circle } from "lucide-react";
import { motion } from "framer-motion";

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
    /** Current step ID the item is on. Null means "Not Started". */
    currentStepId: string | null;
    /** History of completed steps */
    stepHistory?: StepHistoryEntry[];
    /** Compact mode for order items list */
    compact?: boolean;
    /** Callback to change the current step */
    onStepChange?: (stepId: string | null) => void;
}

const START_NODE_ID = "__start_node__";

export function PipelineProgressBar({
    pipeline,
    currentStepId,
    stepHistory = [],
    compact = false,
    onStepChange,
}: PipelineProgressBarProps) {
    if (!pipeline || pipeline.length === 0) return null;

    // Create a display pipeline that includes the start node
    const displayPipeline: FulfillmentStep[] = [
        { id: START_NODE_ID, label: "Placed", description: "Order confirmed" },
        ...pipeline,
    ];

    // Determine current index including start node
    // If currentStepId is null, we are at the start node (index 0)
    // If currentStepId matches a step, we are at that step index + 1
    const currentIndex = currentStepId
        ? pipeline.findIndex((s) => s.id === currentStepId) + 1
        : 0;

    // Safety check: if ID provided but not found, fallback to 0
    const effectiveIndex = currentIndex === 0 && currentStepId !== null
        ? 0
        : currentIndex;

    const completedStepIds = new Set(stepHistory.map((h) => h.step_id));

    if (compact) {
        // Compact: "Step 2 of 4 • Ship Kit to Customer"
        const currentStep = displayPipeline[effectiveIndex];
        const stepNumber = effectiveIndex; // 0 for Placed, 1 for Step 1...

        return (
            <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                    {displayPipeline.map((step, idx) => {
                        const isStartNode = step.id === START_NODE_ID;
                        const isCompleted = idx < effectiveIndex;
                        const isCurrent = idx === effectiveIndex;
                        const isPending = idx > effectiveIndex;
                        
                        // Decide color based on state
                        let bgColor = "bg-slate-200";
                        if (isCompleted) bgColor = "bg-green-500";
                        else if (isCurrent) bgColor = isStartNode ? "bg-slate-400" : "bg-blue-500";
                        
                        return (
                            <motion.div
                                key={step.id}
                                className={`h-1.5 w-6 rounded-full ${bgColor}`}
                                initial={false}
                                animate={{ backgroundColor: isCompleted ? "#22c55e" : isCurrent ? (isStartNode ? "#94a3b8" : "#3b82f6") : "#e2e8f0" }}
                            />
                        );
                    })}
                </div>
                <span className="text-slate-500">
                    {stepNumber === 0 ? "Not Started" : `Step ${stepNumber} of ${pipeline.length}`}
                </span>
                {currentStep && stepNumber > 0 && (
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                        {currentStep.label}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="w-full py-2">
            <div className="relative flex items-center justify-between">
                {/* Progress line (background) */}
                <div className="absolute left-0 right-0 top-[15px] h-0.5 bg-slate-100 -z-10 rounded-full" />

                {/* Progress line (filled) */}
                <motion.div
                    className="absolute left-0 top-[15px] h-0.5 bg-green-500 -z-10 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                        width: `${(effectiveIndex / (displayPipeline.length - 1)) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                />

                {/* Step circles */}
                {displayPipeline.map((step, idx) => {
                    const isStartNode = step.id === START_NODE_ID;
                    const isCompleted = idx < effectiveIndex;
                    const isCurrent = idx === effectiveIndex;
                    const isPending = idx > effectiveIndex;

                    const historyEntry = !isStartNode ? stepHistory.find((h) => h.step_id === step.id) : null;

                    return (
                        <div
                            key={step.id}
                            className={`relative flex flex-col items-center group/step ${onStepChange ? "cursor-pointer" : ""}`}
                            onClick={() => {
                                if (onStepChange) {
                                    onStepChange(isStartNode ? null : step.id);
                                }
                            }}
                            role={onStepChange ? "button" : undefined}
                            tabIndex={onStepChange ? 0 : undefined}
                        >
                            {/* Circle */}
                            <motion.div
                                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white z-10 box-border`}
                                animate={{
                                    borderColor: isCompleted
                                        ? "#22c55e" // green-500
                                        : isCurrent
                                            ? "#3b82f6" // blue-500
                                            : "#e2e8f0", // slate-200
                                    scale: isCurrent ? 1.1 : 1,
                                    boxShadow: isCurrent ? "0 0 0 4px rgba(59, 130, 246, 0.1)" : "none"
                                }}
                                whileHover={onStepChange ? { scale: 1.15 } : {}}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Check size={14} className="text-green-600" strokeWidth={3} />
                                    </motion.div>
                                ) : isStartNode ? (
                                    <Circle size={10} className={isCurrent ? "text-blue-500 fill-blue-500" : "text-slate-300"} />
                                ) : (
                                    <span
                                        className={`text-[10px] font-bold ${isCurrent ? "text-blue-600" : "text-slate-400"
                                            }`}
                                    >
                                        {idx}
                                    </span>
                                )}
                            </motion.div>

                            {/* Label */}
                            <motion.div
                                className="absolute top-9 flex flex-col items-center w-32 pointer-events-none"
                                initial={false}
                                animate={{ y: isCurrent ? 2 : 0 }}
                            >
                                <span
                                    className={`text-xs font-medium text-center transition-colors duration-300 ${isCurrent ? "text-blue-600" : "text-slate-500"
                                        }`}
                                >
                                    {step.label}
                                </span>

                                {/* Description (hover or current) */}
                                {step.description && (
                                    <span
                                        className={`text-[10px] text-center mt-0.5 transition-opacity duration-300 ${isCurrent ? "text-slate-500 opacity-100" : "text-slate-400 opacity-0 group-hover/step:opacity-100"
                                            }`}
                                    >
                                        {step.description}
                                    </span>
                                )}

                                {/* Date (completed only) */}
                                {historyEntry && (
                                    <span className="text-[9px] text-green-600 mt-0.5 font-medium bg-green-50 px-1.5 py-0.5 rounded-full inline-block">
                                        {new Date(historyEntry.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
