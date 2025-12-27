"use client";

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useCart } from '@repo/ui-bricks';

export default function CheckoutCancelPage() {
    const { openCart } = useCart();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout Cancelled</h1>
                    <p className="text-slate-600">
                        No worries! Your cart items are still saved. You can complete your purchase whenever you're ready.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => openCart()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
