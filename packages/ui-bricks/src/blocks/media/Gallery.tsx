"use client";
import { useState } from "react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./Gallery.module.css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
    url: string;
    alt?: string;
    caption?: string;
}

interface GalleryProps {
    title?: string;
    subtitle?: string;
    images?: GalleryImage[];
    columns?: number;
    gap?: 'small' | 'medium' | 'large';
    aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
    enableLightbox?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    animationStyle?: AnimationTheme;
}

export const Gallery = ({
    title,
    subtitle,
    images = [],
    columns = 3,
    gap = 'medium',
    aspectRatio = 'square',
    enableLightbox = true,
    backgroundColor,
    titleColor,
    textColor,
    animationStyle = "simple"
}: GalleryProps) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        if (enableLightbox) setLightboxIndex(index);
    };

    const closeLightbox = () => setLightboxIndex(null);

    const navigate = (direction: 'prev' | 'next') => {
        if (lightboxIndex === null) return;
        const newIndex = direction === 'next'
            ? (lightboxIndex + 1) % images.length
            : (lightboxIndex - 1 + images.length) % images.length;
        setLightboxIndex(newIndex);
    };

    return (
        <section
            className={styles.section}
            style={{ '--gallery-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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

                <div
                    className={`${styles.grid} ${styles[`gap-${gap}`]}`}
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {images.map((image, index) => (
                        <ScrollAnimation key={index} theme={animationStyle} delay={index * 0.05}>
                            <div
                                className={`${styles.imageWrapper} ${styles[`aspect-${aspectRatio}`]}`}
                                onClick={() => openLightbox(index)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    className={styles.image}
                                />
                                {image.caption && (
                                    <div className={styles.caption} style={{ color: textColor }}>
                                        {image.caption}
                                    </div>
                                )}
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className={styles.lightbox} onClick={closeLightbox}>
                    <button className={styles.closeButton} onClick={closeLightbox}>
                        <X />
                    </button>
                    <button
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
                    >
                        <ChevronLeft />
                    </button>
                    <img
                        src={images[lightboxIndex].url}
                        alt={images[lightboxIndex].alt || ''}
                        className={styles.lightboxImage}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={(e) => { e.stopPropagation(); navigate('next'); }}
                    >
                        <ChevronRight />
                    </button>
                    {images[lightboxIndex].caption && (
                        <div className={styles.lightboxCaption}>
                            {images[lightboxIndex].caption}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
