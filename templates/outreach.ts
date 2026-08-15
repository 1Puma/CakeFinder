export function outreachSubject(eventDate: string | null): string {
  return `Custom cake inquiry — ${eventDate ?? "date flexible"}`;
}

export function renderOutreachHtml(args: {
  decoratorName: string;
  specPlain: string;
  eventDate: string | null;
  notes: string | null;
  customerName: string;
  customerEmail: string;
}): string {
  const dateLine = args.eventDate ? `I need it by ${args.eventDate}.` : "My date is flexible.";
  const notes = args.notes ? `<p>${escapeHtml(args.notes)}</p>` : "";
  const specHtml = escapeHtml(args.specPlain).replaceAll("\n", "<br/>");
  return `<!doctype html>
<html><body style="font-family:Georgia,serif;color:#1f2d3d;line-height:1.5">
<p>Hi ${escapeHtml(args.decoratorName)},</p>
<p>I'm looking for someone to make this cake and your work looks like a match.</p>
<p><strong>WHAT I'M ASKING FOR</strong><br/>${specHtml}</p>
<p>${escapeHtml(dateLine)}</p>
${notes}
<p>Can you take this on, and what would it cost?</p>
<p>${escapeHtml(args.customerName)}<br/>${escapeHtml(args.customerEmail)}</p>
<p style="color:#5c5346;font-size:12px">This inquiry was sent through CakeMatch, which matched your portfolio to this design. Claim your profile to manage what shows.</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
