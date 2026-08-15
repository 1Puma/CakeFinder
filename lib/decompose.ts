import "server-only";
import { randomUUID } from "node:crypto";
import { applyMediumConstraints } from "./medium-constraints";
import { hasGrokKey } from "./env";
import { fixtureSpecs } from "./fixtures";
import { grokJson } from "./grok";
import { resizeForVision } from "./image";
import { err, ok, type Result } from "./result";
import { lookupBorderTip, cakeSpecBodySchema, cakeSpecSchema, type CakeSpec } from "./taxonomy";
import { saveSpec } from "./store/index";
import mediumConstraintsJson from "../data/taxonomy/medium-constraints.json";
import { decomposePrompt } from "../prompts/decompose";

export type DecomposeError = {
  kind: "empty_image" | "persist";
  message: string;
};

function hydrateDerivedTips(spec: CakeSpec): CakeSpec {
  return {
    ...spec,
    piping: {
      ...spec.piping,
      borders: spec.piping.borders.map((border) => ({
        ...border,
        derivedTip: lookupBorderTip(border.type),
      })),
    },
  };
}

function sampleSpec(medium: "layered" | "ice_cream", sourceImageUrl: string): CakeSpec {
  const base = medium === "ice_cream" ? fixtureSpecs.iceCream : fixtureSpecs.tieredFondant;
  return {
    ...structuredClone(base),
    id: randomUUID(),
    medium,
    sourceImageUrl,
    createdAt: new Date(),
    editedByUser: false,
  };
}

function schemaHint(): string {
  return `{
  "medium": "layered" | "ice_cream",
  "sourceImageUrl": string,
  "structure": { "tierCount": number, "tiers": [{ "index": number, "shape": string, "approximateDiameterInches": number|null, "approximateHeightInches": number|null, "visualDescription": string, "locator": string }], "estimatedServings": number|null, "supportRequired": boolean },
  "frosting": { "primary": FrostingType, "secondary": FrostingType|null, "colors": ColorRef[] },
  "piping": { "borders": [{ "type": string, "derivedTip": string, "placement": string, "repeatCount": number|null, "colorRef": string, "visualDescription": string, "locator": string }], "surfaceElements": [{ "kind": string, "inferredNozzleFamily": string|null, "ridgeCharacter": string|null, "count": number|null, "colorRef": string, "visualDescription": string, "locator": string }] },
  "decor": { "ediblePrint": { "approximateSizeInches": number|null, "shape": string, "subject": string, "visualDescription": string, "locator": string }|null, "licensedCharacters": LicensedCharacter[], "nonEdibleToppers": string[], "sculptural": SculpturalElement[], "freshFlorals": boolean },
  "finish": { "metallicLeaf": "gold"|"silver"|"none", pearls, sprinkles, edibleGlitter, isomalt, waferPaper, airbrush, drip, marbling, texturedPaletteKnife },
  "confidence": { structure, frosting, piping, decor, finish },
  "flags": [],
  "editedByUser": false
}`;
}

export async function decompose(input: {
  imageBuffer: Buffer;
  medium: "layered" | "ice_cream";
}): Promise<Result<CakeSpec, DecomposeError>> {
  if (input.imageBuffer.byteLength === 0) {
    return err({
      kind: "empty_image",
      message: "Couldn't read the cake — the file is empty. Try a straight-on shot.",
    });
  }

  const resized = await resizeForVision(input.imageBuffer);
  const sourceImageUrl = `data:image/jpeg;base64,${resized.toString("base64")}`;

  let spec: CakeSpec;

  if (!hasGrokKey()) {
    spec = sampleSpec(input.medium, sourceImageUrl);
    spec.flags = [
      ...spec.flags.filter((f) => f.code !== "parse_failure"),
      {
        code: "parse_failure",
        message:
          "GROK_API_KEY is not set, so this is a sample spec. Add the key on the server to read your photo. You can still edit it and find decorators.",
      },
    ];
  } else {
    const prompt = decomposePrompt({
      medium: input.medium,
      mediumConstraints: JSON.stringify(mediumConstraintsJson, null, 2),
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
      (value) => cakeSpecBodySchema.parse(value),
    );

    if (!parsed.ok) {
      const retryPrompt = decomposePrompt({
        medium: input.medium,
        mediumConstraints: JSON.stringify(mediumConstraintsJson, null, 2),
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
        (value) => cakeSpecBodySchema.parse(value),
      );
      if (!retried.ok) {
        spec = sampleSpec(input.medium, sourceImageUrl);
        spec.confidence = {
          structure: 0.2,
          frosting: 0.2,
          piping: 0.2,
          decor: 0.2,
          finish: 0.2,
        };
        spec.flags.push({
          code: "parse_failure",
          message:
            "Couldn't parse the model output into a spec. This is a partial spec you can edit. Try a brighter, straight-on shot.",
        });
      } else {
        spec = cakeSpecSchema.parse({
          ...retried.value,
          id: randomUUID(),
          sourceImageUrl,
          createdAt: new Date(),
          editedByUser: false,
        });
      }
    } else {
      spec = cakeSpecSchema.parse({
        ...parsed.value,
        id: randomUUID(),
        sourceImageUrl,
        createdAt: new Date(),
        editedByUser: false,
      });
    }
  }

  spec.medium = input.medium;
  spec = hydrateDerivedTips(applyMediumConstraints(spec));
  spec.structure.supportRequired =
    spec.structure.tierCount > 1 || spec.structure.tiers.some((t) => t.shape === "sculpted");

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
  const spec = applyMediumConstraints(hydrateDerivedTips(cloned));
  await saveSpec(spec);
  return spec;
}
