import { cakeSpecSchema } from "@/lib/taxonomy";
import { matchDecorators } from "@/lib/agent/match-agent";
import { encodeSse } from "@/lib/agent/trace";
import { getEnv } from "@/lib/env";
import { saveMatchResult, saveSpec } from "@/lib/store";
import type { TraceStep } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const record = body as { spec?: unknown; city?: string; radiusMiles?: number };
  const spec = cakeSpecSchema.parse(record.spec);
  await saveSpec(spec);
  const env = getEnv();
  const city = record.city?.trim() || env.DEFAULT_CITY;
  const radiusMiles = record.radiusMiles ?? env.DEFAULT_RADIUS_MILES;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (step: TraceStep) => {
        controller.enqueue(encoder.encode(encodeSse({ kind: "trace", step })));
      };
      try {
        const result = await matchDecorators({ spec, city, radiusMiles, onTrace: send });
        await saveMatchResult(spec.id, result);
        controller.enqueue(encoder.encode(encodeSse({ kind: "result", result })));
      } catch (error) {
        console.error("match failed", error);
        controller.enqueue(
          encoder.encode(
            encodeSse({
              kind: "error",
              message: "Matching stopped before it finished. Try Austin, TX, or widen the radius.",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
