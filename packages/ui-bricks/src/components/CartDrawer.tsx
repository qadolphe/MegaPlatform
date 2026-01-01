"use client";

import { useCart } from '../hooks/use-cart';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CartDrawer.module.css';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AnimatedCounter from './ui/animated-counter';

export const CartDrawer = () => {
    const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    const handleCheckout = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    returnUrl: pathname,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error checking out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className={styles.overlay}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={styles.drawer}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>Your Cart ({items.length})</h2>
                            <button onClick={closeCart} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ShoppingBag size={48} />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                <AnimatePresence initial={false} mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            className={styles.item}
                                        >
                                            <Link
                                                href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                className={styles.itemImage}
                                                onClick={closeCart}
                                            >
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                )}
                                            </Link>
                                            <div className={styles.itemDetails}>
                                                <div>
                                                    <Link
                                                        href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                        className={styles.itemName}
                                                        onClick={closeCart}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    {item.variantName && (
                                                        <p className="text-xs text-gray-500">{item.variantName}</p>
                                                    )}
                                                    <p className={styles.itemPrice}>
                                                        ${(item.price / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className={styles.itemMeta}>
                                                    <div className={styles.quantityControls}>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                                                            className={styles.qtyBtn}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className={styles.quantity}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                                                            className={styles.qtyBtn}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.variantId)}
                                                        className={styles.removeBtn}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className={styles.footer}>
                                <div className={styles.totalRow}>
                                    <span>Total</span>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>$</span>
                                        <AnimatedCounter value={totalPrice()} isCurrency />
                                    </div>
                                </div>
                                <button 
                                    className={styles.checkoutBtn}
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
