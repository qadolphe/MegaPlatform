
"use client";

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Canceled
                </h1>

                <p className="text-gray-600 mb-8">
                    Your payment was canceled and you have not been charged. Items are still in your cart if you wish to try again.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Return to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}
