"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutRenderer, LayoutBlock, StoreColors } from "@/components/layout-renderer";
import { CartDrawer } from "@repo/ui-bricks";

export default function PreviewPage() {
    const searchParams = useSearchParams();
    const [layout, setLayout] = useState<LayoutBlock[]>([]);
    const [colors, setColors] = useState<StoreColors>({
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#000000',
    });
    const [theme, setTheme] = useState('simple');
    const [products, setProducts] = useState<any[]>([]);
    const [ready, setReady] = useState(false);

    // Listen for messages from parent (editor)
    const handleMessage = useCallback((event: MessageEvent) => {
        // Validate origin in production
        const data = event.data;

        if (data.type === 'PREVIEW_UPDATE') {
            if (data.layout) setLayout(data.layout);
            if (data.colors) setColors(data.colors);
            if (data.theme) setTheme(data.theme);
            if (data.products) setProducts(data.products);
            setReady(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleMessage);

        // Signal to parent that we're ready
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // Also try to load from localStorage for initial render
    useEffect(() => {
        const storeId = searchParams.get('storeId');
        const pageSlug = searchParams.get('slug') || 'home';

        if (storeId) {
            const cached = localStorage.getItem(`preview_${storeId}_${pageSlug}`);
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data.layout) setLayout(data.layout);
                    if (data.colors) setColors(data.colors);
                    if (data.theme) setTheme(data.theme);
                    if (data.products) setProducts(data.products);
                    setReady(true);
                } catch (e) {
                    console.error('Failed to parse cached preview data');
                }
            }
        }
    }, [searchParams]);

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-slate-400 text-sm">Loading preview...</div>
            </div>
        );
    }

    return (
        <>
            <LayoutRenderer
                layout={layout}
                colors={colors}
                theme={theme}
                products={products}
                showCart={products.length > 0}
            />
            <CartDrawer />
        </>
    );
}
