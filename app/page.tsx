import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LandingHeroCake } from "@/components/LandingHeroCake";
import { UploadDropzone } from "@/components/UploadDropzone";
import { SpecimenGrid } from "@/components/SpecimenGrid";

export default function HomePage() {
  return (
    <div>
      <SiteHeader
        trailing={
          <a className="min-h-11 px-3 py-3" href="#specimens">
            How it works
          </a>
        }
      />
      <section className="grid items-start gap-10 px-4 py-10 md:px-6 md:py-16 desk:grid-cols-2">
        <LandingHeroCake />
        <div>
          <h1 className="max-w-xl font-display text-[34px] leading-tight text-ink desk:text-[52px]">
            Every custom cake order starts with a screenshot and a guess.
          </h1>
          <p className="mt-4 max-w-md text-[18px]">
            Upload the photo. Get the spec. Find who can build it.
          </p>
          <div className="mt-6 max-w-lg">
            <UploadDropzone />
          </div>
        </div>
      </section>
      <div id="specimens">
        <SpecimenGrid />
      </div>
      <section className="border-t border-ink px-4 py-10 md:px-6">
        <h2 className="font-display text-[34px]">For bakeries</h2>
        <p className="mt-3 max-w-xl">
          Stop receiving screenshots. Start receiving specs. Same engine, on your intake link.
        </p>
        <Link className="btn mt-4 inline-flex" href="/intake/frost-circle">
          Open bakery intake
        </Link>
      </section>
    </div>
  );
}
