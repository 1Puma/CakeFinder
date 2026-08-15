import { CakePhoto } from "@/components/CakePhoto";

export function LandingHeroCake() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="overflow-hidden rounded-[var(--radius-image)] bg-icing">
        <CakePhoto
          src="/examples/tiered.svg"
          alt="Three-tier fondant cake with a shell border and edible print"
          className="block h-auto w-full object-contain"
        />
      </div>
      <ul className="space-y-2">
        <li
          className="font-data text-[13px] tracking-[0.02em] text-slate"
          style={{ borderLeft: "3px solid var(--gel-coral)", paddingLeft: 12 }}
        >
          shell border · TIP #32
        </li>
        <li
          className="font-data text-[13px] tracking-[0.02em] text-slate"
          style={{ borderLeft: "3px solid var(--gel-marigold)", paddingLeft: 12 }}
        >
          fondant over buttercream
        </li>
        <li
          className="font-data text-[13px] tracking-[0.02em] text-slate"
          style={{ borderLeft: "3px solid var(--gel-lilac)", paddingLeft: 12 }}
        >
          edible print · 6&quot; round
        </li>
      </ul>
    </div>
  );
}
