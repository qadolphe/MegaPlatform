import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';

interface HoldToConfirmButtonProps {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  duration?: number; // Duration in ms
  className?: string;
}

export const HoldToConfirmButton: React.FC<HoldToConfirmButtonProps> = ({
  onConfirm,
  label = "Delete",
  confirmLabel = "Deleting...",
  duration = 5000,
  className = ""
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const reset = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    isActiveRef.current = false;
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const animate = useCallback((time: number) => {
    if (!isActiveRef.current) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Custom easing: starts linear-ish, slows at end
    const easedProgress = 1 - Math.pow(1 - rawProgress, 1.5);
    
    setProgress(easedProgress * 100);

    if (rawProgress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Completed
      onConfirm();
      // Reset after a brief moment
      setTimeout(() => reset(), 100);
    }
  }, [duration, onConfirm, reset]);

  const handleStart = useCallback(() => {
    if (isActiveRef.current) return;
    
    isActiveRef.current = true;
    setIsHolding(true);
    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleEnd = useCallback(() => {
    reset();
  }, [reset]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/context menu
    handleStart();
  }, [handleStart]);

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <button
      className={`relative overflow-hidden select-none group ${className}`}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      type="button"
    >
      {/* Background fill */}
      <div 
        className="absolute inset-0 bg-red-600 transition-none pointer-events-none"
        style={{ 
          width: `${progress}%`,
          opacity: isHolding ? 1 : 0
        }}
      />
      
      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center gap-2 w-full h-full transition-colors ${isHolding ? 'text-white' : ''}`}>
        <Trash2 size={16} />
        <span>{isHolding && progress > 0 ? confirmLabel : label}</span>
      </div>
    </button>
  );
};
