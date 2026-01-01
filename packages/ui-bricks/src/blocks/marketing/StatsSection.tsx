"use client";
import { useEffect, useRef, useState } from "react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./StatsSection.module.css";

interface Stat {
    value: string | number;
    label: string;
    prefix?: string;
    suffix?: string;
}

interface StatsSectionProps {
    title?: string;
    subtitle?: string;
    stats?: Stat[];
    layout?: 'horizontal' | 'grid';
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, start]);

    return count;
}

const AnimatedStat = ({ stat, inView, accentColor, textColor }: {
    stat: Stat;
    inView: boolean;
    accentColor?: string;
    textColor?: string;
}) => {
    const numericValue = typeof stat.value === 'number' ? stat.value : parseFloat(stat.value.replace(/[^0-9.]/g, ''));
    const isNumeric = !isNaN(numericValue);
    const count = useCountUp(isNumeric ? numericValue : 0, 2000, inView);

    return (
        <div className={styles.stat}>
            <div className={styles.value} style={{ color: accentColor || 'var(--color-primary)' }}>
                {stat.prefix}
                {isNumeric ? count.toLocaleString() : stat.value}
                {stat.suffix}
            </div>
            <div className={styles.label} style={{ color: textColor || 'var(--color-text-muted)' }}>
                {stat.label}
            </div>
        </div>
    );
};

export const StatsSection = ({
    title,
    subtitle,
    stats = [],
    layout = 'horizontal',
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: StatsSectionProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className={styles.section}
            style={{ '--stats-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
        >
            <div className={styles.container}>
                {(title || subtitle) && (
                    <ScrollAnimation theme={animationStyle}>
                        <div className={styles.header}>
                            {title && (
                                <h2 className={styles.title} style={{ color: titleColor || 'var(--color-text)' }}>
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className={styles.subtitle} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </ScrollAnimation>
                )}

                <div className={`${styles.statsGrid} ${layout === 'grid' ? styles.gridLayout : styles.horizontalLayout}`}>
                    {stats.map((stat, index) => (
                        <ScrollAnimation key={index} theme={animationStyle} delay={index * 0.1}>
                            <AnimatedStat
                                stat={stat}
                                inView={inView}
                                accentColor={accentColor}
                                textColor={textColor}
                            />
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
};
