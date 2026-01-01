"use client";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./TeamGrid.module.css";
import { Linkedin, Twitter, Mail } from "lucide-react";

interface TeamMember {
    name: string;
    role: string;
    image?: string;
    bio?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
}

interface TeamGridProps {
    title?: string;
    subtitle?: string;
    members?: TeamMember[];
    columns?: number;
    showBio?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    animationStyle?: AnimationTheme;
}

export const TeamGrid = ({
    title = "Our Team",
    subtitle,
    members = [],
    columns = 3,
    showBio = true,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    animationStyle = "simple"
}: TeamGridProps) => {
    return (
        <section
            className={styles.section}
            style={{ '--team-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
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
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {members.map((member, index) => (
                        <ScrollAnimation key={index} theme={animationStyle} delay={index * 0.1}>
                            <div className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className={styles.image} />
                                    ) : (
                                        <div className={styles.placeholder}>
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.name} style={{ color: titleColor || 'var(--color-text)' }}>
                                        {member.name}
                                    </h3>
                                    <span className={styles.role} style={{ color: accentColor || 'var(--color-primary)' }}>
                                        {member.role}
                                    </span>
                                    {showBio && member.bio && (
                                        <p className={styles.bio} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                            {member.bio}
                                        </p>
                                    )}
                                    <div className={styles.social}>
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {member.twitter && (
                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                                <Twitter size={18} />
                                            </a>
                                        )}
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className={styles.socialLink}>
                                                <Mail size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
};
