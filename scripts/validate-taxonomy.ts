import { cakeSpecSchema } from "../lib/taxonomy";
import { fixtureSpecs } from "../lib/fixtures";
import {
  buildSpecZodSchema,
  buildTaxonomyPromptSection,
  borderTypes,
  nozzleFamilies,
} from "../lib/taxonomy";

const errors: string[] = [];

if (borderTypes.length < 7) {
  errors.push("borders.json must include the seven base morphologies");
}

const petal = nozzleFamilies.find((n) => n.id === "petal");
if (
  !petal?.capabilityFlags.includes("border:ruffle") ||
  !petal.capabilityFlags.includes("surface:sugar_floral")
) {
  errors.push("petal nozzle must map to both ruffle borders and florals");
}

const prompt = buildTaxonomyPromptSection();
if (!prompt.includes("shell") || !prompt.includes("TAXONOMY")) {
  errors.push("taxonomy prompt section is missing core content");
}

const schema = buildSpecZodSchema();
for (const [name, spec] of Object.entries(fixtureSpecs)) {
  const parsed = schema.safeParse(spec);
  if (!parsed.success) {
    errors.push(`${name} fixture failed: ${parsed.error.message}`);
  }
  cakeSpecSchema.parse(spec);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("taxonomy:validate ok");
