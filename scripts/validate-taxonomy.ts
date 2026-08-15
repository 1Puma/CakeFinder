import { cakeSpecSchema } from "../lib/taxonomy";
import { fixtureSpecs } from "../lib/fixtures";
import { buildSpecZodSchema, buildTaxonomyPromptSection, borderChoices } from "../lib/taxonomy";

const errors: string[] = [];

if (borderChoices.length !== 5) {
  errors.push("borders.json must include the five border choices");
}

const shell = borderChoices.find((b) => b.id === "shell");
if (shell?.derivedTip !== "#32") {
  errors.push("shell border must derive tip #32");
}

const prompt = buildTaxonomyPromptSection();
if (
  !prompt.includes("shell") ||
  !prompt.includes("TAXONOMY") ||
  prompt.toLowerCase().includes("nozzle")
) {
  errors.push("taxonomy prompt section is missing core content or still mentions nozzles");
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
