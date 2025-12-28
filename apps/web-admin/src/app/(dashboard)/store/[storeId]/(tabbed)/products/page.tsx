"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Package, Edit, Trash, FolderOpen, X, Save, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
    id: string;
    title: string;
    price: number;
    images: string[];
    published: boolean;
    inventory: number;
    slug: string;
    collectionIds: string[];
};

type Collection = {
    id: string;
    title: string;
    slug: string;
    image_url?: string;
    productCount?: number;
};

export default function ProductsList() {
    const params = useParams();
    const router = useRouter();
    const storeId = params.storeId as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCollection, setFilterCollection] = useState<string>("all");
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [newCollectionTitle, setNewCollectionTitle] = useState("");
    const [newCollectionSlug, setNewCollectionSlug] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [storeId]);

    const fetchData = async () => {
        // Fetch products with their collections
        const { data: productsData } = await supabase
            .from("products")
            .select("*, product_variants(inventory_quantity), product_collections(collection_id)")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        // Fetch collections with product counts
        const { data: collectionsData } = await supabase
            .from("collections")
            .select("*, product_collections(product_id)")
            .eq("store_id", storeId)
            .order("title", { ascending: true });

        if (productsData) {
            const transformed = productsData.map((p: any) => ({
                ...p,
                inventory: p.product_variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
                collectionIds: p.product_collections?.map((pc: any) => pc.collection_id) || []
            }));
            setProducts(transformed);
        }

        if (collectionsData) {
            const withCounts = collectionsData.map((c: any) => ({
                ...c,
                productCount: c.product_collections?.length || 0
            }));
            setCollections(withCounts);
        }

        setLoading(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) setProducts(products.filter(p => p.id !== id));
    };

    const handleSaveCollection = async () => {
        if (!newCollectionTitle.trim()) return;

        const slug = newCollectionSlug || newCollectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        if (editingCollection) {
            await supabase
                .from("collections")
                .update({ title: newCollectionTitle, slug })
                .eq("id", editingCollection.id);
        } else {
            await supabase.from("collections").insert({
                store_id: storeId,
                title: newCollectionTitle,
                slug
            });
        }

        setEditingCollection(null);
        setNewCollectionTitle("");
        setNewCollectionSlug("");
        fetchData();
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm("Delete this collection? Products will remain but be unlinked.")) return;
        await supabase.from("collections").delete().eq("id", id);
        if (filterCollection === id) setFilterCollection("all");
        fetchData();
    };

    const openEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setNewCollectionTitle(collection.title);
        setNewCollectionSlug(collection.slug);
        setIsCollectionModalOpen(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = filterCollection === "all" || p.collectionIds.includes(filterCollection);
        return matchesSearch && matchesCollection;
    });

    if (loading) return <div className="p-8">Loading products...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setEditingCollection(null); setNewCollectionTitle(""); setNewCollectionSlug(""); setIsCollectionModalOpen(true); }}
                        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition font-medium"
                    >
                        <FolderOpen size={18} /> Collections
                    </button>
                    <Link
                        href={`/store/${storeId}/products/new`}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} /> Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {collections.length > 0 && (
                        <div className="relative">
                            <select
                                value={filterCollection}
                                onChange={(e) => setFilterCollection(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 rounded-md px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Collections</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.title} ({c.productCount})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    )}
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Image</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Collections</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="h-12 w-12 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Package size={20} className="text-slate-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{product.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {product.collectionIds.length > 0 ? (
                                            product.collectionIds.slice(0, 2).map(cid => {
                                                const col = collections.find(c => c.id === cid);
                                                return col ? (
                                                    <span key={cid} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                        {col.title}
                                                    </span>
                                                ) : null;
                                            })
                                        ) : (
                                            <span className="text-xs text-slate-400">No collections</span>
                                        )}
                                        {product.collectionIds.length > 2 && (
                                            <span className="text-xs text-slate-400">+{product.collectionIds.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                        {product.published ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    ${(product.price / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/store/${storeId}/products/${product.id}`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Collection Management Modal */}
            <AnimatePresence>
                {isCollectionModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsCollectionModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
                        >
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingCollection ? 'Edit Collection' : 'Manage Collections'}
                                </h2>
                                <button onClick={() => setIsCollectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Create/Edit Form */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-slate-700">
                                        {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Collection title"
                                        value={newCollectionTitle}
                                        onChange={(e) => {
                                            setNewCollectionTitle(e.target.value);
                                            if (!editingCollection) {
                                                setNewCollectionSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="URL slug (auto-generated)"
                                        value={newCollectionSlug}
                                        onChange={(e) => setNewCollectionSlug(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveCollection}
                                            disabled={!newCollectionTitle.trim()}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                        >
                                            <Save size={14} /> {editingCollection ? 'Update' : 'Create'}
                                        </button>
                                        {editingCollection && (
                                            <button
                                                onClick={() => { setEditingCollection(null); setNewCollectionTitle(""); setNewCollectionSlug(""); }}
                                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Existing Collections */}
                                {collections.length > 0 && !editingCollection && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-slate-700">Existing Collections</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {collections.map(c => (
                                                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div>
                                                        <span className="font-medium text-slate-800">{c.title}</span>
                                                        <span className="text-xs text-slate-400 ml-2">/{c.slug}</span>
                                                        <span className="text-xs text-slate-400 ml-2">({c.productCount} products)</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => openEditCollection(c)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCollection(c.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

