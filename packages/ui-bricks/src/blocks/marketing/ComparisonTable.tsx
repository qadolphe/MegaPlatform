"use client";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./ComparisonTable.module.css";
import { Check, X, Minus } from "lucide-react";

interface ComparisonFeature {
    name: string;
    values: (boolean | string | null)[];
}

interface ComparisonColumn {
    name: string;
    highlighted?: boolean;
    badge?: string;
}

interface ComparisonTableProps {
    title?: string;
    subtitle?: string;
    columns?: ComparisonColumn[];
    features?: ComparisonFeature[];
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const ComparisonTable = ({
    title = "Compare Plans",
    subtitle,
    columns = [],
    features = [],
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: ComparisonTableProps) => {
    const renderValue = (value: boolean | string | null) => {
        if (value === true) return <Check className={styles.checkIcon} style={{ color: accentColor || 'var(--color-primary)' }} />;
        if (value === false) return <X className={styles.xIcon} />;
        if (value === null) return <Minus className={styles.dashIcon} />;
        return <span className={styles.textValue}>{value}</span>;
    };

    return (
        <section
            className={styles.section}
            style={{ '--table-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.featureHeader} style={{ color: textColor || 'var(--color-text)' }}>
                                        Features
                                    </th>
                                    {columns.map((col, index) => (
                                        <th
                                            key={index}
                                            className={`${styles.columnHeader} ${col.highlighted ? styles.highlighted : ''}`}
                                            style={{ '--accent': accentColor || 'var(--color-primary)' } as React.CSSProperties}
                                        >
                                            {col.badge && <span className={styles.badge}>{col.badge}</span>}
                                            <span style={{ color: titleColor || 'var(--color-text)' }}>{col.name}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td className={styles.featureCell} style={{ color: textColor || 'var(--color-text)' }}>
                                            {feature.name}
                                        </td>
                                        {feature.values.map((value, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`${styles.valueCell} ${columns[colIndex]?.highlighted ? styles.highlighted : ''}`}
                                            >
                                                {renderValue(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    );
};
