"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { persistMatchCity, persistSpec } from "@/lib/spec-cache";
import { exampleMeta } from "@/lib/fixtures";
import { MediumToggle } from "@/components/MediumToggle";
import type { CakeSpec } from "@/lib/taxonomy";

export function UploadDropzone() {
  const router = useRouter();
  const [medium, setMedium] = useState<"layered" | "ice_cream">("layered");
  const [city, setCity] = useState("Austin, TX");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(form: FormData) {
    setError(null);
    setBusy("Reading the cake…");
    persistMatchCity(city, 15);
    const response = await fetch("/api/decompose", { method: "POST", body: form });
    const json: unknown = await response.json();
    const record = json as { spec?: CakeSpec; error?: string };
    if (!response.ok || !record.spec) {
      setBusy(null);
      setError(record.error ?? "Couldn't read the cake. Try a brighter, straight-on shot.");
      return;
    }
    persistSpec(record.spec);
    router.push(`/spec/${record.spec.id}`);
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <MediumToggle value={medium} onChange={setMedium} />
      <label className="flex min-h-11 items-center gap-2">
        <span className="data text-[13px]">City</span>
        <input
          className="min-h-11 flex-1 border border-ink bg-icing px-3"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="City"
        />
      </label>
      <label className="flex cursor-pointer flex-col items-start gap-2 border border-dashed border-ink bg-icing p-6">
        <span className="font-medium">Drop a cake photo</span>
        <span className="text-slate">
          Pinterest screenshots work fine. Camera capture is available on phones.
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.set("image", file);
            form.set("medium", medium);
            void send(form);
          }}
        />
      </label>
      <p className="text-slate">or browse examples</p>
      <div className="flex flex-col gap-2">
        {exampleMeta.map((example) => (
          <button
            key={example.id}
            type="button"
            className="btn btn-quiet w-full justify-start text-left"
            disabled={busy !== null}
            onClick={() => {
              const form = new FormData();
              form.set("example", example.id);
              void send(form);
            }}
          >
            <span>
              <span className="font-medium">{example.title}</span>
              <span className="block text-[13px] text-slate">{example.blurb}</span>
            </span>
          </button>
        ))}
      </div>
      {busy ? <p className="data text-[13px]">{busy}</p> : null}
      {error ? <p className="text-flag">{error}</p> : null}
    </div>
  );
}
