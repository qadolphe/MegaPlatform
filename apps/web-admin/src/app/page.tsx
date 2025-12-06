import { Hero } from "@repo/ui-bricks";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <div className="border p-4 rounded-lg">
        <p className="mb-4 text-sm text-gray-500">Previewing Hero Component:</p>
        <Hero title="Admin Preview Hero" />
      </div>
    </main>
  );
}
