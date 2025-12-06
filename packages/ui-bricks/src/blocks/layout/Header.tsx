"use client";

import Link from 'next/link';
import styles from './Header.module.css';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  links?: { href: string; label: string }[];
  logoText?: string;
}

export const Header = ({ 
  cartCount = 0, 
  onCartClick, 
  links = [
    { href: '/products', label: 'Shop' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/about', label: 'About' }
  ],
  logoText = 'Satin Kits'
}: HeaderProps) => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.inner}>
                    <Link href="/" className={styles.logo}>
                        {logoText}
                    </Link>

                    <nav className={styles.nav}>
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>
                        ))}
                    </nav>

                    <div className={styles.actions}>
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
                    </div>
                </div>
            </div>
        </header>
    );
}
