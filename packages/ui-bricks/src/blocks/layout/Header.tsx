"use client";

import Link from 'next/link';
import styles from './Header.module.css';
import { ShoppingBag } from 'lucide-react';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  links?: { href: string; label: string }[];
  logoText?: string;
  animationStyle?: AnimationTheme;
}

export const Header = ({ 
  cartCount = 0, 
  onCartClick, 
  links = [
    { href: '/products', label: 'Shop' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/about', label: 'About' }
  ],
  logoText = 'Satin Kits',
  animationStyle = 'none'
}: HeaderProps) => {
    return (
        <header className={styles.header}>
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
                        <ScrollAnimation theme={animationStyle} delay={0.3} hoverable={true}>
                            <button 
                                className={styles.cartBtn} 
                                aria-label="Cart"
                                onClick={onCartClick}
                            >
                                <ShoppingBag size={24} />
                                {cartCount > 0 && (
                                    <span className={styles.badge}>{cartCount}</span>
                                )}
                            </button>
                        </ScrollAnimation>
                    </div>
                </div>
            </div>
        </header>
    )
}
