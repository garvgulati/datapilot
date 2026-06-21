import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Database, LayoutDashboard, ShieldCheck, UploadCloud } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataPilot",
  description: "Full-stack SaaS for AI-assisted business data analysis"
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/project-cost-intelligence", label: "Cost Intelligence", icon: BarChart3 }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-nav px-4 py-5 text-slate-200 shadow-nav lg:block">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black tracking-tight text-nav">
                DP
              </div>
              <div>
                <p className="text-sm font-semibold text-white">DataPilot</p>
                <p className="text-xs text-slate-400">AI Data Analyst</p>
              </div>
            </Link>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">Finance Transformation PMO</p>
            </div>
            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-400">
              <div className="mb-1 flex items-center gap-2 font-semibold text-white">
                <ShieldCheck size={14} />
                Governed analytics
              </div>
              Dataset context is isolated per workspace. No secrets are hardcoded.
            </div>
          </aside>
          <div className="lg:pl-72">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="font-semibold text-ink">DataPilot</Link>
                <Link href="/upload" className="rounded bg-ink px-3 py-2 text-xs font-semibold text-white">Upload</Link>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
              <div className="mb-5 hidden items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500 lg:flex">
                <div>Analytics Console / Executive Workspace</div>
                <div className="flex items-center gap-3">
                  <span className="status-chip border-emerald-200 bg-emerald-50 text-emerald-800">Live Preview</span>
                  <span>Data refreshed on demand</span>
                </div>
              </div>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
