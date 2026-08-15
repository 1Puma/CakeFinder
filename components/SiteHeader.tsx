import type { ReactNode } from "react";
import Link from "next/link";

export function SiteHeader(props: { trailing?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3 md:px-6">
      <Link href="/" className="font-display text-2xl font-bold">
        CakeMatch
      </Link>
      <div className="flex items-center gap-3 text-[13px]">{props.trailing}</div>
    </header>
  );
}
