import { NextResponse } from "next/server";
import { decompose, specFromExample } from "@/lib/decompose";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const example = form.get("example");
  if (
    typeof example === "string" &&
    (example === "tieredFondant" || example === "licensed" || example === "iceCream")
  ) {
    const spec = await specFromExample(example);
    return NextResponse.json({ spec });
  }

  const mediumRaw = form.get("medium");
  const medium = mediumRaw === "ice_cream" ? "ice_cream" : "layered";
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Drop a cake photo. Pinterest screenshots work fine." },
      { status: 400 },
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await decompose({ imageBuffer: buffer, medium });
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json({ spec: result.value });
}
