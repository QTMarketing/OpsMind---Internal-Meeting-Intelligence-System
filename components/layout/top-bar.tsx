"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageMeta: Record<string, { title: string; intent: string }> = {
  "/dashboard": {
    title: "Dashboard",
    intent: "Monitor priorities and decide next operational action.",
  },
  "/record": {
    title: "Record & Upload",
    intent: "Capture meeting audio and send it for processing.",
  },
  "/meetings": {
    title: "Meetings",
    intent: "Review conversation outcomes and extract follow-through.",
  },
};

export function TopBar() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta["/dashboard"];
  const mobileLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/record", label: "Record" },
    { href: "/meetings", label: "Meetings" },
  ];

  return (
    <header className="surface sticky top-0 z-20 border-b border-border px-4 lg:px-8">
      <div className="flex h-14 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{meta.title}</p>
          <p className="hidden truncate text-xs text-muted md:block">{meta.intent}</p>
        </div>
        <p className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted lg:block">
          Global Navigation
        </p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Mobile primary">
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={[
              "app-button app-button-ghost whitespace-nowrap hover:bg-surface-muted",
              pathname === link.href ? "nav-item-active" : "",
            ].join(" ")}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
