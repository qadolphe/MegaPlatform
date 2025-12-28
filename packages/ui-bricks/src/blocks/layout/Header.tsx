"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Header.module.css';
import { ShoppingBag, Menu, X } from 'lucide-react';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';
import { useCart } from '../../hooks/use-cart';

interface HeaderProps {
  cartCount?: number; // Deprecated in favor of internal hook
  onCartClick?: () => void; // Deprecated
  links?: { href: string; label: string }[];
  logoText?: string;
  logoImage?: string;
  animationStyle?: AnimationTheme;
  showCart?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  sticky?: boolean;
  centered?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export const Header = ({ 
  links = [
    { href: '/products', label: 'Shop' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/about', label: 'About' }
  ],
  logoText = 'My Store',
  logoImage,
  animationStyle = 'none',
  showCart = true,
  backgroundColor,
  backgroundOpacity = 100,
  textColor,
  sticky = true,
  centered = false,
  ctaText,
  ctaLink
}: HeaderProps) => {
    const { items, openCart } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const customStyles = {
        '--header-bg': backgroundColor,
        '--header-opacity': backgroundOpacity / 100,
        '--header-text': textColor,
    } as React.CSSProperties;

    return (
        <header className={`${styles.header} ${sticky ? styles.sticky : ''}`} style={customStyles}>
            <div className={styles.container}>
                <div className={`${styles.inner} ${centered ? styles.centered : ''}`}>
                    <ScrollAnimation theme={animationStyle} hoverable={true}>
                        <Link href="/" className={styles.logo}>
                            {logoImage ? (
                                <Image 
                                    src={logoImage} 
                                    alt={logoText} 
                                    width={120} 
                                    height={40} 
                                    className={styles.logoImage}
                                />
                            ) : (
                                logoText
                            )}
                        </Link>
                    </ScrollAnimation>

                    {/* Desktop Nav */}
                    <nav className={styles.nav}>
                        {links.map((link, index) => (
                            <ScrollAnimation key={link.href} theme={animationStyle} delay={index * 0.1} hoverable={true}>
                                <Link href={link.href} className={styles.link}>{link.label}</Link>
                            </ScrollAnimation>
                        ))}
                    </nav>

                    <div className={styles.actions}>
                        {ctaText && ctaLink && (
                            <ScrollAnimation theme={animationStyle} delay={0.2} hoverable={true}>
                                <Link href={ctaLink} className={styles.ctaButton}>
                                    {ctaText}
                                </Link>
                            </ScrollAnimation>
                        )}
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
                        {/* Mobile Menu Toggle */}
                        <button 
                            className={styles.mobileMenuBtn}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        {links.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                className={styles.mobileLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {ctaText && ctaLink && (
                            <Link 
                                href={ctaLink} 
                                className={styles.mobileCta}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {ctaText}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
