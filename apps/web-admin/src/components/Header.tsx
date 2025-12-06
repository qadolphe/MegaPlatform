"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/database";
import { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
