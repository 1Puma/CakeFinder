import "server-only";
import { randomUUID } from "node:crypto";
import { applyMediumConstraints } from "./medium-constraints";
import { hasGrokKey } from "./env";
import { fixtureSpecs } from "./fixtures";
import { describeGrokError, grokJson, type GrokError } from "./grok";
import { ImageConvertError, resizeForVision } from "./image";
import { err, ok, type Result } from "./result";
import { lookupBorderTip, cakeSpecVisionSchema, cakeSpecSchema, type CakeSpec } from "./taxonomy";
import { saveSpec } from "./store/index";
import { decomposePrompt } from "../prompts/decompose";
import { normalizeVisionPayload } from "./normalize-vision";
import { summariesFromVision } from "./summaries";

export type DecomposeError = {
  kind: "empty_image" | "missing_key" | "parse" | "image" | "vision";
  message: string;
};

function hydrateDerivedTips(spec: CakeSpec): CakeSpec {
  return {
    ...spec,
    frosting: spec.frosting ?? { primary: null },
    borders: spec.borders.map((border) => ({
      ...border,
      derivedTip: lookupBorderTip(border.type),
    })),
  };
}

function schemaHint(): string {
  return `{
  "medium": "layered" | "ice_cream",
  "structure": { "tierCount": number, "tiers": [{ "index": number, "shape": string, "approximateDiameterInches": number|null, "approximateHeightInches": number|null, "visualDescription": string, "locator": string }], "estimatedServings": number|null, "supportRequired": boolean },
  "coating": { "style": string, "visualDescription": string, "locator": string } | null,
  "borders": [{ "type": string, "derivedTip": string, "visualDescription": string, "locator": string }],
  "accents": [{ "type": string, "count": number|null, "visualDescription": string, "locator": string }],
  "finishes": [{ "type": string, "visualDescription": string, "locator": string }],
  "toppings": { "kinds": [{ "type": string, "visualDescription": string, "locator": string }], "items": [{ "item": string, "brandNamed": boolean, "count": number|null, "arrangement": string, "visualDescription": string, "locator": string }] },
  "other": [{ "description": string, "locator": string }],
  "confidence": { structure, coating, borders, accents, finishes, toppings },
  "flags": [],
  "editedByUser": false
}`;
}

function grokLog(error: GrokError): string {
  if (error.kind === "http") {
    return `http ${error.status} ${error.body.slice(0, 300)}`;
  }
  if (error.kind === "parse") {
    return `parse ${error.raw.slice(0, 300)}`;
  }
  if (error.kind === "network") {
    return `network ${error.message}`;
  }
  return error.kind;
}

function parseVision(value: unknown) {
  return cakeSpecVisionSchema.parse(normalizeVisionPayload(value));
}

function toCakeSpec(
  vision: ReturnType<typeof cakeSpecVisionSchema.parse>,
  sourceImageUrl: string,
): CakeSpec {
  const withOther = {
    ...vision,
    sourceImageUrl,
    frosting: { primary: null },
    other: vision.other ?? [],
  };
  return cakeSpecSchema.parse({
    ...withOther,
    id: randomUUID(),
    createdAt: new Date(),
    editedByUser: false,
    summaries: summariesFromVision(withOther),
  });
}

export async function decompose(input: {
  imageBuffer: Buffer;
}): Promise<Result<CakeSpec, DecomposeError>> {
  if (input.imageBuffer.byteLength === 0) {
    return err({
      kind: "empty_image",
      message: "Couldn't read the cake — the file is empty. Try a straight-on shot.",
    });
  }

  if (!hasGrokKey()) {
    return err({
      kind: "missing_key",
      message:
        "GROK_API_KEY is not set on Vercel. Add it under Project → Settings → Environment Variables for Production.",
    });
  }

  let resized: Buffer;
  try {
    resized = await resizeForVision(input.imageBuffer);
  } catch (error) {
    const message =
      error instanceof ImageConvertError
        ? error.message
        : "That file is not a photo xAI can read. Use JPEG, PNG, WebP, or GIF.";
    return err({ kind: "image", message });
  }
  const sourceImageUrl = `data:image/jpeg;base64,${resized.toString("base64")}`;

  const prompt = decomposePrompt({
    schema: schemaHint(),
  });
  const parsed = await grokJson(
    {
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: sourceImageUrl, detail: "high" } },
            { type: "text", text: prompt },
          ],
        },
      ],
      jsonMode: false,
      retries: 1,
      timeoutMs: 90_000,
      maxTokens: 4096,
    },
    parseVision,
  );

  if (!parsed.ok) {
    console.error("decompose grok failed", grokLog(parsed.error));
    return err({ kind: "vision", message: describeGrokError(parsed.error) });
  }

  let spec = toCakeSpec(parsed.value, sourceImageUrl);
  spec = hydrateDerivedTips(applyMediumConstraints(spec));
  spec.structure.supportRequired = spec.structure.tierCount > 1;
  await saveSpec(spec);
  return ok(spec);
}

export async function specFromExample(
  exampleId: "tieredFondant" | "licensed" | "iceCream",
): Promise<CakeSpec> {
  const cloned = structuredClone(fixtureSpecs[exampleId]);
  cloned.id = randomUUID();
  cloned.createdAt = new Date();
  cloned.editedByUser = false;
  cloned.frosting = { primary: null };
  cloned.summaries = summariesFromVision(cloned);
  const spec = applyMediumConstraints(hydrateDerivedTips(cloned));
  await saveSpec(spec);
  return spec;
}
