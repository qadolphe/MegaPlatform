'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Hero.module.css'

interface HeroProps {
    title?: string
    subtitle?: string
    primaryCtaText?: string
    primaryCtaLink?: string
    secondaryCtaText?: string
    secondaryCtaLink?: string
    backgroundImage?: string
}

export const Hero = ({
    title = "Protect Your Hair.\nElevate Your Style.",
    subtitle = "The premium satin lining solution for your favorite hoodies.",
    primaryCtaText = "Shop DIY Kits",
    primaryCtaLink = "/products/kits",
    secondaryCtaText = "How Mail-In Works",
    secondaryCtaLink = "/services/mail-in-service",
    backgroundImage = "/images/essentials-kit.jpg"
}: HeroProps) => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroBackground}>
                {backgroundImage && (
                    <Image
                        src={backgroundImage}
                        alt="Hero Background"
                        fill
                        className={styles.heroImage}
                        quality={90}
                        priority
                    />
                )}
                <div className={styles.heroOverlay} />
            </div>
            
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                    {title}
                </h1>
                <p className={styles.heroSubtitle}>
                    {subtitle}
                </p>
                
                <div className={styles.forkContainer}>
                    <Link 
                        href={primaryCtaLink} 
                        className={styles.primaryButton}
                    >
                        {primaryCtaText}
                    </Link>
                    <Link 
                        href={secondaryCtaLink} 
                        className={styles.secondaryButton}
                    >
                        {secondaryCtaText}
                    </Link>
                </div>
            </div>
        </section>
    )
}
