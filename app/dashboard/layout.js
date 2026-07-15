import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Viewport Panel */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace Shell
          </h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              ● Connected
            </span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
