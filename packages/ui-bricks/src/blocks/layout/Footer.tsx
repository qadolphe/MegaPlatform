"use client";

import Link from 'next/link';
import ScrollAnimation from '../../components/ui/scroll-animation';
import styles from './Footer.module.css';
import { AnimationTheme } from '../../lib/animation-config';

interface FooterProps {
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    textColor?: string;
}

export const Footer = ({ animationStyle = 'simple', backgroundColor, textColor }: FooterProps) => {
    const customStyles = {
        '--footer-bg': backgroundColor,
        '--footer-text': textColor,
    } as React.CSSProperties;

    return (
        <footer className={styles.footer} style={customStyles}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className={styles.grid}>
                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.1}>
                        <div className={styles.col}>
                            <h3 className={styles.heading}>Satin Kits</h3>
                            <p className={styles.text}>
                                Premium satin lining kits for your favorite hoodies. Protect your hair, elevate your style.
                            </p>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.2}>
                        <div className={styles.col}>
                            <h4 className={styles.subheading}>Shop</h4>
                            <ul className={styles.list}>
                                <li><Link href="/products/kits">DIY Kits</Link></li>
                                <li><Link href="/services/mail-in-service">Mail-in Service</Link></li>
                                <li><Link href="/products">All Products</Link></li>
                            </ul>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.3}>
                        <div className={styles.col}>
                            <h4 className={styles.subheading}>Support</h4>
                            <ul className={styles.list}>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/tutorials">Tutorials</Link></li>
                                <li><Link href="/faq">FAQ</Link></li>
                            </ul>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.4}>
                        <div className={styles.col}>
                            <h4 className={styles.subheading}>Stay Updated</h4>
                            <p className={styles.text}>Subscribe for new colors and tutorials.</p>
                            {/* Placeholder for newsletter form */}
                            <div className={styles.newsletter}>
                                <input type="email" placeholder="Enter your email" className={styles.input} />
                                <button className={`${styles.btn} ${styles.btnPrimary}`}>Subscribe</button>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Satin Kits. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
