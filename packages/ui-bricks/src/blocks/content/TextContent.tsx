"use client";

import Image from 'next/image';
import styles from './TextContent.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface TextContentProps {
    title?: string;
    subtitle?: string;
    body?: string;
    alignment?: 'left' | 'center' | 'right';
    image?: string;
    imagePosition?: 'left' | 'right';
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    textColor?: string;
}

export const TextContent = ({
    title = "About Us",
    subtitle,
    body = "Write your content here...",
    alignment = "left",
    image,
    imagePosition = "right",
    animationStyle = "simple",
    backgroundColor,
    textColor
}: TextContentProps) => {
    
    const hasImage = !!image;
    const containerClass = hasImage 
        ? `${styles.withImage} ${imagePosition === 'right' ? styles.imageRight : styles.imageLeft}`
        : styles.container;

    return (
        <section 
            className={styles.section}
            style={{
                '--text-content-bg': backgroundColor || 'var(--color-background)',
                '--text-content-color': textColor || 'var(--color-text)'
            } as React.CSSProperties}
        >
            <div className={`${containerClass}`}>
                <ScrollAnimation 
                    theme={animationStyle} 
                    className={`${styles.content} ${styles[`align-${alignment}`]}`}
                >
                    {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {body && (
                        <div className={`${styles.body} prose prose-invert max-w-none`}>
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {body}
                            </ReactMarkdown>
                        </div>
                    )}
                </ScrollAnimation>

                {hasImage && (
                    <ScrollAnimation 
                        theme={animationStyle} 
                        delay={0.2}
                        className={styles.imageWrapper}
                    >
                        <Image
                            src={image}
                            alt={title || "Content Image"}
                            fill
                            className={styles.image}
                        />
                    </ScrollAnimation>
                )}
            </div>
        </section>
    );
};
