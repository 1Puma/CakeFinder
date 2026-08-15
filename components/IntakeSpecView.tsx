"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CakeSpec } from "@/lib/taxonomy";
import { specToRequiredFlags } from "@/lib/capability";
import { persistSpec, readPersistedSpec } from "@/lib/spec-cache";
import { SiteHeader } from "@/components/SiteHeader";
import { SpecEditor } from "@/components/SpecEditor";
import { PhotoPanel } from "@/components/PhotoPanel";
import { useMinWidth } from "@/lib/use-min-width";
import type { Decorator } from "@/lib/types";

export function IntakeSpecView(props: {
  bakeryId: string;
  bakeryName: string;
  specId: string;
  bakery: Decorator | null;
}) {
  const [spec, setSpec] = useState<CakeSpec | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tablet = useMinWidth(768);

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
        if (record.spec) {
          persistSpec(record.spec);
          setSpec(record.spec);
        } else {
          setError("Spec not found. Upload a photo on this bakery's intake page.");
        }
      })
      .catch(() => setError("Spec not found. Upload a photo on this bakery's intake page."));
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
        <p className="data">Opening the spec…</p>
      </main>
    );
  }

  const required = specToRequiredFlags(spec);
  const demonstrated = new Set(props.bakery?.capabilities.map((c) => c.flag) ?? []);
  const cannot = required.filter((flag) => !demonstrated.has(flag));

  return (
    <div>
      <SiteHeader trailing={<span className="data text-[13px]">{props.bakeryName}</span>} />
      <div className="grid min-w-0 md:grid-cols-[55%_45%] desk:grid-cols-[60%_40%]">
        <div className="p-4">
          <PhotoPanel spec={spec} activeId={active} />
        </div>
        <div className="p-4">
          {cannot.length > 0 ? (
            <p className="mb-3 border-l-[3px] border-[var(--amber-flag)] bg-card px-3 py-2">
              Cannot fulfill before quoting: {cannot.join(", ")}. Flag this to the bench.
            </p>
          ) : (
            <p className="mb-3">This bakery&apos;s portfolio covers the spec.</p>
          )}
          <SpecEditor
            spec={spec}
            accordion={!tablet}
            activeId={active}
            onSelect={setActive}
            onChange={(next) => {
              persistSpec(next);
              setSpec(next);
            }}
          />
          <Link
            className="btn mt-4 inline-flex"
            href={`/intake/${props.bakeryId}/sheet/${spec.id}`}
          >
            Open build sheet
          </Link>
        </div>
      </div>
    </div>
  );
}
