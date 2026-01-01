"use client";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./CallToAction.module.css";
import { ArrowRight } from "lucide-react";

interface CallToActionProps {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    layout?: 'centered' | 'split';
    animationStyle?: AnimationTheme;
}

export const CallToAction = ({
    title = "Ready to get started?",
    subtitle,
    description = "Join thousands of customers already using our platform.",
    primaryButtonText = "Get Started",
    primaryButtonLink = "#",
    secondaryButtonText,
    secondaryButtonLink,
    backgroundImage,
    backgroundColor,
    titleColor,
    textColor,
    buttonColor,
    buttonTextColor,
    layout = 'centered',
    animationStyle = "simple"
}: CallToActionProps) => {
    const bgStyle: React.CSSProperties = {
        '--cta-bg': backgroundColor || 'var(--color-primary)',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    } as React.CSSProperties;

    return (
        <section className={styles.section} style={bgStyle}>
            {backgroundImage && <div className={styles.overlay} />}
            <div className={`${styles.container} ${layout === 'split' ? styles.split : styles.centered}`}>
                <ScrollAnimation theme={animationStyle}>
                    <div className={styles.content}>
                        {subtitle && (
                            <span className={styles.subtitle} style={{ color: textColor || 'rgba(255,255,255,0.8)' }}>
                                {subtitle}
                            </span>
                        )}
                        <h2 className={styles.title} style={{ color: titleColor || '#fff' }}>
                            {title}
                        </h2>
                        <p className={styles.description} style={{ color: textColor || 'rgba(255,255,255,0.9)' }}>
                            {description}
                        </p>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation theme={animationStyle} delay={0.1}>
                    <div className={styles.buttons}>
                        <a
                            href={primaryButtonLink}
                            className={styles.primaryButton}
                            style={{
                                backgroundColor: buttonColor || '#fff',
                                color: buttonTextColor || 'var(--color-primary)'
                            }}
                        >
                            {primaryButtonText}
                            <ArrowRight className={styles.arrow} />
                        </a>
                        {secondaryButtonText && (
                            <a
                                href={secondaryButtonLink || '#'}
                                className={styles.secondaryButton}
                                style={{ color: textColor || '#fff' }}
                            >
                                {secondaryButtonText}
                            </a>
                        )}
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    );
};
