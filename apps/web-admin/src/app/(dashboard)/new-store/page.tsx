"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Wand2, Check, Store, Palette, Package, Layout, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// Thinking steps for the loading animation
const THINKING_STEPS = [
  { id: 'name', label: 'Generating store name...', icon: Store },
  { id: 'theme', label: 'Designing theme & colors...', icon: Palette },
  { id: 'products', label: 'Creating products...', icon: Package },
  { id: 'layout', label: 'Building homepage...', icon: Layout },
];

export default function CreateStore() {
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [businessType, setBusinessType] = useState<
    "ecommerce" | "appointments" | "services" | "digital" | "content"
  >("ecommerce");
  const [offerings, setOfferings] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [targetAudience, setTargetAudience] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [mustHavePages, setMustHavePages] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  // Animate through thinking steps while loading
  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < THINKING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  const buildPrompt = () => {
    const businessTypeLine =
      businessType === "ecommerce"
        ? "Business type: ecommerce store (physical products)."
        : businessType === "appointments"
          ? "Business type: appointment / scheduling site for a brick-and-mortar business."
          : businessType === "services"
            ? "Business type: service business website (lead capture + service listings)."
            : businessType === "digital"
              ? "Business type: digital products / software / SaaS." 
              : "Business type: content/community site.";

    const lines = [
      "Create a new store website based on the details below.",
      businessTypeLine,
      storeName.trim()
        ? `Store name: ${storeName.trim()}`
        : "Store name: generate a fitting name.",
      storeDescription.trim()
        ? `Store description: ${storeDescription.trim()}`
        : "Store description: generate one if missing.",
      offerings.trim()
        ? `Offerings / product line: ${offerings.trim()}`
        : "Offerings / product line: generate a reasonable default based on the business type.",
    ];

    if (targetAudience.trim()) lines.push(`Target audience: ${targetAudience.trim()}`);
    if (styleNotes.trim()) lines.push(`Style notes: ${styleNotes.trim()}`);
    if (mustHavePages.trim()) lines.push(`Must-have pages/sections: ${mustHavePages.trim()}`);
    if (extraNotes.trim()) lines.push(`Extra notes: ${extraNotes.trim()}`);

    lines.push(
      "Important: Any internal links used in the Header or Footer must be valid pages on the site (no 404s).",
      "Use internal paths starting with '/'.",
      "If ecommerce: include a '/products' page and product detail routes at '/products/[slug]'.",
      "Always include a homepage and include basic pages like '/about' and '/contact' unless the business type makes them irrelevant.",
    );

    return lines.join("\n");
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const prompt = buildPrompt();
    if (!prompt.trim()) {
      setError("Please fill out the form to generate a store");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/ai/build-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create store");
      }

      const { storeId } = await response.json();
      router.push(`/editor/${storeId}?slug=home`);
    } catch (e) {
      console.error("Store creation error:", e);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  const suggestions = [
    { label: "Handmade jewelry", businessType: "ecommerce" as const, offerings: "Handmade jewelry for young professionals" },
    { label: "Streetwear brand", businessType: "ecommerce" as const, offerings: "Streetwear hoodies, tees, and accessories" },
    { label: "Coffee shop", businessType: "appointments" as const, offerings: "A local coffee shop with seasonal drinks and pastries" },
    { label: "Vintage furniture", businessType: "ecommerce" as const, offerings: "Curated vintage furniture and home decor" },
    { label: "SaaS product", businessType: "digital" as const, offerings: "A software product with pricing tiers and feature pages" }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </div>

        {/* Loading State with Thinking Steps */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                <Wand2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Building your store</h2>
                <p className="text-slate-500 text-sm">This usually takes ~10–20 seconds</p>
              </div>
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              {THINKING_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isActive
                        ? 'bg-blue-50 border-blue-200'
                        : isComplete
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive
                        ? 'bg-blue-600 text-white'
                        : isComplete
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : isComplete ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Create a new store</h1>
                  <p className="text-slate-500">A quick form that tailors the AI-generated site to you.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <form onSubmit={handleCreate} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Store name</label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Leave blank to auto-generate"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Business type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="ecommerce">Ecommerce (sell products)</option>
                      <option value="appointments">Appointments / scheduling</option>
                      <option value="services">Services (lead capture)</option>
                      <option value="digital">Software / SaaS / digital products</option>
                      <option value="content">Content / community</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Short store description (optional)</label>
                  <textarea
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="If you don't have one yet, leave it blank and AI will generate it."
                    className="w-full min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">What are you selling / offering?</label>
                  <textarea
                    value={offerings}
                    onChange={(e) => setOfferings(e.target.value)}
                    placeholder="A few words is enough (e.g. 'handmade silver jewelry', 'coffee & pastries', 'hair salon')."
                    className="w-full min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    disabled={loading}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
                    aria-expanded={advancedOpen}
                  >
                    More details (optional)
                    {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {advancedOpen && (
                    <div className="px-4 pb-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target audience (optional)</label>
                        <input
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g. 'busy professionals', 'new parents', 'local community'"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Style notes (optional)</label>
                        <input
                          value={styleNotes}
                          onChange={(e) => setStyleNotes(e.target.value)}
                          placeholder="e.g. 'minimal, premium, futuristic', 'bright and playful'"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Must-have pages or sections (optional)</label>
                        <input
                          value={mustHavePages}
                          onChange={(e) => setMustHavePages(e.target.value)}
                          placeholder="e.g. 'Pricing', 'Booking', 'FAQ', 'Testimonials'"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Anything else? (optional)</label>
                        <textarea
                          value={extraNotes}
                          onChange={(e) => setExtraNotes(e.target.value)}
                          placeholder="Shipping notes, tone of voice, region/currency, etc."
                          className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate store
                </button>

                <div>
                  <p className="text-sm text-slate-500 mb-2">Quick fill:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setBusinessType(s.businessType);
                          setOfferings(s.offerings);
                          if (!storeName.trim()) setStoreName("");
                        }}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50"
                        disabled={loading}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
    </div>
  );
}
