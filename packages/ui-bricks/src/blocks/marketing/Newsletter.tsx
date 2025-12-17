"use client";

import { useState } from 'react';
import styles from './Newsletter.module.css';
import ScrollAnimation from '../../components/ui/scroll-animation';
import { AnimationTheme } from '../../lib/animation-config';

interface NewsletterProps {
    title?: string;
    description?: string;
    buttonText?: string;
    placeholder?: string;
    animationStyle?: AnimationTheme;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export const Newsletter = ({
    title = "Subscribe to our newsletter",
    description = "Get the latest updates on new products and upcoming sales.",
    buttonText = "Subscribe",
    placeholder = "Enter your email",
    animationStyle = "simple",
    backgroundColor,
    textColor,
    buttonColor,
    buttonTextColor
}: NewsletterProps) => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail("");
        }, 1000);
    };

    const customStyles = {
        '--newsletter-bg': backgroundColor,
        '--newsletter-text': textColor,
        '--newsletter-btn-bg': buttonColor,
        '--newsletter-btn-text': buttonTextColor,
    } as React.CSSProperties;

    return (
        <section className={styles.section} style={customStyles}>
            <div className={styles.container}>
                <ScrollAnimation theme={animationStyle} variant="fadeUp">
                    <div className={styles.content}>
                        <h2 className={styles.title}>{title}</h2>
                        {description && <p className={styles.description}>{description}</p>}
                        
                        {status === 'success' ? (
                            <div className={styles.successMessage}>
                                Thanks for subscribing!
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={placeholder}
                                    required
                                    className={styles.input}
                                />
                                <button 
                                    type="submit" 
                                    className={styles.button}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? '...' : buttonText}
                                </button>
                            </form>
                        )}
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    );
};
