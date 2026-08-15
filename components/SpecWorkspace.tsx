"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CakeSpec } from "@/lib/taxonomy";
import type { ChangeDescription } from "@/lib/types";
import Link from "next/link";
import { persistSpec, readPersistedSpec, persistMatchCity, readMatchCity } from "@/lib/spec-cache";
import { ExplodedView } from "@/components/ExplodedView";
import { SpecEditor } from "@/components/SpecEditor";
import { NlEditForm } from "@/components/NlEditForm";
import { ChangeDiff } from "@/components/ChangeDiff";
import { SiteHeader } from "@/components/SiteHeader";
import { MediumToggle } from "@/components/MediumToggle";
import { lookupBorderTip } from "@/lib/taxonomy";
import { applyMediumConstraints } from "@/lib/medium-constraints";

export function SpecWorkspace(props: { specId: string }) {
  const router = useRouter();
  const [spec, setSpec] = useState<CakeSpec | null>(null);
  const [pending, setPending] = useState<{ spec: CakeSpec; changes: ChangeDescription[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [city, setCity] = useState("Austin, TX");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const local = readPersistedSpec(props.specId);
    if (local) {
      setSpec(local);
      const saved = readMatchCity();
      setCity(saved.city);
      return;
    }
    void fetch(`/api/spec/${props.specId}`)
      .then(async (res) => {
        const json: unknown = await res.json();
        const record = json as { spec?: CakeSpec; error?: string };
        if (!res.ok || !record.spec) {
          setError(record.error ?? "Spec not found. Start from a photo on the home page.");
          return;
        }
        persistSpec(record.spec);
        setSpec(record.spec);
      })
      .catch(() => setError("Spec not found. Start from a photo on the home page."));
  }, [props.specId]);

  function commit(next: CakeSpec) {
    const hydrated: CakeSpec = {
      ...next,
      piping: {
        ...next.piping,
        borders: next.piping.borders.map((b) => ({ ...b, derivedTip: lookupBorderTip(b.type) })),
      },
    };
    setSpec(hydrated);
    persistSpec(hydrated);
    setDirty(true);
    void fetch(`/api/spec/${hydrated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hydrated),
    });
  }

  if (error) {
    return (
      <main className="p-6">
        <p>{error}</p>
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

  return (
    <div className="min-h-screen">
      <SiteHeader
        trailing={
          <>
            <MediumToggle
              value={spec.medium}
              onChange={(medium) => commit(applyMediumConstraints({ ...spec, medium }))}
            />
            <Link className="btn btn-quiet" href="/">
              New
            </Link>
          </>
        }
      />
      <div className="grid lg:grid-cols-[60%_40%]">
        <div className="p-4 md:p-6">
          <ExplodedView spec={spec} activeId={active} onSelect={setActive} />
        </div>
        <div className="border-t border-ink lg:border-l lg:border-t-0">
          <div className="p-4">
            <p className="data mb-3 text-[13px]">Spec</p>
            {spec.flags.map((flag) => (
              <p key={flag.code + flag.message} className="mb-3 text-[13px] text-flag">
                {flag.message}
              </p>
            ))}
            <SpecEditor spec={spec} onChange={commit} accordion />
            {pending ? (
              <div className="mt-3">
                <ChangeDiff
                  changes={pending.changes}
                  onConfirm={() => {
                    commit(pending.spec);
                    setPending(null);
                  }}
                  onCancel={() => setPending(null)}
                />
              </div>
            ) : null}
          </div>
          <NlEditForm
            onSubmit={async (instruction) => {
              const response = await fetch("/api/spec-edit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spec, instruction, apply: false }),
              });
              const json: unknown = await response.json();
              const record = json as {
                spec?: CakeSpec;
                changes?: ChangeDescription[];
                error?: string;
              };
              if (!response.ok || !record.spec || !record.changes) {
                setError(record.error ?? "Could not apply that edit.");
                return;
              }
              if (record.changes.length === 0) {
                setError("Nothing in the spec matched that instruction. Try naming a field.");
                return;
              }
              setError(null);
              setPending({ spec: record.spec, changes: record.changes });
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-ink px-4 py-3">
        <label className="flex min-h-11 items-center gap-2">
          City
          <input
            className="min-h-11 border border-ink bg-icing px-3"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        {dirty ? (
          <p className="text-[13px]">Spec changed — find decorators again when you are ready.</p>
        ) : null}
        <button
          type="button"
          className="btn ml-auto"
          onClick={() => {
            persistMatchCity(city, 15);
            persistSpec(spec);
            router.push(`/matches/${spec.id}`);
          }}
        >
          Find decorators
        </button>
      </div>
    </div>
  );
}
