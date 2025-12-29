
"use client";

import { useEffect } from 'react';
import { useCart } from '@repo/ui-bricks';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear the cart when the success page loads
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                </h1>

                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. We have received your order and will begin processing it shortly.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Return to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
