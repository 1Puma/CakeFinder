"use client";

import type { CakeSpec } from "@/lib/taxonomy";
import { AnalysisCard } from "@/components/spec/AnalysisCard";

export function SpecEditor(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  accordion: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return <AnalysisCard spec={props.spec} onChange={props.onChange} onSelect={props.onSelect} />;
}
