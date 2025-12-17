"use client";

import Image from 'next/image';
import styles from './InfoGrid.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface InfoItem {
    title: string;
    description: string;
    image?: string;
    alt?: string;
    colSpan?: number;
}

interface InfoGridProps {
    title?: string;
    items?: InfoItem[];
    benefits?: InfoItem[]; // Backward compatibility
    columns?: number;
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    titleColor?: string;
}

export const InfoGrid = ({
    title = "Info Grid",
    items = [],
    benefits,
    columns = 3,
    animationStyle = "simple",
    backgroundColor,
    titleColor
}: InfoGridProps) => {
    const gridItems = items.length > 0 ? items : (benefits || []);

    const customStyles = {
        '--grid-bg': backgroundColor || 'var(--color-background)',
        '--grid-title-color': titleColor || 'var(--color-text)',
        '--grid-cols': columns 
    } as React.CSSProperties;

    return (
        <section className={styles.section} style={customStyles}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <div 
                className={styles.grid}
            >
                {gridItems.map((item, index) => (
                    <ScrollAnimation 
                        key={index} 
                        theme={animationStyle}
                        delay={index * 0.1}
                        hoverable={true}
                        className={styles.card}
                        style={{ 
                            '--col-span': item.colSpan ? `span ${item.colSpan}` : 'span 1' 
                        } as React.CSSProperties}
                    >
                        <div className={styles.imageWrapper}>
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.alt || item.title}
                                    fill
                                    className={styles.image}
                                />
                            )}
                            <div className={styles.overlay} />
                        </div>
                        <div className={styles.content}>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.description}</p>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>
        </section>
    )
}
