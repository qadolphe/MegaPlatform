
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, ArrowUp, ArrowDown, Tag } from "lucide-react";
import { ProductPickerDialog } from "./product-picker-dialog";

interface ProductPickerProps {
    storeId: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    label?: string;
}

export function ProductPicker({
    storeId,
    selectedIds = [],
    onChange,
    label,
}: ProductPickerProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, [storeId]);

    const fetchProducts = async () => {
        // Fetch simple list for lookup
        const { data } = await supabase
            .from("products")
            .select("id, title, images")
            .eq("store_id", storeId);

        if (data) setProducts(data);
        setLoading(false);
    };

    const removeProduct = (id: string) => {
        onChange(selectedIds.filter((i) => i !== id));
    };

    // Sort products by the order of selectedIds
    const selectedProducts = selectedIds
        .map(id => products.find(p => p.id === id))
        .filter(p => p !== undefined);

    if (loading) return <div className="text-sm text-slate-400">Loading products...</div>;

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {label}
                </label>
            )}

            {selectedProducts.length > 0 && (
                <div className="space-y-1">
                    {selectedProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 group"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded bg-slate-200 flex-shrink-0 overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><Tag size={12} /></div>
                                    )}
                                </div>
                                <span className="text-sm text-slate-700 truncate max-w-[120px]" title={product.title}>{product.title}</span>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        const newIds = [...selectedIds];
                                        if (index > 0) {
                                            [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
                                            onChange(newIds);
                                        }
                                    }}
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ArrowUp size={12} />
                                </button>
                                <button
                                    onClick={() => {
                                        const newIds = [...selectedIds];
                                        if (index < selectedIds.length - 1) {
                                            [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
                                            onChange(newIds);
                                        }
                                    }}
                                    disabled={index === selectedIds.length - 1}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ArrowDown size={12} />
                                </button>
                                <button
                                    onClick={() => removeProduct(product.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 ml-1"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsPickerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition"
            >
                <Plus size={14} />
                Select Products
            </button>

            <ProductPickerDialog
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                storeId={storeId}
                selectedIds={selectedIds}
                onChange={onChange}
            />
        </div>
    );
}
