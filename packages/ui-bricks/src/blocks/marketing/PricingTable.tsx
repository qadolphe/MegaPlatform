"use client";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./PricingTable.module.css";
import { Check, X } from "lucide-react";

interface PricingTier {
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: { text: string; included: boolean }[];
    ctaText?: string;
    ctaLink?: string;
    highlighted?: boolean;
    badge?: string;
}

interface PricingTableProps {
    title?: string;
    subtitle?: string;
    tiers?: PricingTier[];
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const PricingTable = ({
    title = "Pricing Plans",
    subtitle = "Choose the plan that fits your needs",
    tiers = [],
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: PricingTableProps) => {
    return (
        <section
            className={styles.section}
            style={{ '--pricing-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
        >
            <div className={styles.container}>
                <ScrollAnimation theme={animationStyle}>
                    <div className={styles.header}>
                        <h2 className={styles.title} style={{ color: titleColor || 'var(--color-text)' }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <p className={styles.subtitle} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </ScrollAnimation>

                <div className={styles.grid}>
                    {tiers.map((tier, index) => (
                        <ScrollAnimation key={tier.name} theme={animationStyle} delay={index * 0.1}>
                            <div
                                className={`${styles.card} ${tier.highlighted ? styles.highlighted : ''}`}
                                style={{
                                    '--card-accent': accentColor || 'var(--color-primary)',
                                } as React.CSSProperties}
                            >
                                {tier.badge && (
                                    <div className={styles.badge}>{tier.badge}</div>
                                )}
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.tierName} style={{ color: titleColor || 'var(--color-text)' }}>
                                        {tier.name}
                                    </h3>
                                    <div className={styles.priceRow}>
                                        <span className={styles.price} style={{ color: accentColor || 'var(--color-primary)' }}>
                                            {tier.price}
                                        </span>
                                        {tier.period && (
                                            <span className={styles.period} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                                /{tier.period}
                                            </span>
                                        )}
                                    </div>
                                    {tier.description && (
                                        <p className={styles.description} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                            {tier.description}
                                        </p>
                                    )}
                                </div>

                                <ul className={styles.features}>
                                    {tier.features.map((feature, fIndex) => (
                                        <li key={fIndex} className={styles.feature}>
                                            {feature.included ? (
                                                <Check className={styles.checkIcon} style={{ color: accentColor || 'var(--color-primary)' }} />
                                            ) : (
                                                <X className={styles.xIcon} />
                                            )}
                                            <span style={{ color: textColor || 'var(--color-text)' }}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {tier.ctaText && (
                                    <a
                                        href={tier.ctaLink || '#'}
                                        className={styles.cta}
                                        style={{
                                            backgroundColor: tier.highlighted ? (accentColor || 'var(--color-primary)') : 'transparent',
                                            borderColor: accentColor || 'var(--color-primary)',
                                            color: tier.highlighted ? '#fff' : (accentColor || 'var(--color-primary)')
                                        }}
                                    >
                                        {tier.ctaText}
                                    </a>
                                )}
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
};
