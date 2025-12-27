"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Mail, ArrowRight, Loader2, CheckCircle2, Sparkles, Zap, Shield } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setIsRedirecting(true);
      router.push(`/auth/callback?code=${code}`);
    }
  }, [searchParams, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto relative" />
          </div>
          <p className="mt-6 text-slate-300 font-medium">Completing sign in...</p>
        </div>
      </div>
    );
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    
    setLoading(false);
    
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Store className="h-7 w-7" />
            </div>
            <span className="text-3xl font-bold text-white">SwatBloc</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Build beautiful stores in minutes
          </h1>
          <p className="text-lg text-slate-400 mb-12">
            The all-in-one platform to create, customize, and scale your e-commerce business.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">AI-Powered Editor</h3>
                <p className="text-slate-400 text-sm">
                  Use natural language to design and customize your storefront instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/20">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
                <p className="text-slate-400 text-sm">
                  Optimized for speed with global CDN delivery and edge functions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Secure Payments</h3>
                <p className="text-slate-400 text-sm">
                  Built-in Stripe integration with automatic split payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-white">SwatBloc</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back
              </h2>
              <p className="text-slate-400">
                Sign in to manage your stores
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-800/50 text-slate-400">or</span>
                </div>
              </div>

              {sent ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 mb-1">Check your email</h3>
                      <p className="text-sm text-slate-300">
                        We sent a magic link to <span className="font-semibold text-white">{email}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Use a different email →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign in with Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
