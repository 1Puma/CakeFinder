import { CakePhoto } from "@/components/CakePhoto";

const specLines = [
  { rule: "var(--acc-accents)", text: "Dollops · piped tops" },
  { rule: "var(--acc-finishes)", text: "Drips · ganache" },
  { rule: "var(--acc-toppings)", text: "Toppings · Oreo, halved, 12 pieces" },
  { rule: "var(--acc-borders)", text: "Shell border · TIP #32" },
];

export function HeroVisual() {
  return (
    <div>
      <div className="overflow-hidden rounded-[var(--r-image)] bg-card shadow-[var(--shadow-card)]">
        <CakePhoto
          src="/hero-cake.jpg"
          alt="Round cake with ganache drips, Oreo toppings, and a shell border"
          className="block h-auto w-full object-cover"
        />
      </div>
      <ul className="mt-6 space-y-3">
        {specLines.map((line) => (
          <li
            key={line.text}
            className="font-data text-[13px] tracking-[0.02em] text-ink-soft"
            style={{ borderLeft: `3px solid ${line.rule}`, paddingLeft: "var(--space-3)" }}
          >
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
