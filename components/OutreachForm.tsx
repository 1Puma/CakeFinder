"use client";

import { useState } from "react";
import type { CakeSpec } from "@/lib/taxonomy";
import { specPlainLanguage } from "@/lib/format-spec";
import { readMatchCity } from "@/lib/spec-cache";

export function OutreachForm(props: {
  spec: CakeSpec;
  decoratorIds: string[];
  onSent: (ids: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const draft = specPlainLanguage(props.spec);

  return (
    <form
      className="max-w-xl space-y-3 border border-hairline bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (props.decoratorIds.length === 0) {
          setStatus("Select at least one decorator.");
          return;
        }
        void (async () => {
          const city = readMatchCity().city;
          const response = await fetch("/api/outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spec: props.spec,
              decoratorIds: props.decoratorIds,
              customerName: name,
              customerEmail: email,
              eventDate: date || null,
              notes: notes || null,
              city,
            }),
          });
          const json: unknown = await response.json();
          const record = json as { sent?: string[]; failed?: string[]; error?: string };
          if (!response.ok) {
            setStatus(record.error ?? "Send failed.");
            return;
          }
          props.onSent(record.sent ?? []);
          setStatus(
            `Sent ${record.sent?.length ?? 0}. Failed ${record.failed?.length ?? 0}. ${
              record.sent?.length ? "Check the override inbox if RESEND is in demo mode." : ""
            }`,
          );
        })();
      }}
    >
      <h2 className="font-display text-2xl">Send inquiry</h2>
      <p className="text-[13px] text-slate">
        You are the sender. Reply-to is your email. Review the spec before it goes.
      </p>
      <label className="block">
        Name
        <input
          required
          className="spec-select mt-1 min-h-11 w-full px-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block">
        Email
        <input
          required
          type="email"
          className="spec-select mt-1 min-h-11 w-full px-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        Event date
        <input
          className="spec-select mt-1 min-h-11 w-full px-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="block">
        Notes
        <textarea
          className="spec-select mt-1 min-h-24 w-full px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <pre className="overflow-auto whitespace-pre-wrap border border-hairline bg-card p-3 text-[13px]">
        {draft}
      </pre>
      <button type="submit" className="btn">
        Send
      </button>
      {status ? <p>{status}</p> : null}
    </form>
  );
}
