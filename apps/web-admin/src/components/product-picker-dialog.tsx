
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Check, X, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProductPickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function ProductPickerDialog({
    isOpen,
    onClose,
    storeId,
    selectedIds,
    onChange
}: ProductPickerDialogProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen, storeId]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("products")
            .select("id, title, price, images, published")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    const toggleProduct = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Products</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 p-2 border rounded-md mb-4">
                    <Search size={18} className="text-slate-400" />
                    <input
                        className="flex-1 outline-none text-sm"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {loading ? (
                        <div className="text-center p-8 text-slate-400">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {filteredProducts.map(product => {
                                const isSelected = selectedIds.includes(product.id);
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => toggleProduct(product.id)}
                                        className={`
                                            cursor-pointer group relative border rounded-lg overflow-hidden transition-all
                                            ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'}
                                        `}
                                    >
                                        <div className="aspect-square bg-slate-100 relative">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Tag size={24} />
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                                        <Check size={16} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-sm truncate" title={product.title}>{product.title}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-slate-500">${(product.price / 100).toFixed(2)}</span>
                                                {!product.published && (
                                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Draft</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t mt-auto">
                    <div className="text-sm text-slate-500">
                        {selectedIds.length} selected
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
