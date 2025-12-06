"use client";

"use client";

import { supabase } from "@repo/database";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleAuth = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const error_description = searchParams.get("error_description");
      
      console.log("Full URL:", window.location.href);
      
      if (error) {
        setStatus(`Error: ${error_description || error}`);
        return;
      }

      if (code) {
        setStatus("Exchanging code for session...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth error:", error);
          setStatus(`Login failed: ${error.message}`);
        } else {
          console.log("Auth success:", data);
          router.push("/");
        }
      } else if (window.location.hash.includes("access_token")) {
         setStatus("Detected implicit flow (hash fragment). Verifying session...");
         // Supabase client should auto-detect this if configured, 
         // but let's check if we have a session.
         const { data: { session } } = await supabase.auth.getSession();
         if (session) {
             router.push("/");
         } else {
             setStatus("Failed to retrieve session from hash.");
         }
      } else {
        setStatus("No auth code or token found in URL.");
        // Check if we are already logged in?
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            router.push("/");
        }
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Login Status</h1>
        <p className="text-gray-500">{status}</p>
        <p className="text-xs text-gray-400 mt-4">Check console for details</p>
      </div>
    </div>
  );
}
