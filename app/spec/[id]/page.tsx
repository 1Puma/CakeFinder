import { SpecWorkspace } from "@/components/SpecWorkspace";

export default async function SpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpecWorkspace specId={id} />;
}
