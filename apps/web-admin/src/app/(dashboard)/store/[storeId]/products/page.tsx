"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Package, Edit, Trash, ArrowLeft, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { PageSwitcher } from "@/components/PageSwitcher";

type Product = {
  id: string;
  title: string;
  price: number;
  images: string[];
  published: boolean;
  inventory: number; // We'll sum variants for this display
  slug: string;
};

export default function ProductsList() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(inventory_quantity)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      // Transform data to include total inventory
      const transformed = data.map((p: any) => ({
        ...p,
        inventory: p.product_variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0
      }));
      setProducts(transformed);
    }
    setLoading(false);
  };

  const handleCreateCustomPage = async (product: Product) => {
    const slug = `products/${product.slug}`;
    
    // Check if page already exists
    const { data: existingPage } = await supabase
        .from("store_pages")
        .select("id")
        .eq("store_id", storeId)
        .eq("slug", slug)
        .single();

    if (existingPage) {
        if (confirm("A custom page for this product already exists. Do you want to edit it?")) {
            router.push(`/editor/${storeId}?slug=${slug}`);
        }
        return;
    }

    if (!confirm(`Create a custom page for "${product.title}"? This will override the default product layout.`)) return;

    // Create new page
    const { error } = await supabase
      .from("store_pages")
      .insert([
        {
          store_id: storeId,
          name: product.title,
          slug: slug,
          layout_config: [
            { id: crypto.randomUUID(), type: "Header", props: { logoText: "Store" } },
            { 
                id: crypto.randomUUID(), 
                type: "ProductDetail", 
                props: { 
                    product: {
                        id: product.id,
                        name: product.title,
                        description: "Product Description",
                        base_price: product.price,
                        image_url: product.images?.[0] || "",
                        slug: product.slug
                    }
                } 
            },
            { id: crypto.randomUUID(), type: "Footer", props: {} }
          ]
        }
      ]);

    if (error) {
      alert("Error creating page: " + error.message);
    } else {
      router.push(`/editor/${storeId}?slug=${slug}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Error deleting product");
    else setProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <PageSwitcher storeId={storeId} activeTab="products" />
        <Link 
            href={`/store/${storeId}/products/new`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
        >
            <Plus size={18} /> Add Product
        </Link>
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
        </div>

        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Image</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory</th>
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                                {product.published ? 'Active' : 'Draft'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            {product.inventory} in stock
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                            ${(product.price / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => handleCreateCustomPage(product)}
                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                                    title="Create Custom Page"
                                >
                                    <LayoutTemplate size={16} />
                                </button>
                                <Link 
                                    href={`/store/${storeId}/products/${product.id}`}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                    <Edit size={16} />
                                </Link>
                                <button 
                                    onClick={() => handleDelete(product.id)}
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
    </div>
  );
}
