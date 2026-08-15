import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroScroll } from "@/components/HeroScroll";
import { UploadDropzone } from "@/components/UploadDropzone";

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <HeroScroll />
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
        <UploadDropzone />
      </section>
      <section className="mx-auto grid max-w-[1200px] gap-6 px-4 py-10 md:px-6 md:grid-cols-3">
        <div className="card p-8">
          <h2 className="font-display text-xl">What we read from the photo</h2>
          <p className="mt-2 text-ink-soft">
            Coating, borders, piped accents, glazes, and toppings — named in decorator language.
          </p>
        </div>
        <div className="card p-8">
          <h2 className="font-display text-xl">What you choose</h2>
          <p className="mt-2 text-ink-soft">
            Frosting type cannot be seen in a photograph. You pick it. The spec stays honest.
          </p>
        </div>
        <div className="card p-8">
          <h2 className="font-display text-xl">Who we find</h2>
          <p className="mt-2 text-ink-soft">
            Local decorators whose portfolios show the same techniques, ranked by evidence.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
        <div className="card p-8 md:p-10">
          <h2 className="font-display text-[34px]">For bakeries</h2>
          <p className="mt-3 max-w-xl">
            Stop receiving screenshots. Start receiving specs. Same engine, on your intake link.
          </p>
          <Link className="btn mt-6 inline-flex" href="/intake/frost-circle">
            Open bakery intake
          </Link>
        </div>
      </section>
    </div>
  );
}
