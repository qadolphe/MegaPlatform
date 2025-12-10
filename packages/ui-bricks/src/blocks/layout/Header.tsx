"use client";

import Link from 'next/link';
import styles from './Header.module.css';
import { ShoppingBag } from 'lucide-react';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';
import { useCart } from '../../hooks/use-cart';

interface HeaderProps {
  cartCount?: number; // Deprecated in favor of internal hook
  onCartClick?: () => void; // Deprecated
  links?: { href: string; label: string }[];
  logoText?: string;
  animationStyle?: AnimationTheme;
  showCart?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export const Header = ({ 
  links = [
    { href: '/products', label: 'Shop' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/about', label: 'About' }
  ],
  logoText = 'Satin Kits',
  animationStyle = 'none',
  showCart = true,
  backgroundColor,
  textColor
}: HeaderProps) => {
    const { items, openCart } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const customStyles = {
        '--header-bg': backgroundColor,
        '--header-text': textColor,
    } as React.CSSProperties;

    return (
        <header className={styles.header} style={customStyles}>
            <div className={styles.container}>
                <div className={styles.inner}>
                    <ScrollAnimation theme={animationStyle} hoverable={true}>
                        <Link href="/" className={styles.logo}>
                            {logoText}
                        </Link>
                    </ScrollAnimation>

                    <nav className={styles.nav}>
                        {links.map((link, index) => (
                            <ScrollAnimation key={link.href} theme={animationStyle} delay={index * 0.1} hoverable={true}>
                                <Link href={link.href} className={styles.link}>{link.label}</Link>
                            </ScrollAnimation>
                        ))}
                    </nav>

                    <div className={styles.actions}>
                        {showCart && (
                            <ScrollAnimation theme={animationStyle} delay={0.3} hoverable={true}>
                                <button 
                                    className={styles.cartBtn} 
                                    aria-label="Cart"
                                    onClick={openCart}
                                >
                                    <ShoppingBag size={24} />
                                    {cartCount > 0 && (
                                        <span className={styles.badge}>{cartCount}</span>
                                    )}
                                </button>
                            </ScrollAnimation>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
