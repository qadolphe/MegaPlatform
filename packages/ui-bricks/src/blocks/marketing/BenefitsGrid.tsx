"use client";

import Image from 'next/image';
import styles from './BenefitsGrid.module.css';

interface Benefit {
    title: string
    description: string
    image: string
    alt: string
    large?: boolean
}

interface BenefitsGridProps {
    title?: string
    benefits?: Benefit[]
}

export const BenefitsGrid = ({
    title = "Why Satin?",
    benefits = [
        {
            title: "Hair Health",
            description: "Satin reduces friction by up to 90%.",
            image: "/images/coily-hair-hood-down.png",
            alt: "Hair Health",
            large: true
        },
        {
            title: "Protection",
            description: "Protect your curls from harsh textures.",
            image: "/images/curly-hair-hood-up.png",
            alt: "Protection"
        },
        {
            title: "Premium Feel",
            description: "Add a touch of luxury to everyday wear.",
            image: "/images/hoodie-close-up.png",
            alt: "Premium Feel"
        }
    ]
}: BenefitsGridProps) => {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.grid}>
                {benefits.map((benefit, index) => (
                    <div 
                        key={index} 
                        className={`${styles.card} ${benefit.large ? styles.cardLarge : ''}`}
                    >
                        <div className={styles.imageWrapper}>
                            {benefit.image && (
                                <Image
                                    src={benefit.image}
                                    alt={benefit.alt}
                                    fill
                                    className={styles.image}
                                />
                            )}
                            <div className={styles.overlay} />
                        </div>
                        <div className={styles.content}>
                            <h3 className={styles.cardTitle}>{benefit.title}</h3>
                            <p className={styles.cardDesc}>{benefit.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
