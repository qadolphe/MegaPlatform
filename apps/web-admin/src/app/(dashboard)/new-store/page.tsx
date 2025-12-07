"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Globe } from "lucide-react";
import Link from "next/link";

export default function CreateStore() {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name || !subdomain) return alert("Please fill in all fields");
    setLoading(true);

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return alert("You must be logged in!");
    }

    // 2. Create the Store
    const { data: store, error } = await supabase
      .from("stores")
      .insert({ name, subdomain, owner_id: user.id })
      .select()
      .single();

    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    // 3. Create the default "Home" page with a default Hero
    const defaultLayout = [
      { 
        id: crypto.randomUUID(),
        type: "Header", 
        props: { 
          title: name, 
          links: [
            { label: "Home", href: "/" }, 
            { label: "Shop", href: "/shop" }
          ] 
        } 
      },
      {
        id: crypto.randomUUID(),
        type: "Hero",
        props: { title: `Welcome to ${name}!` }
      },
      {
        id: crypto.randomUUID(),
        type: "ProductGrid",
        props: { 
          title: "Featured Products",
          products: [
            { id: 1, title: "Cool Hoodie", price: 4999 },
            { id: 2, title: "Awesome Cap", price: 2499 },
            { id: 3, title: "Graphic Tee", price: 2999 }
          ]
        }
      },
      { 
        id: crypto.randomUUID(),
        type: "Footer", 
        props: { copyright: `© ${new Date().getFullYear()} ${name}` } 
      }
    ];

    await supabase.from("store_pages").insert({
      store_id: store.id,
      slug: "home",
      layout_config: defaultLayout,
      published: true,
      is_home: true
    });

    setLoading(false);
    router.push("/"); // Redirect to dashboard
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create a New Store</h1>
          <p className="text-gray-500 mt-1">Launch a new storefront in seconds.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                placeholder="e.g. Bob's Hoodies"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                placeholder="e.g. bob-hoodies"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">.hoodieplatform.com</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This will be your store's temporary URL. You can add a custom domain later.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating Store..." : "Launch Store"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
