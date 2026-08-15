"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CakeSpec } from "@/lib/taxonomy";
import { readPersistedSpec } from "@/lib/spec-cache";
import { BuildSheet } from "@/components/BuildSheet";

export function IntakeSheetView(props: { specId: string; bakeryName: string; bakeryId: string }) {
  const [spec, setSpec] = useState<CakeSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const local = readPersistedSpec(props.specId);
    if (local) {
      setSpec(local);
      return;
    }
    void fetch(`/api/spec/${props.specId}`)
      .then(async (res) => {
        const json: unknown = await res.json();
        const record = json as { spec?: CakeSpec; error?: string };
        if (record.spec) setSpec(record.spec);
        else setError(record.error ?? "Build sheet not found. Open the spec from intake.");
      })
      .catch(() => setError("Build sheet not found. Open the spec from intake."));
  }, [props.specId]);
  if (error) {
    return (
      <main className="p-6">
        <p>{error}</p>
        <Link className="btn mt-4 inline-flex" href={`/intake/${props.bakeryId}`}>
          Upload a photo
        </Link>
      </main>
    );
  }
  if (!spec) {
    return (
      <main className="p-6">
        <p className="data">Opening the build sheet…</p>
      </main>
    );
  }
  return <BuildSheet spec={spec} bakeryName={props.bakeryName} />;
}
