"use client";
import { supabase } from "@repo/database";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Magic Link Login (Simplest for MVP)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
    else alert("Check your email for the magic link!");
  };

  return (
    <div className="flex flex-col gap-4 p-10 max-w-md mx-auto mt-20 border rounded">
      <h1 className="text-2xl font-bold">Platform Login</h1>
      <input
        className="border p-2"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-black text-white p-2">
        Send Magic Link
      </button>
    </div>
  );
}
