"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { persistMatchCity, persistSpec } from "@/lib/spec-cache";
import { exampleMeta } from "@/lib/fixtures";
import { photoToJpegFile } from "@/lib/photo-file";
import type { CakeSpec } from "@/lib/taxonomy";

export function UploadDropzone() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(form: FormData) {
    setError(null);
    setBusy("Reading the cake…");
    persistMatchCity("Austin, TX", 15);
    let json: unknown;
    try {
      const response = await fetch("/api/decompose", { method: "POST", body: form });
      json = await response.json();
      const record = json as { spec?: CakeSpec; error?: string };
      if (!response.ok || !record.spec) {
        setBusy(null);
        setError(record.error ?? "Couldn't read the cake.");
        return;
      }
      persistSpec(record.spec);
      router.push(`/spec/${record.spec.id}`);
    } catch {
      setBusy(null);
      setError("The upload did not return a spec. Check Vercel logs for /api/decompose.");
    }
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <label className="flex cursor-pointer flex-col items-start gap-2 border border-dashed border-hairline bg-card p-6">
        <span className="font-medium">Drop a cake photo</span>
        <span className="text-slate">
          Pinterest screenshots work fine. Camera capture is available on phones.
        </span>
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
