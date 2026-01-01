"use client";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./Timeline.module.css";
import { Check, Circle } from "lucide-react";

interface TimelineEvent {
    date?: string;
    title: string;
    description?: string;
    status?: 'complete' | 'current' | 'upcoming';
}

interface TimelineProps {
    title?: string;
    subtitle?: string;
    events?: TimelineEvent[];
    layout?: 'vertical' | 'alternating';
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const Timeline = ({
    title,
    subtitle,
    events = [],
    layout = 'vertical',
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: TimelineProps) => {
    return (
        <section
            className={styles.section}
            style={{ '--timeline-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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

                <div className={`${styles.timeline} ${styles[layout]}`}>
                    {events.map((event, index) => (
                        <ScrollAnimation key={index} theme={animationStyle} delay={index * 0.1}>
                            <div
                                className={`${styles.event} ${styles[event.status || 'upcoming']}`}
                                style={{ '--accent': accentColor || 'var(--color-primary)' } as React.CSSProperties}
                            >
                                <div className={styles.marker}>
                                    {event.status === 'complete' ? (
                                        <Check className={styles.icon} />
                                    ) : (
                                        <Circle className={styles.icon} />
                                    )}
                                </div>
                                <div className={styles.content}>
                                    {event.date && (
                                        <span className={styles.date} style={{ color: accentColor || 'var(--color-primary)' }}>
                                            {event.date}
                                        </span>
                                    )}
                                    <h3 className={styles.eventTitle} style={{ color: titleColor || 'var(--color-text)' }}>
                                        {event.title}
                                    </h3>
                                    {event.description && (
                                        <p className={styles.description} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
};
