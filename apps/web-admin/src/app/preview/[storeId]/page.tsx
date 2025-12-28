"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { LayoutRenderer, LayoutBlock, StoreColors } from "@/components/layout-renderer";
import { CartDrawer } from "@repo/ui-bricks";

export default function PreviewPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const storeId = params.storeId as string;
    const pageSlug = searchParams.get('slug') || 'home';

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
    const readySignalSent = useRef(false);

    // Listen for messages from parent (editor)
    const handleMessage = useCallback((event: MessageEvent) => {
        const data = event.data;
        if (data?.type === 'PREVIEW_UPDATE') {
            if (data.layout) setLayout(data.layout);
            if (data.colors) setColors(data.colors);
            if (data.theme) setTheme(data.theme);
            if (data.products) setProducts(data.products);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleMessage);

        // Signal ready immediately - parent will send data
        if (!readySignalSent.current) {
            readySignalSent.current = true;
            window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // Try to load cached data from autosave for instant display
    useEffect(() => {
        const autosaveKey = `autosave_${storeId}_${pageSlug}`;
        const cached = localStorage.getItem(autosaveKey);
        if (cached && layout.length === 0) {
            try {
                const blocks = JSON.parse(cached);
                if (Array.isArray(blocks) && blocks.length > 0) {
                    setLayout(blocks);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, [storeId, pageSlug, layout.length]);

    // Show skeleton while waiting for data
    if (layout.length === 0) {
        return (
            <div className="min-h-screen bg-white animate-pulse">
                <div className="h-16 bg-slate-100" />
                <div className="h-96 bg-slate-50 m-4 rounded-lg" />
                <div className="h-48 bg-slate-50 m-4 rounded-lg" />
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

