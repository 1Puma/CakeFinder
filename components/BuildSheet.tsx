import { specPlainLanguage, complexityLabel } from "@/lib/format-spec";
import { lookupBorderTip, type CakeSpec } from "@/lib/taxonomy";
import { CakePhoto } from "@/components/CakePhoto";

export function BuildSheet(props: { spec: CakeSpec; bakeryName: string }) {
  return (
    <article className="mx-auto max-w-3xl bg-icing p-6 print:p-0">
      <header className="mb-6 flex items-end justify-between border-b border-ink pb-3">
        <div>
          <p className="data text-[13px]">{props.bakeryName}</p>
          <h1 className="font-display text-[34px]">Build sheet</h1>
        </div>
        <p className="data text-[13px]">{props.spec.id.slice(0, 8)}</p>
      </header>
      <CakePhoto
        src={props.spec.sourceImageUrl}
        alt="Reference cake"
        className="mb-6 max-h-80 w-full rounded-[var(--radius-image)] bg-icing object-contain"
      />
      <p className="mb-4">{complexityLabel(props.spec)}</p>
      <pre className="whitespace-pre-wrap text-[15px]">{specPlainLanguage(props.spec)}</pre>
      <ul className="mt-4 data text-[13px]">
        {props.spec.piping.borders.map((border, index) => (
          <li key={`${border.type}-${index}`}>
            {border.placement.replaceAll("_", " ")} · {border.type.replaceAll("_", " ")} · TIP{" "}
            {lookupBorderTip(border.type)}
            {border.repeatCount ? ` · ×${border.repeatCount}` : ""}
          </li>
        ))}
      </ul>
    </article>
  );
}
