"use client";

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
}

export const ProductDetail = ({ product, animationStyle = 'simple' }: ProductDetailProps) => {
    const { addItem, openCart } = useCart();

    if (!product) {
        return <div className={styles.container}>Product not found</div>;
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.base_price,
            quantity: 1,
            image: product.image_url,
            type: product.type || 'kit',
            slug: product.slug
        });
        openCart();
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
                    onClick={handleAddToCart}
                    className={styles.addToCartBtn}
                >
                    Add to Cart
                </button>
            </ScrollAnimation>
        </div>
    );
};
