import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import styles from './ProductCard.module.css'

interface ProductCardProps {
    product: any
    isActive?: boolean
    innerRef?: (el: HTMLDivElement | null) => void
    priority?: boolean
    overrideTitle?: string
    overrideDescription?: string
    overrideButtonText?: string
    overrideLink?: string
}

export const ProductCard = ({
    product,
    isActive = false,
    innerRef,
    priority = false,
    overrideTitle,
    overrideDescription,
    overrideButtonText,
    overrideLink
}: ProductCardProps) => {
    const config = product.ui || {}

    const displayTitle = overrideTitle || product.name
    const displayDesc = overrideDescription || product.description
    const displayButton = overrideButtonText || config.buttonText || 'View Details'
    const displayLink = overrideLink || `${config.linkPrefix || '/products'}/${product.slug}`

    const getPriceDisplay = (p: any) => {
        if (p.type === 'kit') return `Starting from $${p.base_price}`
        if (p.slug === 'concierge') return `Cost of Hoodie + $${p.base_price}`
        return `$${p.base_price}`
    }

    return (
        <div
            ref={innerRef}
            data-id={product.id}
            className={`
                ${styles.card} 
                ${isActive ? styles.focused : ''}
            `}
        >
            <div className={styles.backgroundImageContainer}>
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className={styles.backgroundImage}
                        quality={90}
                        priority={priority}
                    />
                )}
                <div className={styles.gradientOverlay} />
            </div>

            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{displayTitle}</h3>
                <p className={styles.productDesc}>{displayDesc}</p>

                <div className={styles.expandedContent}>
                    <ul className={styles.featureList}>
                        {config.features && config.features.map((feature: string, i: number) => (
                            <li key={i} className={styles.featureItem}>
                                <Check size={16} className={styles.checkIcon} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.productPrice}>
                        {getPriceDisplay(product)}
                    </div>

                    <Link
                        href={displayLink}
                        className={styles.productLink}
                    >
                        {displayButton}
                    </Link>
                </div>
            </div>
        </div>
    )
}
