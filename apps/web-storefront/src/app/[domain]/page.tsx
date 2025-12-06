import { Hero } from "@repo/ui-bricks";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  return (
    <main>
      <Hero title={`Welcome to ${domain}`} />
      <div className="container mx-auto p-8">
        <p>This is a dynamically generated storefront for: {domain}</p>
      </div>
    </main>
  );
}
