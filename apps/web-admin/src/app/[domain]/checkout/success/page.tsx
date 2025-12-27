"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@repo/ui-bricks';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCart();
    const [isCleared, setIsCleared] = useState(false);

    useEffect(() => {
        // Clear cart only once
        if (!isCleared && sessionId) {
            clearCart();
            setIsCleared(true);
        }
    }, [sessionId, isCleared, clearCart]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
                    <p className="text-slate-600">
                        Thank you for your purchase. We've sent a confirmation email with your order details.
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Order confirmation sent to your email</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 transition"
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
