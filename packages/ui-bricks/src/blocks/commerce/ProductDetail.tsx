"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../hooks/use-cart';
import styles from './ProductDetail.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface ProductDetailProps {
    product: {
        id: string;
        name: string;
        description: string;
        base_price: number;
        image_url: string;
        slug: string;
        type?: 'kit' | 'service';
    };
    animationStyle?: AnimationTheme;
    buttonAction?: 'addToCart' | 'buyNow' | 'contact';
}

export const ProductDetail = ({ product, animationStyle = 'simple', buttonAction = 'addToCart' }: ProductDetailProps) => {
    const { addItem, openCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    if (!product) {
        return <div className={styles.container}>Product not found</div>;
    }

    const handleAction = () => {
        if (buttonAction === 'addToCart') {
            addItem({
                id: product.id,
                name: product.name,
                price: product.base_price,
                quantity: 1,
                image: product.image_url,
                type: product.type || 'kit',
                slug: product.slug
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
    }).format((product.base_price || 0) / 100);

    return (
        <div className={styles.container}>
            <ScrollAnimation theme={animationStyle} className={styles.imageContainer} hoverable={true}>
                {product.image_url && (
                    <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        width={600}
                        height={600}
                        className={styles.productImage}
                        priority
                    />
                )}
            </ScrollAnimation>
            <ScrollAnimation theme={animationStyle} delay={0.2} className={styles.details}>
                <h1 className={styles.title}>{product.name}</h1>
                <p className={styles.price}>{formattedPrice}</p>
                <div className={styles.description}>
                    {product.description}
                </div>
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
