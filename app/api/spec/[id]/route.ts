import { NextResponse } from "next/server";
import { cakeSpecSchema } from "@/lib/taxonomy";
import { getSpec, saveSpec } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const spec = await getSpec(id);
  if (!spec) {
    return NextResponse.json(
      { error: "Spec not found on this server. Re-upload or open from the same browser tab." },
      { status: 404 },
    );
  }
  return NextResponse.json({ spec });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body: unknown = await request.json();
  const spec = cakeSpecSchema.parse(body);
  if (spec.id !== id) {
    return NextResponse.json({ error: "Spec id mismatch." }, { status: 400 });
  }
  await saveSpec(spec);
  return NextResponse.json({ spec });
}
