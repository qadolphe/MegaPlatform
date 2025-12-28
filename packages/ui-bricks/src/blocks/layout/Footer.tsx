"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Facebook, Youtube, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import ScrollAnimation from '../../components/ui/scroll-animation';
import styles from './Footer.module.css';
import { AnimationTheme } from '../../lib/animation-config';

interface FooterColumn {
    title: string;
    links: { label: string; href: string }[];
}

interface SocialLink {
    platform: 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'linkedin';
    url: string;
}

interface FooterProps {
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    backgroundOpacity?: number;
    textColor?: string;
    storeName?: string;
    storeDescription?: string;
    logoImage?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    showNewsletter?: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    copyrightText?: string;
}

const SocialIcon = ({ platform, size = 20 }: { platform: string; size?: number }) => {
    switch (platform) {
        case 'instagram': return <Instagram size={size} />;
        case 'twitter': return <Twitter size={size} />;
        case 'facebook': return <Facebook size={size} />;
        case 'youtube': return <Youtube size={size} />;
        case 'linkedin': return <Linkedin size={size} />;
        default: return null;
    }
};

export const Footer = ({ 
    animationStyle = 'simple', 
    backgroundColor, 
    backgroundOpacity = 100, 
    textColor,
    storeName = 'My Store',
    storeDescription = 'Quality products for everyone.',
    logoImage,
    columns = [
        { title: 'Shop', links: [{ label: 'All Products', href: '/products' }, { label: 'New Arrivals', href: '/new' }] },
        { title: 'Support', links: [{ label: 'About Us', href: '/about' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] }
    ],
    socialLinks = [],
    showNewsletter = true,
    newsletterTitle = 'Stay Updated',
    newsletterDescription = 'Subscribe for new products and updates.',
    contactEmail,
    contactPhone,
    contactAddress,
    copyrightText
}: FooterProps) => {
    const customStyles = {
        '--footer-bg': backgroundColor,
        '--footer-opacity': backgroundOpacity / 100,
        '--footer-text': textColor,
    } as React.CSSProperties;

    return (
        <footer className={styles.footer} style={customStyles}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className={styles.grid}>
                    {/* Brand Column */}
                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.1}>
                        <div className={styles.col}>
                            {logoImage ? (
                                <Image 
                                    src={logoImage} 
                                    alt={storeName} 
                                    width={120} 
                                    height={40} 
                                    className={styles.logoImage}
                                />
                            ) : (
                                <h3 className={styles.heading}>{storeName}</h3>
                            )}
                            <p className={styles.text}>{storeDescription}</p>
                            
                            {/* Social Links */}
                            {socialLinks.length > 0 && (
                                <div className={styles.socialLinks}>
                                    {socialLinks.map((social, idx) => (
                                        <a 
                                            key={idx}
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={styles.socialLink}
                                        >
                                            <SocialIcon platform={social.platform} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollAnimation>

                    {/* Dynamic Columns */}
                    {columns.map((column, index) => (
                        <ScrollAnimation key={column.title} theme={animationStyle} variant="fadeUp" delay={0.2 + index * 0.1}>
                            <div className={styles.col}>
                                <h4 className={styles.subheading}>{column.title}</h4>
                                <ul className={styles.list}>
                                    {column.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link href={link.href}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollAnimation>
                    ))}

                    {/* Contact Info or Newsletter */}
                    <ScrollAnimation theme={animationStyle} variant="fadeUp" delay={0.4}>
                        <div className={styles.col}>
                            {(contactEmail || contactPhone || contactAddress) ? (
                                <>
                                    <h4 className={styles.subheading}>Contact</h4>
                                    <div className={styles.contactList}>
                                        {contactEmail && (
                                            <a href={`mailto:${contactEmail}`} className={styles.contactItem}>
                                                <Mail size={16} /> {contactEmail}
                                            </a>
                                        )}
                                        {contactPhone && (
                                            <a href={`tel:${contactPhone}`} className={styles.contactItem}>
                                                <Phone size={16} /> {contactPhone}
                                            </a>
                                        )}
                                        {contactAddress && (
                                            <span className={styles.contactItem}>
                                                <MapPin size={16} /> {contactAddress}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : showNewsletter && (
                                <>
                                    <h4 className={styles.subheading}>{newsletterTitle}</h4>
                                    <p className={styles.text}>{newsletterDescription}</p>
                                    <div className={styles.newsletter}>
                                        <input type="email" placeholder="Enter your email" className={styles.input} />
                                        <button className={`${styles.btn} ${styles.btnPrimary}`}>Subscribe</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollAnimation>
                </div>

                <div className={styles.bottom}>
                    <p>{copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</p>
                </div>
            </div>
        </footer>
    );
}
