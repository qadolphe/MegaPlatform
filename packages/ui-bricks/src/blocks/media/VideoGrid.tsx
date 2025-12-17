"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import styles from './VideoGrid.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface VideoItem {
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    category: string;
}

interface VideoGridProps {
    title?: string;
    subtitle?: string;
    items?: VideoItem[];
    columns?: number;
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    titleColor?: string;
}

export const VideoGrid = ({
    title = "Tutorials",
    subtitle = "Learn how to get the most out of your gear",
    items = [],
    columns = 3,
    animationStyle = "simple",
    backgroundColor,
    titleColor
}: VideoGridProps) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Extract unique categories
    const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

    const filteredItems = activeCategory === 'all' 
        ? items 
        : items.filter(item => item.category === activeCategory);

    return (
        <section 
            className={styles.section}
            style={{
                '--video-grid-bg': backgroundColor || 'var(--color-background)',
                '--video-grid-title-color': titleColor || 'var(--color-text)'
            } as React.CSSProperties}
        >
            <div className={styles.header}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {categories.length > 2 && (
                <div className={styles.filters}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            <div 
                className={styles.grid}
                style={{ 
                    '--grid-cols': columns 
                } as React.CSSProperties}
            >
                {filteredItems.map((item, index) => (
                    <ScrollAnimation 
                        key={index} 
                        theme={animationStyle}
                        delay={index * 0.1}
                        hoverable={true}
                        className={styles.card}
                    >
                        <a 
                            href={item.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.thumbnailWrapper}
                        >
                            {item.thumbnail && (
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className={styles.thumbnail}
                                />
                            )}
                            <div className={styles.playButton}>
                                <Play size={24} fill="currentColor" />
                            </div>
                        </a>
                        <div className={styles.content}>
                            {item.category && <span className={styles.category}>{item.category}</span>}
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.description}</p>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>
        </section>
    );
};
