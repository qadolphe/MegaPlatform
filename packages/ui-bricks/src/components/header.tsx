'use client'

import Link from 'next/link';
import { useCart } from '../hooks/use-cart';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

// I'll use clsx/tailwind-merge directly for now to be safe, or just standard strings.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Header() {
    const openCart = useCart((state) => state.openCart);
    const items = useCart((state) => state.items);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border h-[70px] flex items-center dark:bg-neutral-950/80 dark:border-white/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-foreground tracking-tighter">
                        Satin Kits
                    </Link>

                    <nav className="hidden md:flex gap-8">
                        <Link href="/products" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Shop</Link>
                        <Link href="/tutorials" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Tutorials</Link>
                        <Link href="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">About</Link>
                    </nav>

                    <div className="flex items-center">
                        <button 
                            className="relative p-2 text-foreground hover:bg-accent rounded-full transition-colors" 
                            aria-label="Cart"
                            onClick={openCart}
                        >
                            <ShoppingBag size={24} />
                            {mounted && itemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center translate-x-1/4 -translate-y-1/4">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
