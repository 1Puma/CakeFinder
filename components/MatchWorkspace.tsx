"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CakeSpec } from "@/lib/taxonomy";
import type { MatchResult, TraceStep } from "@/lib/types";
import { persistSpec, readMatchCity, readPersistedSpec } from "@/lib/spec-cache";
import { SiteHeader } from "@/components/SiteHeader";
import { AgentTrace } from "@/components/AgentTrace";
import { DecoratorCard } from "@/components/DecoratorCard";
import { SubstitutionPrompt } from "@/components/SubstitutionPrompt";
import { OutreachForm } from "@/components/OutreachForm";
import { acceptSubstitution } from "@/lib/ip";

export function MatchWorkspace(props: { specId: string }) {
  const [spec, setSpec] = useState<CakeSpec | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [contacted, setContacted] = useState<string[]>([]);
  const [declined, setDeclined] = useState(false);

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
        if (record.spec) {
          persistSpec(record.spec);
          setSpec(record.spec);
        } else {
          setError(record.error ?? "Spec not found.");
        }
      })
      .catch(() => setError("Spec not found."));
  }, [props.specId]);

  useEffect(() => {
    if (!spec) return;
    const { city, radiusMiles } = readMatchCity();
    const controller = new AbortController();
    void (async () => {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, city, radiusMiles }),
        signal: controller.signal,
      });
      if (!response.body) {
        setError("Matching did not stream. Try again.");
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.replace(/^data: /, "").trim();
          if (!line) continue;
          const payload = JSON.parse(line) as {
            kind: string;
            step?: TraceStep;
            result?: MatchResult;
            message?: string;
          };
          if (payload.kind === "trace" && payload.step) {
            const step = payload.step;
            setSteps((prev) => [...prev, step]);
          }
          if (payload.kind === "result" && payload.result) {
            setResult(payload.result);
          }
          if (payload.kind === "error") {
            setError(payload.message ?? "Matching stopped.");
          }
        }
      }
    })();
    return () => controller.abort();
  }, [spec]);

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
        <p className="data">Opening matches…</p>
      </main>
    );
  }

  const substitution = !declined ? result?.substitutions[0] : undefined;
  const radius = readMatchCity().radiusMiles;

  return (
    <div>
      <SiteHeader
        trailing={
          <Link className="btn btn-quiet" href={`/spec/${spec.id}`}>
            Back to spec
          </Link>
        }
      />
      <AgentTrace steps={steps} complete={result !== null} compact />
      <div className="space-y-4 p-4 md:p-6">
        {substitution ? (
          <SubstitutionPrompt
            substitution={substitution}
            onDecline={() => setDeclined(true)}
            onAccept={() => {
              const next = acceptSubstitution(spec);
              persistSpec(next);
              setSpec(next);
              setResult(null);
              setSteps([]);
              setDeclined(true);
            }}
          />
        ) : null}
        {result && result.matches.length === 0 ? (
          <p>
            Nothing within {radius} miles covers the rarest requirements. Widen the radius, or drop
            gold leaf / licensed print and search again.
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result?.matches.map((match) => (
            <DecoratorCard
              key={match.decorator.id}
              match={match}
              selected={selected.includes(match.decorator.id)}
              contacted={contacted.includes(match.decorator.id)}
              onToggle={() =>
                setSelected((ids) =>
                  ids.includes(match.decorator.id)
                    ? ids.filter((id) => id !== match.decorator.id)
                    : [...ids, match.decorator.id],
                )
              }
            />
          ))}
        </div>
        {result ? (
          <OutreachForm
            spec={spec}
            decoratorIds={selected}
            onSent={(ids) => setContacted((prev) => [...prev, ...ids])}
          />
        ) : (
          <p className="data">Searching local decorators…</p>
        )}
      </div>
    </div>
  );
}
