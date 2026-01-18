"use client";

import { Package } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function ProductsDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Package className="h-8 w-8 text-purple-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Products API</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Fetch, search, and manage products in your store.
                </p>
            </div>

            {/* List Products */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                     <h2 className="text-xl font-bold text-slate-900">List Products</h2>
                </div>
                <p className="text-slate-600 mb-4">Retrieve a paginated list of published products from your store.</p>
                
                <CodeBlock
                    title="List all products"
                    code={`// Fetch latest products
const products = await swat.products.list();`}
                />

                 <CodeBlock
                    title="Pagination & Filtering"
                    code={`// Fetch with options
const products = await swat.products.list({
  limit: 12,           // Number of items per page
  offset: 0,           // Skip N items (pagination)
  category: 'shoes',   // Filter by category slug
  search: 'running'    // Search by title/description
});`}
                />
            </section>

            {/* Get Product */}
            <section className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                     <h2 className="text-xl font-bold text-slate-900">Get Product</h2>
                </div>
                <p className="text-slate-600 mb-4">Retrieve a single product details by its ID or URL slug.</p>
                
                <CodeBlock
                    title="Get By Slug"
                    code={`try {
  const product = await swat.products.get('my-awesome-product');
  console.log(product.title, product.price);
} catch (e) {
  // Handle 404
  console.log('Product not found');
}`}
                />
            </section>

            {/* Create Product */}
            <section className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">POST</span>
                     <h2 className="text-xl font-bold text-slate-900">Create Product</h2>
                </div>
                <p className="text-slate-600 mb-4">Programmatically add new products to your catalog.</p>
                
                <CodeBlock
                    title="Create new product"
                    code={`const newProduct = await swat.products.create({
  title: "Limited Edition Hoodie",
  price: 5900,  // Price in cents ($59.00)
  description: "Premium cotton blend...",
  images: ["https://example.com/hoodie.jpg"],
  category: "apparel",
  inventory_quantity: 100,
  published: true
});`}
                />
            </section>
        </div>
    );
}
