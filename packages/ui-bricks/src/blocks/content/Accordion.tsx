"use client";
import { useState } from "react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./Accordion.module.css";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
    title: string;
    content: string;
}

interface AccordionProps {
    title?: string;
    subtitle?: string;
    items?: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpen?: number[];
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const Accordion = ({
    title,
    subtitle,
    items = [],
    allowMultiple = false,
    defaultOpen = [],
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: AccordionProps) => {
    const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpen);

    const toggle = (index: number) => {
        if (allowMultiple) {
            setOpenIndexes(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenIndexes(prev =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    return (
        <section
            className={styles.section}
            style={{ '--accordion-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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

                <div className={styles.accordionList}>
                    {items.map((item, index) => {
                        const isOpen = openIndexes.includes(index);
                        return (
                            <ScrollAnimation key={index} theme={animationStyle} delay={index * 0.05}>
                                <div
                                    className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}
                                    style={{ '--accent': accentColor || 'var(--color-primary)' } as React.CSSProperties}
                                >
                                    <button
                                        className={styles.accordionTrigger}
                                        onClick={() => toggle(index)}
                                        style={{ color: titleColor || 'var(--color-text)' }}
                                    >
                                        <span>{item.title}</span>
                                        <ChevronDown className={styles.icon} />
                                    </button>
                                    <div className={styles.accordionContent}>
                                        <div
                                            className={styles.contentInner}
                                            style={{ color: textColor || 'var(--color-text-muted)' }}
                                        >
                                            {item.content}
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
