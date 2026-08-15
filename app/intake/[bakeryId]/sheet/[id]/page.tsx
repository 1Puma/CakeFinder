import { listDecorators } from "@/lib/store";
import { getEnv } from "@/lib/env";
import { IntakeSheetView } from "@/components/IntakeSheetView";

export default async function IntakeSheetPage({
  params,
}: {
  params: Promise<{ bakeryId: string; id: string }>;
}) {
  const { bakeryId, id } = await params;
  const decorators = await listDecorators(getEnv().DEFAULT_CITY);
  const bakery = decorators.find((d) => d.id === bakeryId);
  return <IntakeSheetView specId={id} bakeryName={bakery?.name ?? "Bakery"} />;
}
