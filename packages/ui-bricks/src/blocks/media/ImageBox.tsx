"use client";

import Image from 'next/image';
import styles from './ImageBox.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface ImageBoxProps {
    image?: string;
    alt?: string;
    caption?: string;
    width?: 'full' | 'wide' | 'medium' | 'small';
    aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1';
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    captionColor?: string;
}

export const ImageBox = ({
    image,
    alt = "Image",
    caption,
    width = "medium",
    aspectRatio = "auto",
    animationStyle = "simple",
    backgroundColor,
    captionColor
}: ImageBoxProps) => {
    if (!image) {
        return (
            <div className={styles.container}>
                <div className="w-full h-64 bg-slate-800/50 rounded-xl flex items-center justify-center border border-dashed border-slate-600 text-slate-400">
                    Select an image
                </div>
            </div>
        );
    }

    const maxWidth = {
        full: '100%',
        wide: '1200px',
        medium: '800px',
        small: '400px'
    }[width];

    const ratioStyle = aspectRatio !== 'auto' ? { aspectRatio } : {};

    return (
        <section 
            className={styles.container}
            style={{
                '--image-box-bg': backgroundColor,
                '--image-box-caption-color': captionColor
            } as React.CSSProperties}
        >
            <div style={{ width: '100%', maxWidth, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ScrollAnimation 
                    theme={animationStyle} 
                    className={styles.imageWrapper}
                    style={ratioStyle}
                >
                    <Image
                        src={image}
                        alt={alt}
                        width={1200}
                        height={800}
                        className={styles.image}
                        style={aspectRatio === 'auto' ? { height: 'auto' } : { objectFit: 'cover', height: '100%' }}
                    />
                </ScrollAnimation>
                {caption && (
                    <ScrollAnimation theme={animationStyle} delay={0.2}>
                        <p className={styles.caption}>{caption}</p>
                    </ScrollAnimation>
                )}
            </div>
        </section>
    );
};
