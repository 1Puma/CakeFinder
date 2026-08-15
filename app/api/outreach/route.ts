import { NextResponse } from "next/server";
import { cakeSpecSchema } from "@/lib/taxonomy";
import { sendOutreach } from "@/lib/outreach";
import { listDecorators } from "@/lib/store";
import { getEnv } from "@/lib/env";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const record = body as {
    spec?: unknown;
    decoratorIds?: string[];
    customerEmail?: string;
    customerName?: string;
    eventDate?: string | null;
    notes?: string | null;
    messageOverride?: string;
    city?: string;
  };
  if (
    !record.spec ||
    !Array.isArray(record.decoratorIds) ||
    !record.customerEmail ||
    !record.customerName
  ) {
    return NextResponse.json(
      { error: "Add your name, email, and at least one decorator before sending." },
      { status: 400 },
    );
  }
  const spec = cakeSpecSchema.parse(record.spec);
  const city = record.city ?? getEnv().DEFAULT_CITY;
  const pool = await listDecorators(city);
  const decorators = pool.filter((d) => record.decoratorIds?.includes(d.id));
  const result = await sendOutreach({
    spec,
    decorators,
    customerEmail: record.customerEmail,
    customerName: record.customerName,
    eventDate: record.eventDate ?? null,
    notes: record.notes ?? null,
    messageOverride: record.messageOverride,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json(result.value);
}
