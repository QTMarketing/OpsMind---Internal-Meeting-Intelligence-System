import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SidebarNav />
      <div className="lg:pl-64">
        <TopBar />
        <main id="main-content" className="px-4 py-5 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
