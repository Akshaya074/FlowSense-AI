"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  MessageSquareCode,
  BarChart3,
  Settings,
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Timeline", href: "/dashboard/timeline", icon: Clock },
    { name: "Ask FlowSense", href: "/dashboard/ask-flowsense", icon: MessageSquareCode },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-zinc-200 bg-white">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-zinc-150">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">
          FS
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-950">
          FlowSense <span className="text-blue-600">AI</span>
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-650"
                  : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-950"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-550"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Session Controller */}
      <div className="border-t border-zinc-200 p-4">
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-2 border border-zinc-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs font-semibold text-zinc-700 truncate max-w-[120px]">
              Active User
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
