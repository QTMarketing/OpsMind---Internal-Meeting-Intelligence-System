"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/record", label: "Record & Upload" },
  { href: "/meetings", label: "Meetings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="surface fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">OpsMind</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Workspace</p>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "nav-item block transition-colors",
                  isActive ? "nav-item-active" : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-5">
          <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
            System
          </p>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            Settings
          </button>
          <button
            type="button"
            className="mt-1.5 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
