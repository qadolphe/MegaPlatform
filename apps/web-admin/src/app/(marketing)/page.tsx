import Link from "next/link";
import { ArrowRight, Check, Code } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg">S</span>
            </div>
            SwatBloc
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm bg-white text-slate-950 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                The E-commerce Infrastructure for Developers
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Build a store in <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  5 lines of code.
                </span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                SwatBloc gives you a complete e-commerce backend with a typed SDK. 
                Focus on your frontend, we handle the boring stuff.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  href="/docs" 
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Read Documentation
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-8 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Free until production</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Fully Typed SDK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Next.js Ready</span>
                </div>
              </div>
            </div>

            {/* Right Code Snippet */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="ml-4 text-xs text-slate-500 font-mono">store.ts</div>
                </div>
                
                <pre className="font-mono text-sm overflow-x-auto">
                  <code className="text-blue-300">import</code> <code className="text-white">{"{ SwatBloc }"}</code> <code className="text-blue-300">from</code> <code className="text-green-300">'@swatbloc/sdk'</code>
                  <br/><br/>
                  <code className="text-slate-400">// Initialize the client</code>
                  <br/>
                  <code className="text-blue-300">const</code> <code className="text-white">store</code> <code className="text-blue-300">=</code> <code className="text-blue-300">new</code> <code className="text-yellow-300">SwatBloc</code><code className="text-white">({`{`}</code>
                  <br/>
                  <code className="text-white">  apiKey: </code><code className="text-green-300">'sb_live_123...'</code>
                  <br/>
                  <code className="text-white">{`}`})</code>
                  <br/><br/>
                  <code className="text-slate-400">// Create a checkout session</code>
                  <br/>
                  <code className="text-blue-300">const</code> <code className="text-white">cart</code> <code className="text-blue-300">=</code> <code className="text-blue-300">await</code> <code className="text-white">store.cart.</code><code className="text-yellow-300">create</code><code className="text-white">([</code>
                  <br/>
                  <code className="text-white">  {`{`} productId: </code><code className="text-green-300">'prod_123'</code><code className="text-white">, quantity: </code><code className="text-orange-300">1</code> <code className="text-white">{`}`}</code>
                  <br/>
                  <code className="text-white">])</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
