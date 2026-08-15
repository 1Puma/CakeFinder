import { NextResponse } from "next/server";
import { decompose, specFromExample } from "@/lib/decompose";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Drop a cake photo. Pinterest screenshots work fine." },
      { status: 400 },
    );
  }
  const example = form.get("example");
  if (
    typeof example === "string" &&
    (example === "tieredFondant" || example === "licensed" || example === "iceCream")
  ) {
    const spec = await specFromExample(example);
    return NextResponse.json({ spec });
  }

  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Drop a cake photo. Pinterest screenshots work fine." },
      { status: 400 },
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await decompose({ imageBuffer: buffer });
  if (!result.ok) {
    const status = result.error.kind === "missing_key" ? 503 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }
  return NextResponse.json({ spec: result.value });
}
