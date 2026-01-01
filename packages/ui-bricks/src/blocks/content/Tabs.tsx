"use client";
import { useState } from "react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./Tabs.module.css";

interface TabItem {
    label: string;
    content: string;
    icon?: string;
}

interface TabsProps {
    title?: string;
    subtitle?: string;
    tabs?: TabItem[];
    defaultTab?: number;
    variant?: 'pills' | 'underline' | 'boxed';
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const Tabs = ({
    title,
    subtitle,
    tabs = [],
    defaultTab = 0,
    variant = 'pills',
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: TabsProps) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <section
            className={styles.section}
            style={{ '--tabs-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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

                <ScrollAnimation theme={animationStyle}>
                    <div className={`${styles.tabList} ${styles[variant]}`}>
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`${styles.tab} ${index === activeTab ? styles.active : ''}`}
                                style={{
                                    '--accent': accentColor || 'var(--color-primary)',
                                    color: index === activeTab ? (accentColor || 'var(--color-primary)') : (textColor || 'var(--color-text-muted)')
                                } as React.CSSProperties}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </ScrollAnimation>

                <div className={styles.tabContent}>
                    {tabs[activeTab] && (
                        <div
                            className={styles.content}
                            style={{ color: textColor || 'var(--color-text)' }}
                        >
                            {tabs[activeTab].content}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
