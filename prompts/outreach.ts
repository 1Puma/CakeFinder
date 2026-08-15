export function outreachPrompt(args: {
  decoratorName: string;
  specPlain: string;
  eventDate: string | null;
  notes: string | null;
  customerName: string;
}): string {
  return `Write a short cake inquiry email body, no subject line.
Voice: plain, specific, decorator-literate. No marketing adjectives.
Decorator: ${args.decoratorName}
Customer: ${args.customerName}
Event date: ${args.eventDate ?? "flexible"}
Notes: ${args.notes ?? "none"}
Spec:
${args.specPlain}

Ask if they can take it on and what it would cost. Do not invent a price.`;
}
