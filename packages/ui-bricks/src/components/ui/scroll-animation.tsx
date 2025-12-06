"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollAnimationProps {
    children: ReactNode;
    className?: string;
    variant?: "fadeUp" | "fadeIn" | "slideRight" | "slideLeft" | "scaleUp";
    delay?: number;
    duration?: number;
    once?: boolean;
    amount?: UseInViewOptions["amount"];
}

export default function ScrollAnimation({
    children,
    className = "",
    variant = "fadeUp",
    delay = 0,
    duration = 0.5,
    once = true,
    amount = 0.2,
}: ScrollAnimationProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount });

    const variants = {
        hidden: {
            opacity: 0,
            y: variant === "fadeUp" ? 30 : 0,
            x: variant === "slideRight" ? -50 : variant === "slideLeft" ? 50 : 0,
            scale: variant === "scaleUp" ? 0.9 : 1,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1] as const, // Custom easing for a "modern" feel
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}
