import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ExplodedCakeMark } from "@/components/ExplodedCakeMark";
import { UploadDropzone } from "@/components/UploadDropzone";
import { SpecimenGrid } from "@/components/SpecimenGrid";

export default function HomePage() {
  return (
    <div>
      <SiteHeader
        trailing={
          <a className="min-h-11 px-3 py-3" href="#how">
            How it works
          </a>
        }
      />
      <section className="grid items-center gap-10 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
        <ExplodedCakeMark />
        <div>
          <p className="max-w-md text-[18px]">
            Every custom cake order starts with a screenshot and a guess.
          </p>
          <p className="mt-3 max-w-md">Upload the photo. Get the spec. Find who can build it.</p>
          <div className="mt-6 max-w-lg">
            <UploadDropzone />
          </div>
        </div>
      </section>
      <section id="how" className="border-t border-ink px-4 py-10 md:px-6">
        <h2 className="mb-6 font-display text-[34px]">The problem</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-ink bg-butter p-4">
            <h3 className="font-display text-xl">Supermarket tools</h3>
            <p className="mt-2">Make you pick from a menu. The cake you saw is not on it.</p>
          </div>
          <div className="border border-ink bg-butter p-4">
            <h3 className="font-display text-xl">Image generators</h3>
            <p className="mt-2">Hand you an unbuildable picture and tell you to show a baker.</p>
          </div>
          <div className="border border-ink bg-butter p-4">
            <h3 className="font-display text-xl">DMing bakers</h3>
            <p className="mt-2">Takes days and usually ends in a compromise.</p>
          </div>
        </div>
      </section>
      <SpecimenGrid />
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
