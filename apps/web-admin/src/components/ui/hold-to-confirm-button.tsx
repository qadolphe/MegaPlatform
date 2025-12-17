import React, { useState, useRef, useEffect } from 'react';
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
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    // Calculate progress with a slight ease-out at the end (slowing down)
    // Linear: elapsed / duration
    // Ease-out cubic: 1 - Math.pow(1 - elapsed / duration, 3)
    // Let's mix them or just use linear for simplicity then apply the "slow down" effect via the curve
    
    // User asked for "slowing down at the end a little bit"
    // Let's use a simple ease-out curve
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Custom easing: starts linear-ish, slows at end
    // f(x) = 1 - (1-x)^1.5
    const easedProgress = 1 - Math.pow(1 - rawProgress, 1.5);
    
    setProgress(easedProgress * 100);

    if (rawProgress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Completed
      onConfirm();
      // Don't reset immediately so the user sees the full bar for a split second
      setTimeout(() => reset(), 100);
    }
  };

  const reset = () => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = undefined;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const handleMouseDown = () => {
    setIsHolding(true);
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    reset();
  };

  const handleMouseLeave = () => {
    if (isHolding) {
      reset();
    }
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/context menu
    handleMouseDown();
  };

  const handleTouchCancel = () => {
    reset();
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <button
      className={`relative overflow-hidden select-none group ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleTouchCancel}
      type="button"
    >
      {/* Background fill */}
      <div 
        className="absolute inset-0 bg-red-100/50 transition-none"
        style={{ width: `${progress}%` }}
      />
      
      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center gap-2 w-full h-full transition-colors ${isHolding ? 'text-red-700' : ''}`}>
        <Trash2 size={16} />
        <span>{isHolding && progress > 0 ? confirmLabel : label}</span>
      </div>
    </button>
  );
};
