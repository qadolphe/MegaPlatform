import KnowledgeView from "./knowledge-view";

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return <KnowledgeView storeId={storeId} />;
}
