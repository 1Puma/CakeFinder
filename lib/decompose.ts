import "server-only";
import { randomUUID } from "node:crypto";
import { applyMediumConstraints } from "./medium-constraints";
import { hasGrokKey } from "./env";
import { fixtureSpecs } from "./fixtures";
import { grokJson } from "./grok";
import { resizeForVision } from "./image";
import { err, ok, type Result } from "./result";
import { lookupBorderTip, cakeSpecVisionSchema, cakeSpecSchema, type CakeSpec } from "./taxonomy";
import { saveSpec } from "./store/index";
import { decomposePrompt } from "../prompts/decompose";
import { normalizeVisionPayload } from "./normalize-vision";
import { summariesFromVision } from "./summaries";

export type DecomposeError = {
  kind: "empty_image" | "missing_key" | "parse";
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
  "sourceImageUrl": string,
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
        "Live photo reading needs GROK_API_KEY on the server. Open an example cake, or add the key and try this photo again.",
    });
  }

  const resized = await resizeForVision(input.imageBuffer);
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
            { type: "image_url", image_url: { url: sourceImageUrl } },
            { type: "text", text: prompt },
          ],
        },
      ],
    },
    parseVision,
  );

  let vision = parsed.ok ? parsed.value : null;
  if (!parsed.ok) {
    const retryPrompt = decomposePrompt({
      schema: schemaHint(),
      retryError: parsed.error.kind === "parse" ? parsed.error.raw : parsed.error.kind,
    });
    const retried = await grokJson(
      {
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: sourceImageUrl } },
              { type: "text", text: retryPrompt },
            ],
          },
        ],
      },
      parseVision,
    );
    if (!retried.ok) {
      return err({
        kind: "parse",
        message:
          "Couldn't turn this photo into a spec. Try a brighter, straight-on shot of the whole cake.",
      });
    }
    vision = retried.value;
  }

  if (!vision) {
    return err({
      kind: "parse",
      message:
        "Couldn't turn this photo into a spec. Try a brighter, straight-on shot of the whole cake.",
    });
  }

  let spec = toCakeSpec(vision, sourceImageUrl);
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
