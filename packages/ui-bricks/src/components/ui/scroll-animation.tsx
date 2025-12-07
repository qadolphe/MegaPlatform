"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef, ReactNode } from "react";
import { ANIMATION_THEMES, AnimationTheme } from "../../lib/animation-config";

interface ScrollAnimationProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    variant?: "fadeUp" | "fadeIn" | "slideRight" | "slideLeft" | "scaleUp";
    theme?: AnimationTheme;
    delay?: number;
    duration?: number;
    once?: boolean;
    amount?: UseInViewOptions["amount"];
    hoverable?: boolean;
}

export default function ScrollAnimation({
    children,
    className = "",
    style,
    variant: propVariant,
    theme,
    delay = 0,
    duration: propDuration,
    once = true,
    amount = 0.2,
    hoverable = false,
}: ScrollAnimationProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount });

    const themeConfig = theme ? ANIMATION_THEMES[theme] : null;
    const variant = themeConfig ? themeConfig.variant : (propVariant || "fadeUp");
    const duration = themeConfig ? themeConfig.duration : (propDuration || 0.5);
    const transitionConfig = themeConfig?.transition || { ease: [0.22, 1, 0.36, 1] };
    const hoverConfig = themeConfig?.hover || {};

    if (theme === 'none') {
        return <div className={className} style={style}>{children}</div>;
    }

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
                ...transitionConfig
            },
        },
        hover: hoverable ? hoverConfig : {}
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover={hoverable ? "hover" : undefined}
            variants={variants}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}
