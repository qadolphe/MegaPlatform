"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
    title: string;
    /** Whether section is expanded by default */
    defaultOpen?: boolean;
    /** Optional badge to show next to title (e.g., item count) */
    badge?: string | number;
    /** Icon to show in header */
    icon?: ReactNode;
    /** Content of the section */
    children: ReactNode;
    /** Action button to show in header */
    action?: ReactNode;
}

export function CollapsibleSection({
    title,
    defaultOpen = true,
    badge,
    icon,
    children,
    action,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    {badge !== undefined && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {action && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center"
                        >
                            {action}
                        </div>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </button>
            <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="p-4 pt-0 border-t border-slate-100">{children}</div>
            </div>
        </div>
    );
}
