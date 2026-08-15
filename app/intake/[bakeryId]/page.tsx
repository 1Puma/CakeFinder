import { listDecorators } from "@/lib/store";
import { getEnv } from "@/lib/env";
import { IntakeUpload } from "@/components/IntakeUpload";

export default async function IntakePage({ params }: { params: Promise<{ bakeryId: string }> }) {
  const { bakeryId } = await params;
  const decorators = await listDecorators(getEnv().DEFAULT_CITY);
  const bakery = decorators.find((d) => d.id === bakeryId);
  const name = bakery?.name ?? "Bakery intake";
  return <IntakeUpload bakeryId={bakeryId} bakeryName={name} />;
}
