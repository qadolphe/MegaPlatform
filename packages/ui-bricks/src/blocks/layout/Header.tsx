"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Header.module.css';
import { ShoppingBag, Menu, X, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
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
  socialLinks?: { platform: 'facebook' | 'instagram' | 'twitter' | 'youtube'; url: string }[];
  bannerText?: string;
  bannerLink?: string;
  bannerColor?: string;
  bannerTextColor?: string;
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
  ctaLink,
  socialLinks = [],
  bannerText,
  bannerLink,
  bannerColor = '#000',
  bannerTextColor = '#fff'
}: HeaderProps) => {
    const { items, openCart } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const customStyles = {
        '--header-bg': backgroundColor,
        '--header-opacity': backgroundOpacity / 100,
        '--header-text': textColor,
    } as React.CSSProperties;

    const renderSocialIcon = (platform: string) => {
        switch (platform) {
            case 'facebook': return <Facebook size={18} />;
            case 'instagram': return <Instagram size={18} />;
            case 'twitter': return <Twitter size={18} />;
            case 'youtube': return <Youtube size={18} />;
            default: return null;
        }
    };

    return (
        <>
            {bannerText && (
                <div 
                    className="w-full py-2 px-4 text-center text-sm font-medium relative z-[51]"
                    style={{ backgroundColor: bannerColor, color: bannerTextColor }}
                >
                    {bannerLink ? (
                        <Link href={bannerLink} className="hover:underline">
                            {bannerText}
                        </Link>
                    ) : (
                        bannerText
                    )}
                </div>
            )}
            <header className={`${styles.header} ${sticky ? styles.sticky : ''}`} style={{ ...customStyles, top: bannerText ? 'auto' : 0 }}>
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
                            {links.map((link, index) => {
                                const href = link?.href;
                                const label = link?.label;

                                return (
                                    <ScrollAnimation key={href || `nav-${index}`} theme={animationStyle} delay={index * 0.1} hoverable={true}>
                                        {href ? (
                                            <Link href={href} className={styles.link}>{label || href}</Link>
                                        ) : (
                                            <span className={styles.link} style={{ cursor: 'default' }}>{label || 'New Link'}</span>
                                        )}
                                    </ScrollAnimation>
                                );
                            })}
                        </nav>

                        <div className={styles.actions}>
                            {/* Social Links (Desktop) */}
                            {socialLinks.length > 0 && (
                                <div className="hidden md:flex items-center gap-3 mr-4 border-r border-gray-200 pr-4">
                                    {socialLinks.map((social, idx) => (
                                        <a 
                                            key={idx} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="opacity-70 hover:opacity-100 transition-opacity"
                                            style={{ color: textColor }}
                                        >
                                            {renderSocialIcon(social.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}

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
                            {links.map((link, index) => {
                                const href = link?.href;
                                const label = link?.label;

                                return href ? (
                                    <Link 
                                        key={href || `mobile-nav-${index}`}
                                        href={href}
                                        className={styles.mobileLink}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {label || href}
                                    </Link>
                                ) : (
                                    <div
                                        key={`mobile-nav-${index}`}
                                        className={styles.mobileLink}
                                        style={{ opacity: 0.6, cursor: 'default' }}
                                    >
                                        {label || 'New Link'}
                                    </div>
                                );
                            })}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-4 px-4 py-2">
                                    {socialLinks.map((social, idx) => (
                                        <a 
                                            key={idx} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="opacity-70 hover:opacity-100 transition-opacity"
                                        >
                                            {renderSocialIcon(social.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}
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
        </>
    );
};
