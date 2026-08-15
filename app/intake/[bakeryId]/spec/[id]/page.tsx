import { listDecorators } from "@/lib/store";
import { getEnv } from "@/lib/env";
import { IntakeSpecView } from "@/components/IntakeSpecView";

export default async function IntakeSpecPage({
  params,
}: {
  params: Promise<{ bakeryId: string; id: string }>;
}) {
  const { bakeryId, id } = await params;
  const decorators = await listDecorators(getEnv().DEFAULT_CITY);
  const bakery = decorators.find((d) => d.id === bakeryId) ?? null;
  return (
    <IntakeSpecView
      bakeryId={bakeryId}
      bakeryName={bakery?.name ?? "Bakery"}
      specId={id}
      bakery={bakery}
    />
  );
}
