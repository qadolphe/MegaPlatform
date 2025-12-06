"use client";
import { useEffect, useState } from "react";
// You might need to pass the supabase client or fetch data inside
// For MVP, we will accept products as props OR fetch them if we have a storeId

export const ProductGrid = ({ title, products = [] }: { title: string, products: any[] }) => {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded hover:shadow-lg transition">
            <div className="h-48 bg-gray-100 mb-4 rounded flex items-center justify-center">
              {/* Image Placeholder */}
              <span className="text-gray-400">Image</span>
            </div>
            <h3 className="font-bold">{product.title}</h3>
            <p className="text-gray-600">${(product.price / 100).toFixed(2)}</p>
            <button className="mt-4 w-full bg-black text-white py-2 rounded">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
