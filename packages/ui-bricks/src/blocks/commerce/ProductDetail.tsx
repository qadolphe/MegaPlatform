"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../hooks/use-cart';
import styles from './ProductDetail.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface Metafield {
    key: string;
    label: string;
    value: string;
    type: 'text' | 'number' | 'boolean';
    showOnCard?: boolean;
    showOnDetail?: boolean;
    position?: 'above' | 'below';
}

interface ProductDetailProps {
    product: {
        id: string;
        name: string;
        description: string;
        base_price: number;
        image_url: string;
        slug: string;
        type?: 'kit' | 'service';
        metafields?: Metafield[];
        variants?: Array<{
            id: string;
            title: string;
            sku?: string;
            price?: number; // absolute price in cents
            price_adjustment?: number; // legacy/optional
            options?: Record<string, string>;
            description?: string;
            image_url?: string; // legacy/optional
            images?: string[]; // preferred
        }>;
    };
    animationStyle?: AnimationTheme;
    buttonAction?: 'addToCart' | 'buyNow' | 'contact';
}

export const ProductDetail = ({ product, animationStyle = 'simple', buttonAction = 'addToCart' }: ProductDetailProps) => {
    const { addItem, openCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    if (!product) {
        return <div className={styles.container}>Product not found</div>;
    }

    const variants = product.variants || [];

    const selectedVariant = useMemo(() => {
        if (!variants.length) return null;
        const resolved = variants.find(v => v.id === selectedVariantId) || null;
        return resolved || variants[0];
    }, [selectedVariantId, variants]);

    // Initialize variant selection on first load or when product changes
    useEffect(() => {
        if (!variants.length) {
            setSelectedVariantId(null);
            return;
        }

        setSelectedVariantId((current) => current || variants[0].id);
    }, [product.id]);

    const currentVariantImages = useMemo(() => {
        const v = selectedVariant;
        if (!v) return [];
        const images = (v.images || []).filter(Boolean);
        if (images.length > 0) return images;
        if (v.image_url) return [v.image_url];
        return [];
    }, [selectedVariant]);

    // Keep selected image in sync with chosen variant
    useEffect(() => {
        if (currentVariantImages.length > 0) {
            setSelectedImageUrl(currentVariantImages[0]);
            return;
        }

        setSelectedImageUrl(product.image_url || null);
    }, [selectedVariant?.id, product.image_url, currentVariantImages.length]);

    const currentPrice = (() => {
        if (selectedVariant?.price != null) return selectedVariant.price;
        if (selectedVariant?.price_adjustment != null) return (product.base_price || 0) + selectedVariant.price_adjustment;
        return product.base_price || 0;
    })();

    const currentDescription = selectedVariant?.description || product.description;

    const displayImage = selectedImageUrl || product.image_url;

    const formatVariantLabel = (v: NonNullable<typeof selectedVariant>) => {
        if (v.title) return v.title;
        const optionValues = v.options ? Object.values(v.options).filter(Boolean) : [];
        return optionValues.join(' / ') || 'Option';
    };

    const handleAction = () => {
        if (buttonAction === 'addToCart') {
            addItem({
                id: product.id,
                name: product.name,
                price: currentPrice,
                quantity: 1,
                image: displayImage,
                type: product.type || 'kit',
                slug: product.slug,
                variantId: selectedVariant?.id,
                variantName: selectedVariant ? formatVariantLabel(selectedVariant) : undefined,
            });
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
            openCart();
        } else if (buttonAction === 'buyNow') {
             // TODO: Implement direct checkout
             console.log("Buy Now clicked");
        } else if (buttonAction === 'contact') {
             window.location.href = `mailto:support@example.com?subject=Inquiry about ${product.name}`;
        }
    };

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((currentPrice || 0) / 100);

    // Filter metafields for display
    const metafieldsAbove = (product.metafields || []).filter(m => m.showOnDetail !== false && m.position === 'above' && m.value);
    const metafieldsBelow = (product.metafields || []).filter(m => m.showOnDetail !== false && m.position !== 'above' && m.value);

    const renderMetafield = (field: Metafield) => {
        let displayValue = field.value;
        if (field.type === 'boolean') {
            displayValue = field.value === 'true' ? 'Yes' : 'No';
        }
        return (
            <div key={field.key} className={styles.metafield}>
                <span className={styles.metafieldLabel}>{field.label}:</span>
                <span className={styles.metafieldValue}>{displayValue}</span>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <ScrollAnimation theme={animationStyle} className={styles.imageContainer} hoverable={true}>
                {displayImage && (
                    <Image 
                        src={displayImage} 
                        alt={product.name} 
                        width={600}
                        height={600}
                        className={styles.productImage}
                        priority
                    />
                )}
            </ScrollAnimation>
            {currentVariantImages.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {currentVariantImages.map((url) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => setSelectedImageUrl(url)}
                            className={`h-16 w-16 overflow-hidden rounded-md border ${
                                selectedImageUrl === url ? 'border-black' : 'border-gray-200'
                            }`}
                            aria-label="Select product image"
                        >
                            <Image src={url} alt="" width={64} height={64} style={{ objectFit: 'cover' }} />
                        </button>
                    ))}
                </div>
            )}
            <ScrollAnimation theme={animationStyle} delay={0.2} className={styles.details}>
                <h1 className={styles.title}>{product.name}</h1>
                <p className={styles.price}>{formattedPrice}</p>

                {variants.length > 0 && (
                    <div className="mb-6">
                        <div className="mb-2 text-sm font-medium">Options</div>
                        <div className="flex flex-wrap gap-2">
                            {variants.map((v) => {
                                const isSelected = selectedVariant?.id === v.id;
                                const label = v.title || (v.options ? Object.values(v.options).filter(Boolean).join(' / ') : 'Option');
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(v.id)}
                                        className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                                            isSelected
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Custom fields above description */}
                {metafieldsAbove.length > 0 && (
                    <div className={styles.metafieldsContainer}>
                        {metafieldsAbove.map(renderMetafield)}
                    </div>
                )}
                
                <div className={styles.description}>
                    {currentDescription}
                </div>
                
                {/* Custom fields below description */}
                {metafieldsBelow.length > 0 && (
                    <div className={styles.metafieldsContainer}>
                        {metafieldsBelow.map(renderMetafield)}
                    </div>
                )}
                
                <button 
                    onClick={handleAction}
                    className={`${styles.addToCartBtn} ${isAdded ? styles.added : ''}`}
                    disabled={isAdded}
                >
                    {isAdded ? 'Added to Cart!' : (buttonAction === 'addToCart' ? 'Add to Cart' : buttonAction === 'buyNow' ? 'Buy Now' : 'Contact Us')}
                </button>
            </ScrollAnimation>
        </div>
    );
};
