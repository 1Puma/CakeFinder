import { MatchWorkspace } from "@/components/MatchWorkspace";

export default async function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchWorkspace specId={id} />;
}
