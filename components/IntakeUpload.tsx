"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { persistSpec } from "@/lib/spec-cache";
import { exampleMeta } from "@/lib/fixtures";
import { photoToJpegFile } from "@/lib/photo-file";
import { SiteHeader } from "@/components/SiteHeader";
import type { CakeSpec } from "@/lib/taxonomy";

export function IntakeUpload(props: { bakeryId: string; bakeryName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(form: FormData) {
    setError(null);
    setBusy("Reading the cake…");
    try {
      const response = await fetch("/api/decompose", { method: "POST", body: form });
      const json: unknown = await response.json();
      const record = json as { spec?: CakeSpec; error?: string };
      if (!response.ok || !record.spec) {
        setBusy(null);
        setError(record.error ?? "Couldn't read the cake.");
        return;
      }
      persistSpec(record.spec);
      router.push(`/intake/${props.bakeryId}/spec/${record.spec.id}`);
    } catch {
      setBusy(null);
      setError("The upload did not return a spec. Check Vercel logs for /api/decompose.");
    }
  }

  return (
    <div>
      <SiteHeader trailing={<span className="data text-[13px]">{props.bakeryName}</span>} />
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-display text-[34px]">Send this bakery a spec</h1>
        <p className="mt-2 text-slate">
          Upload the cake you want. They receive a build sheet instead of a screenshot.
        </p>
        <label className="mt-6 flex cursor-pointer flex-col gap-2 border border-dashed border-hairline p-6">
          Drop a cake photo
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void (async () => {
                try {
                  const jpeg = await photoToJpegFile(file);
                  const form = new FormData();
                  form.set("image", jpeg);
                  await send(form);
                } catch {
                  setError("Couldn't read that photo. Try JPEG or PNG.");
                }
              })();
            }}
          />
        </label>
        <div className="mt-4 flex flex-col gap-2">
          {exampleMeta.map((example) => (
            <button
              key={example.id}
              type="button"
              className="btn btn-quiet justify-start"
              onClick={() => {
                const form = new FormData();
                form.set("example", example.id);
                void send(form);
              }}
            >
              {example.title}
            </button>
          ))}
        </div>
        {busy ? <p className="data mt-3">{busy}</p> : null}
        {error ? <p className="mt-3 text-flag">{error}</p> : null}
      </main>
    </div>
  );
}
