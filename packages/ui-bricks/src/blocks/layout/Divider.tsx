"use client";
import styles from "./Divider.module.css";

interface DividerProps {
    style?: 'line' | 'dashed' | 'dotted' | 'gradient' | 'fade';
    thickness?: 'thin' | 'medium' | 'thick';
    width?: 'full' | 'wide' | 'medium' | 'narrow';
    color?: string;
    marginTop?: string;
    marginBottom?: string;
}

export const Divider = ({
    style = 'line',
    thickness = 'thin',
    width = 'full',
    color,
    marginTop = '2rem',
    marginBottom = '2rem'
}: DividerProps) => {
    return (
        <div
            className={`${styles.divider} ${styles[style]} ${styles[thickness]} ${styles[width]}`}
            style={{
                '--divider-color': color || 'var(--color-border, rgba(255,255,255,0.1))',
                marginTop,
                marginBottom
            } as React.CSSProperties}
        />
    );
};
