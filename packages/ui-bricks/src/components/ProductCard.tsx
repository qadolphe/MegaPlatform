import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import styles from './ProductCard.module.css'

interface Metafield {
    key: string;
    label: string;
    value: string;
    type: 'text' | 'number' | 'boolean';
    showOnCard?: boolean;
    showOnDetail?: boolean;
    position?: 'above' | 'below';
}

interface ProductCardProps {
    product: any
    isActive?: boolean
    innerRef?: (el: HTMLDivElement | null) => void
    priority?: boolean
    overrideTitle?: string
    overrideDescription?: string
    overrideButtonText?: string
    overrideLink?: string
    className?: string
    buttonColor?: string
    buttonTextColor?: string
    hoverColor?: string
}

export const ProductCard = ({
    product,
    isActive = false,
    innerRef,
    priority = false,
    overrideTitle,
    overrideDescription,
    overrideButtonText,
    overrideLink,
    className = '',
    buttonColor,
    buttonTextColor,
    hoverColor
}: ProductCardProps) => {
    const config = product.ui || {}

    const displayTitle = overrideTitle || product.name
    const displayDesc = overrideDescription || product.description
    const displayButton = overrideButtonText || config.buttonText || 'View Details'
    const displayLink = overrideLink || `${config.linkPrefix || '/products'}/${product.slug}`

    const getPriceDisplay = (p: any) => {
        const price = p.base_price || 0;
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 100);

        if (p.type === 'kit') return `Starting from ${formatted}`
        if (p.slug === 'concierge') return `Cost of Hoodie + ${formatted}`
        return formatted
    }

    return (
        <div
            ref={innerRef}
            data-id={product.id}
            className={`
                ${styles.card} 
                ${isActive ? styles.focused : ''}
                ${className}
            `}
            style={{
                '--card-hover-color': hoverColor,
                '--card-button-bg': buttonColor,
                '--card-button-text': buttonTextColor
            } as React.CSSProperties}
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
                
                {/* Metafields shown on card */}
                {product.metafields && product.metafields.filter((m: Metafield) => m.showOnCard && m.value).length > 0 && (
                    <div className={styles.metafieldsContainer}>
                        {product.metafields.filter((m: Metafield) => m.showOnCard && m.value).map((field: Metafield) => (
                            <span key={field.key} className={styles.metafieldTag}>
                                {field.label}: {field.type === 'boolean' ? (field.value === 'true' ? 'Yes' : 'No') : field.value}
                            </span>
                        ))}
                    </div>
                )}

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
