'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Hero.module.css'
import ScrollAnimation from '../../components/ui/scroll-animation'
import { AnimationTheme } from '../../lib/animation-config'

interface HeroProps {
    title?: string
    subtitle?: string
    primaryCtaText?: string
    primaryCtaLink?: string
    secondaryCtaText?: string
    secondaryCtaLink?: string
    backgroundImage?: string
    animationStyle?: AnimationTheme
}

export const Hero = ({
    title = "Protect Your Hair.\nElevate Your Style.",
    subtitle = "The premium satin lining solution for your favorite hoodies.",
    primaryCtaText = "Shop DIY Kits",
    primaryCtaLink = "/products/kits",
    secondaryCtaText = "How Mail-In Works",
    secondaryCtaLink = "/services/mail-in-service",
    backgroundImage = "/images/essentials-kit.jpg",
    animationStyle = "simple"
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
                <ScrollAnimation theme={animationStyle}>
                    <h1 className={styles.heroTitle}>
                        {title}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        {subtitle}
                    </p>
                </ScrollAnimation>
                
                <div className={styles.forkContainer}>
                    <ScrollAnimation theme={animationStyle} delay={0.2} hoverable={true}>
                        <Link 
                            href={primaryCtaLink} 
                            className={styles.primaryButton}
                        >
                            {primaryCtaText}
                        </Link>
                    </ScrollAnimation>
                    <ScrollAnimation theme={animationStyle} delay={0.3} hoverable={true}>
                        <Link 
                            href={secondaryCtaLink} 
                            className={styles.secondaryButton}
                        >
                            {secondaryCtaText}
                        </Link>
                    </ScrollAnimation>
                </div>
            </div>
        </section>
    )
}
