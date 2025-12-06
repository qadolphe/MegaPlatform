"use client";

import { useParams } from "next/navigation";

export default function EditorPage() {
  const params = useParams();
  const { storeId } = params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Visual Editor</h1>
      <p className="text-gray-600">Editing Store ID: {storeId}</p>
      <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Canvas Placeholder (Coming Soon)</p>
      </div>
    </div>
  );
}
