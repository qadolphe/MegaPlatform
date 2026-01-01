"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";

export default function CreateStore() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!prompt.trim()) {
      setError("Please describe what you want to sell");
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

      const { storeId, storeName } = await response.json();

      // Redirect to editor
      router.push(`/editor/${storeId}?slug=home`);
    } catch (e) {
      console.error("Store creation error:", e);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  const suggestions = [
    "I want to sell handmade jewelry",
    "Create a streetwear clothing store",
    "Build a gourmet coffee shop",
    "Start a vintage furniture store",
    "Launch a plant and garden shop"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link href="/" className="flex items-center text-purple-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-6 shadow-lg shadow-purple-500/30">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What do you want to sell?
          </h1>
          <p className="text-purple-200 text-lg">
            Describe your vision and we'll build your entire store in seconds
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="I want to sell handmade jewelry for young professionals..."
              className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
              disabled={loading}
            />

            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !prompt.trim()}
            className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building your store with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Build My Store
              </>
            )}
          </button>

          <div className="mt-8">
            <p className="text-purple-300/60 text-sm mb-3">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-purple-200 text-sm transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-purple-300/40 text-sm mt-8">
          AI will generate your store name, products, theme, and complete homepage
        </p>
      </div>
    </div>
  );
}
