"use client";
import { useState } from "react";
import { supabase } from "@repo/database";

export default function CreateStore() {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");

  const handleCreate = async () => {
    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return alert("You must be logged in!");

    // 2. Create the Store
    const { data: store, error } = await supabase
      .from("stores")
      .insert({ name, subdomain, owner_id: user.id })
      .select()
      .single();

    if (error) return alert(error.message);

    // 2. Create the default "Home" page with a default Hero
    const defaultLayout = [
      {
        type: "Hero",
        props: { title: `Welcome to ${name}!` }
      }
    ];

    await supabase.from("store_pages").insert({
      store_id: store.id,
      slug: "home",
      layout_config: defaultLayout,
      published: true
    });

    alert("Store created!");
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md">
      <h1 className="text-2xl font-bold">Create a Store</h1>
      <input 
        placeholder="Store Name" 
        className="border p-2" 
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        placeholder="Subdomain (e.g. bob-hoodies)" 
        className="border p-2" 
        onChange={(e) => setSubdomain(e.target.value)} 
      />
      <button 
        onClick={handleCreate}
        className="bg-black text-white p-2 rounded"
      >
        Launch Store
      </button>
    </div>
  );
}
