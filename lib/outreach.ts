import { Resend } from "resend";
import { getEnv } from "./env";
import { specPlainLanguage } from "./format-spec";
import { err, ok, type Result } from "./result";
import { recordOutreach } from "./store/index";
import type { CakeSpec } from "./taxonomy";
import type { Decorator } from "./types";
import { renderOutreachHtml, outreachSubject } from "../templates/outreach";

export type OutreachInput = {
  spec: CakeSpec;
  decorators: Decorator[];
  customerEmail: string;
  customerName: string;
  eventDate: string | null;
  notes: string | null;
  messageOverride?: string;
};

export async function sendOutreach(
  input: OutreachInput,
): Promise<
  Result<{ sent: string[]; failed: string[] }, { kind: "limit" | "missing_from"; message: string }>
> {
  if (input.decorators.length > 5) {
    return err({
      kind: "limit",
      message: "Send to at most 5 decorators at a time.",
    });
  }
  const env = getEnv();
  const from = env.OUTREACH_FROM_ADDRESS;
  if (!from) {
    return err({
      kind: "missing_from",
      message: "OUTREACH_FROM_ADDRESS is not set. Add a verified sender, then send again.",
    });
  }

  const sent: string[] = [];
  const failed: string[] = [];
  const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
  const specPlain = specPlainLanguage(input.spec);

  for (const decorator of input.decorators) {
    const to = env.OUTREACH_TO_OVERRIDE || decorator.email;
    if (!to) {
      failed.push(decorator.id);
      continue;
    }
    const html =
      input.messageOverride ??
      renderOutreachHtml({
        decoratorName: decorator.name,
        specPlain,
        eventDate: input.eventDate,
        notes: input.notes,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
      });
    const subject = outreachSubject(input.eventDate);
    if (!resend) {
      console.info("outreach dry-run", { to, subject, decorator: decorator.name });
      await recordOutreach({
        id: crypto.randomUUID(),
        specId: input.spec.id,
        decoratorId: decorator.id,
        toEmail: to,
        status: "dry-run",
      });
      sent.push(decorator.id);
      continue;
    }
    const result = await resend.emails.send({
      from,
      to,
      replyTo: input.customerEmail,
      subject,
      html,
    });
    if (result.error) {
      console.error("resend failed", result.error);
      failed.push(decorator.id);
      await recordOutreach({
        id: crypto.randomUUID(),
        specId: input.spec.id,
        decoratorId: decorator.id,
        toEmail: to,
        status: "failed",
      });
      continue;
    }
    await recordOutreach({
      id: crypto.randomUUID(),
      specId: input.spec.id,
      decoratorId: decorator.id,
      toEmail: to,
      status: "sent",
    });
    sent.push(decorator.id);
  }

  return ok({ sent, failed });
}
