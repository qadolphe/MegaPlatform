'use client'

import { useCart } from '../hooks/use-cart'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AnimatedCounter from './ui/animated-counter'

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()

    const handleCheckout = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    returnUrl: pathname,
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Error checking out:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-black z-[101] flex flex-col border-l border-white/10 shadow-2xl"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Your Cart ({items.length})</h2>
                            <button onClick={closeCart} className="bg-transparent border-none text-gray-400 cursor-pointer p-2 transition-colors hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                                <ShoppingBag size={48} />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            className="flex gap-4 pb-6 border-b border-white/5"
                                        >
                                            <Link
                                                href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0"
                                                onClick={closeCart}
                                            >
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                )}
                                            </Link>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <Link
                                                        href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                        className="font-semibold text-white text-base no-underline block hover:underline"
                                                        onClick={closeCart}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-gray-300 text-sm">
                                                        ${(item.price / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2 bg-white/5 rounded p-0.5">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center justify-center rounded-sm transition-colors hover:bg-white/10"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm text-white min-w-[20px] text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center justify-center rounded-sm transition-colors hover:bg-white/10"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="bg-transparent border-none text-red-500 text-sm cursor-pointer p-0"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-neutral-950">
                                <div className="flex justify-between items-center mb-6 text-white font-bold text-lg">
                                    <span>Total</span>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>$</span>
                                        <AnimatedCounter value={totalPrice()} isCurrency />
                                    </div>
                                </div>
                                <button 
                                    className="w-full bg-white text-black p-4 rounded-full font-bold uppercase border-none cursor-pointer transition-all hover:bg-purple-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
