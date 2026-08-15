"use client";

import { useEffect, useState } from "react";
import type { CakeSpec } from "@/lib/taxonomy";
import { readPersistedSpec } from "@/lib/spec-cache";
import { BuildSheet } from "@/components/BuildSheet";

export function IntakeSheetView(props: { specId: string; bakeryName: string }) {
  const [spec, setSpec] = useState<CakeSpec | null>(null);
  useEffect(() => {
    const local = readPersistedSpec(props.specId);
    if (local) {
      setSpec(local);
      return;
    }
    void fetch(`/api/spec/${props.specId}`)
      .then(async (res) => {
        const json: unknown = await res.json();
        const record = json as { spec?: CakeSpec };
        if (record.spec) setSpec(record.spec);
      })
      .catch(() => undefined);
  }, [props.specId]);
  if (!spec) {
    return (
      <main className="p-6">
        <p className="data">Opening the build sheet…</p>
      </main>
    );
  }
  return <BuildSheet spec={spec} bakeryName={props.bakeryName} />;
}
