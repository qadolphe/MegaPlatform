"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Trash, Upload, Wand2, X, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { MediaManager } from "@/components/media-manager";

export default function ProductEditor() {
    const params = useParams();
    const router = useRouter();
    const storeId = params.storeId as string;
    const productId = params.productId as string;
    const isNew = productId === "new";
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<{ type: 'product' } | { type: 'variant'; index: number }>({ type: 'product' });

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0); // in cents
    const [comparePrice, setComparePrice] = useState<number | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [published, setPublished] = useState(false);

    // AI Generation State
    const [generatingDesc, setGeneratingDesc] = useState(false);

    const generateDescription = async () => {
        if (!title && !price) return alert("Please enter a title and price first to give the AI some context.");
        setGeneratingDesc(true);

        try {
            const res = await fetch("/api/ai/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: title,
                    price: price / 100,
                    tags: options.map(o => o.name).join(", "),
                    existingDescription: description
                })
            });

            const data = await res.json();
            if (data.description) {
                setDescription(data.description);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate description");
        } finally {
            setGeneratingDesc(false);
        }
    };

    // Variants State
    const [variants, setVariants] = useState<any[]>([
        { id: crypto.randomUUID(), title: "Default", price: 0, inventory_quantity: 0, options: {}, description: "", images: [], image_url: null }
    ]);
    const [options, setOptions] = useState<{ name: string, values: string[] }[]>([]);
    const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
    const [newOptionName, setNewOptionName] = useState("");
    const [optionValueInputs, setOptionValueInputs] = useState<Record<number, string>>({});

    // Metafields State
    const [metafields, setMetafields] = useState<{ key: string, label: string, value: string, type: 'text' | 'number' | 'boolean', showOnCard?: boolean, showOnDetail?: boolean, position?: 'above' | 'below' }[]>([]);

    // Collections State
    const [availableCollections, setAvailableCollections] = useState<{ id: string, title: string }[]>([]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isNew) {
            fetchProduct();
        }
        fetchCollections();
    }, [productId]);

    const fetchCollections = async () => {
        const { data } = await supabase
            .from("collections")
            .select("id, title")
            .eq("store_id", storeId)
            .order("title");

        if (data) setAvailableCollections(data);
    };

    const fetchProduct = async () => {
        const { data: product, error } = await supabase
            .from("products")
            .select("*, product_variants(*)")
            .eq("id", productId)
            .single();

        if (error) {
            alert("Error fetching product");
            router.push(`/store/${storeId}/products`);
            return;
        }

        setTitle(product.title);
        setDescription(product.description || "");
        setPrice(product.price);
        setComparePrice(product.compare_at_price);
        setImages(product.images || []);
        setPublished(product.published);
        setOptions(Array.isArray(product.options) ? product.options : []);
        setMetafields(Array.isArray(product.metafields) ? product.metafields : []);

        if (product.product_variants && product.product_variants.length > 0) {
            setVariants(product.product_variants);
        }

        // Load product collections
        const { data: productCollections } = await supabase
            .from("product_collections")
            .select("collection_id")
            .eq("product_id", productId);

        if (productCollections) {
            setSelectedCollectionIds(productCollections.map(pc => pc.collection_id));
        }

        setLoading(false);
    };

    const handleSave = async () => {
        if (!title) return alert("Title is required");
        setSaving(true);

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const productData = {
            store_id: storeId,
            title,
            slug, // In a real app, handle slug collisions
            description,
            price: isNaN(price) ? 0 : price,
            compare_at_price: comparePrice,
            images,
            options,
            metafields,
            published
        };

        let savedProductId = productId;

        if (isNew) {
            const { data, error } = await supabase
                .from("products")
                .insert(productData)
                .select()
                .single();

            if (error) {
                alert("Error creating product: " + error.message);
                setSaving(false);
                return;
            }
            savedProductId = data.id;

            // Create a corresponding page for the product
            const { error: pageError } = await supabase
                .from("store_pages")
                .insert([
                    {
                        store_id: storeId,
                        name: `Product: ${title}`,
                        slug: `products/${slug}`,
                        layout_config: [
                            { id: crypto.randomUUID(), type: "Header", props: { logoText: "My Store" } },
                            { id: crypto.randomUUID(), type: "ProductDetail", props: { productId: savedProductId } },
                            { id: crypto.randomUUID(), type: "Footer", props: {} }
                        ]
                    }
                ]);

            if (pageError) {
                console.error("Error creating product page:", pageError);
            }
        } else {
            const { error } = await supabase
                .from("products")
                .update(productData)
                .eq("id", productId);

            if (error) {
                alert("Error updating product: " + error.message);
                setSaving(false);
                return;
            }
        }

        // Handle Variants
        // 1. Delete existing variants (simple approach for MVP)
        if (!isNew) {
            await supabase.from("product_variants").delete().eq("product_id", savedProductId);
        }

        // 2. Insert current variants
        const variantsToInsert = variants.map(v => ({
            product_id: savedProductId,
            title: v.title,
            price: isNaN(v.price) ? (isNaN(price) ? 0 : price) : v.price, // Fallback to base price
            inventory_quantity: isNaN(v.inventory_quantity) ? 0 : v.inventory_quantity,
            options: v.options,
            description: v.description || null,
            image_url: v.image_url || (Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : null),
            images: Array.isArray(v.images) ? v.images : [],
        }));

        const { error: varError } = await supabase.from("product_variants").insert(variantsToInsert);

        // Handle Collections
        // 1. Delete existing associations
        await supabase.from("product_collections").delete().eq("product_id", savedProductId);

        // 2. Insert new associations
        if (selectedCollectionIds.length > 0) {
            const collectionsToInsert = selectedCollectionIds.map(cId => ({
                product_id: savedProductId,
                collection_id: cId
            }));
            await supabase.from("product_collections").insert(collectionsToInsert);
        }

        if (varError) {
            alert("Product saved but variants failed: " + varError.message);
        } else {
            // Sync to Knowledge Base for AI Search
            fetch("/api/ai/sync-product-knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId,
                    productId: savedProductId,
                    title,
                    description,
                    tags: options.map(o => o.name).join(", ")
                })
            }).catch(e => console.error("Knowledge Sync Failed:", e));

            if (isNew) {
                router.push(`/store/${storeId}/products`);
            } else {
                alert("Saved successfully!");
                fetchProduct(); // Refresh
            }
        }
        setSaving(false);
    };

    const addOption = () => {
        const newOptions = [...options, { name: "", values: [] }];
        setOptions(newOptions);
        setEditingOptionIndex(newOptions.length - 1);
    };

    const addOptionValue = (optionIndex: number) => {
        const val = optionValueInputs[optionIndex]?.trim();
        if (!val) return;

        const newOptions = [...options];
        if (!newOptions[optionIndex].values.includes(val)) {
            newOptions[optionIndex].values.push(val);
            setOptions(newOptions);
        }
        setOptionValueInputs({ ...optionValueInputs, [optionIndex]: "" });
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...options];
        newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
        setOptions(newOptions);
    };

    const handleOptionNameChange = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/store/${storeId}/products`} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <ArrowLeft size={20} className="text-slate-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{isNew ? "New Product" : "Edit Product"}</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md p-2"
                                    placeholder="e.g. Classic Hoodie"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <button
                                        onClick={generateDescription}
                                        disabled={generatingDesc}
                                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                                    >
                                        <Wand2 size={12} />
                                        {generatingDesc ? "Generating..." : "Generate with AI"}
                                    </button>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md p-2 h-32"
                                    placeholder="Product description..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900">Media</h3>
                            <button
                                onClick={() => setIsMediaOpen(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Add from Library
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((url, idx) => (
                                <div key={idx} className="aspect-square relative group rounded-md overflow-hidden border border-slate-200">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setIsMediaOpen(true)}
                                className="aspect-square border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition"
                            >
                                <Upload size={24} />
                                <span className="text-xs mt-2">Upload</span>
                            </button>
                        </div>
                    </div>

                    {/* Variants / Options */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900">Product Options</h3>
                        </div>

                        {/* Options Summary List */}
                        {options.length > 0 && (
                            <div className="space-y-3 mb-6">
                                {options.map((opt, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setEditingOptionIndex(idx)}
                                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-white hover:border-blue-400 transition group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{opt.name || "UNNAMED OPTION"}</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {opt.values.length > 0 ? opt.values.map((v, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700">{v}</span>
                                                    )) : <span className="text-xs text-slate-400 italic">No values added</span>}
                                                </div>
                                            </div>
                                            <div className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition">Edit</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Option Editor Dialog (inline) */}
                        {editingOptionIndex !== null && (
                            <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-500 shadow-md">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Option name</label>
                                        <input
                                            type="text"
                                            value={options[editingOptionIndex].name}
                                            onChange={(e) => handleOptionNameChange(editingOptionIndex, e.target.value)}
                                            className="w-full border border-slate-300 rounded-md p-2"
                                            placeholder="e.g. Size"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Option values</label>
                                        <div className="space-y-2">
                                            {options[editingOptionIndex].values.map((val, vIdx) => (
                                                <div key={vIdx} className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                                                    <span className="text-sm">{val}</span>
                                                    <button
                                                        onClick={() => removeOptionValue(editingOptionIndex, vIdx)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={optionValueInputs[editingOptionIndex] || ""}
                                                    onChange={(e) => setOptionValueInputs({ ...optionValueInputs, [editingOptionIndex]: e.target.value })}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addOptionValue(editingOptionIndex);
                                                        }
                                                    }}
                                                    placeholder="Add another value"
                                                    className="flex-1 border border-slate-300 rounded-md p-2 text-sm"
                                                />
                                                <button
                                                    onClick={() => addOptionValue(editingOptionIndex)}
                                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={() => {
                                                const newOptions = options.filter((_, i) => i !== editingOptionIndex);
                                                setOptions(newOptions);
                                                setEditingOptionIndex(null);
                                            }}
                                            className="text-red-600 text-sm border border-slate-200 px-3 py-1.5 rounded hover:bg-red-50 transition"
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            onClick={() => setEditingOptionIndex(null)}
                                            className="bg-slate-900 text-white text-sm px-6 py-1.5 rounded hover:bg-slate-800 transition"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Another Option Button */}
                        {editingOptionIndex === null && options.length < 3 && (
                            <button
                                onClick={addOption}
                                className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                            >
                                <Plus size={16} /> {options.length === 0 ? "Add Option" : "Add another option"}
                            </button>
                        )}
                    </div>

                    {/* Variants Header */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-semibold text-slate-900">Variants ({variants.length})</h4>
                        </div>

                        {/* Variants Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Variant</th>
                                        <th className="px-4 py-3 font-semibold w-32">Price</th>
                                        <th className="px-4 py-3 font-semibold w-32">Inventory</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {variants.map((variant, idx) => (
                                        <tr key={variant.id || idx} className="hover:bg-slate-50/50 transition">
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="text"
                                                    value={variant.title}
                                                    onChange={(e) => {
                                                        const newVars = [...variants];
                                                        newVars[idx].title = e.target.value;
                                                        setVariants(newVars);
                                                    }}
                                                    className="w-full border-none bg-transparent focus:ring-0 p-0 font-medium text-slate-900 mb-2"
                                                    placeholder="Variant title"
                                                />

                                                {/* Variant option pickers */}
                                                {options.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {options.map((opt, optIdx) => (
                                                            <div key={`${idx}-${optIdx}`}>
                                                                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{opt.name || `Option ${optIdx + 1}`}</label>
                                                                <select
                                                                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                                    value={(variant.options && variant.options[opt.name]) || ""}
                                                                    onChange={(e) => {
                                                                        const newVars = [...variants];
                                                                        const nextOptions = { ...(newVars[idx].options || {}) };
                                                                        nextOptions[opt.name] = e.target.value;
                                                                        newVars[idx].options = nextOptions;
                                                                        setVariants(newVars);
                                                                    }}
                                                                >
                                                                    <option value="">Select...</option>
                                                                    {opt.values.map((val: string) => (
                                                                        <option key={val} value={val}>{val}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Expanded Section (Images, etc) */}
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Media</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setMediaTarget({ type: 'variant', index: idx });
                                                                setIsMediaOpen(true);
                                                            }}
                                                            className="text-[11px] text-blue-600 hover:underline font-medium"
                                                        >
                                                            Select Images
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {(variant.images || []).map((url: string, imgIdx: number) => (
                                                            <div key={url + imgIdx} className="relative h-12 w-12 rounded-md overflow-hidden border border-slate-200 group">
                                                                <img src={url} className="h-full w-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newVars = [...variants];
                                                                        const next = [...(newVars[idx].images || [])].filter((_: string, i: number) => i !== imgIdx);
                                                                        newVars[idx].images = next;
                                                                        newVars[idx].image_url = next.length > 0 ? next[0] : null;
                                                                        setVariants(newVars);
                                                                    }}
                                                                    className="absolute top-0.5 right-0.5 bg-white/90 text-red-500 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <Trash size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {(variant.images || []).length === 0 && (
                                                            <div className="text-[11px] text-slate-400 italic">No images</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1.5">
                                                    <span className="text-slate-400 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        value={isNaN(variant.price) ? "" : variant.price / 100}
                                                        onChange={(e) => {
                                                            const newVars = [...variants];
                                                            newVars[idx].price = parseFloat(e.target.value) * 100;
                                                            setVariants(newVars);
                                                        }}
                                                        className="w-full border-none bg-transparent focus:ring-0 p-0 text-sm"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="number"
                                                    value={isNaN(variant.inventory_quantity) ? "" : variant.inventory_quantity}
                                                    onChange={(e) => {
                                                        const newVars = [...variants];
                                                        newVars[idx].inventory_quantity = parseInt(e.target.value);
                                                        setVariants(newVars);
                                                    }}
                                                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-right align-top">
                                                {variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                                                        className="text-slate-300 hover:text-red-500 transition p-1"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <button
                            onClick={() => setVariants([...variants, { id: crypto.randomUUID(), title: `Variant ${variants.length + 1}`, price: price, inventory_quantity: 0, options: {}, description: "", images: [], image_url: null }])}
                            className="mt-6 w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 font-medium text-sm rounded-lg transition"
                        >
                            + Add Variant Row
                        </button>
                    </div>

                    {/* Custom Fields / Metafields */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900">Custom Fields</h3>
                            <button
                                onClick={() => {
                                    const key = prompt("Enter field key (e.g. cpu_speed, fabric_origin)");
                                    if (key) {
                                        const label = prompt("Enter display label (e.g. CPU Speed, Fabric Origin)") || key;
                                        setMetafields([...metafields, {
                                            key: key.toLowerCase().replace(/\s+/g, '_'),
                                            label,
                                            value: '',
                                            type: 'text',
                                            showOnCard: false,
                                            showOnDetail: true,
                                            position: 'below'
                                        }]);
                                    }
                                }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                + Add Field
                            </button>
                        </div>

                        {metafields.length === 0 ? (
                            <p className="text-sm text-slate-400">No custom fields. Add fields like &quot;CPU Speed&quot; or &quot;Fabric Origin&quot; to store extra product data.</p>
                        ) : (
                            <div className="space-y-4">
                                {metafields.map((field, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium text-slate-700">{field.label}</span>
                                                <span className="text-xs text-slate-400 ml-2">({field.key})</span>
                                            </div>
                                            <button
                                                onClick={() => setMetafields(metafields.filter((_, i) => i !== idx))}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                value={field.type}
                                                onChange={(e) => {
                                                    const newFields = [...metafields];
                                                    newFields[idx].type = e.target.value as 'text' | 'number' | 'boolean';
                                                    setMetafields(newFields);
                                                }}
                                                className="border border-slate-300 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="boolean">Yes/No</option>
                                            </select>

                                            {field.type === 'boolean' ? (
                                                <select
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const newFields = [...metafields];
                                                        newFields[idx].value = e.target.value;
                                                        setMetafields(newFields);
                                                    }}
                                                    className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const newFields = [...metafields];
                                                        newFields[idx].value = e.target.value;
                                                        setMetafields(newFields);
                                                    }}
                                                    placeholder="Enter value..."
                                                    className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm"
                                                />
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.showOnCard || false}
                                                    onChange={(e) => {
                                                        const newFields = [...metafields];
                                                        newFields[idx].showOnCard = e.target.checked;
                                                        setMetafields(newFields);
                                                    }}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-slate-600">Show on Card</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.showOnDetail !== false}
                                                    onChange={(e) => {
                                                        const newFields = [...metafields];
                                                        newFields[idx].showOnDetail = e.target.checked;
                                                        setMetafields(newFields);
                                                    }}
                                                    className="rounded border-slate-300"
                                                />
                                                <span className="text-slate-600">Show on Detail</span>
                                            </label>
                                            <select
                                                value={field.position || 'below'}
                                                onChange={(e) => {
                                                    const newFields = [...metafields];
                                                    newFields[idx].position = e.target.value as 'above' | 'below';
                                                    setMetafields(newFields);
                                                }}
                                                className="border border-slate-300 rounded px-2 py-0.5 text-xs"
                                            >
                                                <option value="above">Above Description</option>
                                                <option value="below">Below Description</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Status</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Published</span>
                            <button
                                onClick={() => setPublished(!published)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${published ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Pricing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    value={isNaN(price) ? "" : price / 100}
                                    onChange={(e) => setPrice(parseFloat(e.target.value) * 100)}
                                    className="w-full border border-slate-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Compare at Price ($)</label>
                                <input
                                    type="number"
                                    value={comparePrice ? comparePrice / 100 : ""}
                                    onChange={(e) => setComparePrice(e.target.value ? parseFloat(e.target.value) * 100 : null)}
                                    className="w-full border border-slate-300 rounded-md p-2"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collections */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Collections</h3>
                        {availableCollections.length === 0 ? (
                            <p className="text-sm text-slate-400">No collections yet. Create collections in your store settings.</p>
                        ) : (
                            <div className="space-y-2">
                                {availableCollections.map(col => (
                                    <label key={col.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={selectedCollectionIds.includes(col.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCollectionIds([...selectedCollectionIds, col.id]);
                                                } else {
                                                    setSelectedCollectionIds(selectedCollectionIds.filter(id => id !== col.id));
                                                }
                                            }}
                                            className="rounded border-slate-300 text-blue-600"
                                        />
                                        <span className="text-slate-700">{col.title}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MediaManager
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={(url) => {
                    if (mediaTarget.type === 'product') {
                        setImages([...images, url]);
                        setIsMediaOpen(false);
                        return;
                    }

                    const idx = mediaTarget.index;
                    const newVars = [...variants];
                    const nextImages = [...(newVars[idx].images || []), url];
                    newVars[idx].images = nextImages;
                    // keep legacy image_url aligned
                    newVars[idx].image_url = nextImages[0] || null;
                    setVariants(newVars);
                    setIsMediaOpen(false);
                }}
            />
        </div>
    );
}
