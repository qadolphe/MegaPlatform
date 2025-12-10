import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max,
  className = ""
}) => {
  const handleDecrement = () => {
    if (min !== undefined && value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + 1);
  };

  return (
    <div className={`flex items-center border border-slate-300 rounded-md overflow-hidden ${className}`}>
      <button 
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border-r border-slate-300 transition-colors"
      >
        <Minus size={14} />
      </button>
      <div className="flex-1 text-center text-sm font-medium text-slate-700 min-w-[3rem]">
        {value}
      </div>
      <button 
        type="button"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border-l border-slate-300 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
