import { NextResponse } from "next/server";
import { cakeSpecSchema } from "@/lib/taxonomy";
import { editSpec } from "@/lib/spec-edit";
import { saveSpec } from "@/lib/store";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const record = body as { spec?: unknown; instruction?: unknown; apply?: unknown };
  if (typeof record.instruction !== "string" || !record.spec) {
    return NextResponse.json(
      { error: "Describe a change, for example: make it two tiers, drop the gold leaf." },
      { status: 400 },
    );
  }
  const spec = cakeSpecSchema.parse(record.spec);
  const edited = await editSpec({ spec, instruction: record.instruction });
  if (!edited.ok) {
    return NextResponse.json({ error: edited.error.message }, { status: 400 });
  }
  if (record.apply === true) {
    await saveSpec(edited.value.spec);
  }
  return NextResponse.json(edited.value);
}
