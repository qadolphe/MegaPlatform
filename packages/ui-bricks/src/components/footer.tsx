'use client'

import Link from 'next/link';
import ScrollAnimation from './ui/scroll-animation';

export default function Footer() {
    return (
        <footer className="bg-neutral-50 py-24 mt-auto border-t border-black/5 dark:bg-background dark:border-white/10">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <ScrollAnimation variant="fadeUp" delay={0.1}>
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold mb-4">Satin Kits</h3>
                            <p className="text-sm leading-relaxed text-foreground mb-4">
                                Premium satin lining kits for your favorite hoodies. Protect your hair, elevate your style.
                            </p>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation variant="fadeUp" delay={0.2}>
                        <div className="flex flex-col">
                            <h4 className="text-base font-semibold mb-4">Shop</h4>
                            <ul className="space-y-2 list-none p-0">
                                <li><Link href="/products/kits" className="text-sm text-foreground/80 hover:text-foreground transition-colors">DIY Kits</Link></li>
                                <li><Link href="/services/mail-in-service" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Mail-in Service</Link></li>
                                <li><Link href="/products" className="text-sm text-foreground/80 hover:text-foreground transition-colors">All Products</Link></li>
                            </ul>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation variant="fadeUp" delay={0.3}>
                        <div className="flex flex-col">
                            <h4 className="text-base font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 list-none p-0">
                                <li><Link href="/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors">About Us</Link></li>
                                <li><Link href="/tutorials" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Tutorials</Link></li>
                                <li><Link href="/faq" className="text-sm text-foreground/80 hover:text-foreground transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation variant="fadeUp" delay={0.4}>
                        <div className="flex flex-col">
                            <h4 className="text-base font-semibold mb-4">Stay Updated</h4>
                            <p className="text-sm leading-relaxed text-foreground mb-4">Subscribe for new colors and tutorials.</p>
                            {/* Placeholder for newsletter form */}
                            <div className="flex gap-2">
                                <input type="email" placeholder="Enter your email" className="flex-1 p-2 border border-border rounded-md bg-background text-foreground" />
                                <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black/90 transition-colors dark:bg-white dark:text-black dark:hover:bg-white/90">Subscribe</button>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground opacity-80">
                    <p>&copy; {new Date().getFullYear()} Satin Kits. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
