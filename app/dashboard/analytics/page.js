"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Clock, Code2, Globe } from "lucide-react";

export default function AnalyticsPage() {
  const [pageState, setPageState] = useState("success"); // success, loading, empty, error
  const [loading, setLoading] = useState(false);

  const handleStateToggle = (state) => {
    setLoading(true);
    setPageState(state);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Workspace Analytics</h1>
          <p className="text-zinc-500">Visual summaries of your coding hours, active files, and references.</p>
        </div>

        {/* State Toggle bar */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold">
          <span className="text-zinc-500 px-2">Dev States:</span>
          <button
            onClick={() => handleStateToggle("success")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "success" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-150"}`}
          >
            Success
          </button>
          <button
            onClick={() => handleStateToggle("loading")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "loading" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-150"}`}
          >
            Loading
          </button>
          <button
            onClick={() => handleStateToggle("empty")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "empty" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-150"}`}
          >
            Empty
          </button>
          <button
            onClick={() => handleStateToggle("error")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "error" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-150"}`}
          >
            Error
          </button>
        </div>
      </div>

      {/* RENDER BODY */}
      {loading || pageState === "loading" ? (
        // LOADING ANALYTICS
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border border-zinc-200 animate-pulse h-64 bg-zinc-50" />
            <Card className="border border-zinc-200 animate-pulse h-64 bg-zinc-50" />
          </div>
        </div>
      ) : pageState === "error" ? (
        // ERROR ANALYTICS
        <Card className="border border-red-200 bg-red-50/50 p-8 text-center">
          <CardTitle className="text-lg font-bold text-red-900 mb-2">Metrics Compilation Failed</CardTitle>
          <CardDescription className="text-red-700">
            Failed to connect to the Upstash Redis caching database. Reload the page to retry computing analytics.
          </CardDescription>
        </Card>
      ) : pageState === "empty" ? (
        // EMPTY ANALYTICS
        <Card className="border border-zinc-200 border-dashed bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 mx-auto mb-3">
            <BarChart3 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-zinc-950">Insufficient Data</CardTitle>
          <CardDescription className="text-zinc-550 max-w-sm mx-auto mt-1.5">
            FlowSense needs at least 24 hours of logged events from your extensions to generate visual analytics charts.
          </CardDescription>
        </Card>
      ) : (
        // SUCCESS STATE (Analytics mocks representing Phase 8 charts)
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Mock Chart 1: Coding hour estimates */}
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-600" /> Active Coding Time (Weekly)
              </CardTitle>
              <CardDescription className="text-xs">Estimated daily sessions derived from editor saves.</CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex items-end justify-between gap-2 pt-4">
              {[
                { day: "Mon", hrs: "3.5h", val: "h-[35%]" },
                { day: "Tue", hrs: "4.2h", val: "h-[42%]" },
                { day: "Wed", hrs: "5.0h", val: "h-[50%]" },
                { day: "Thu", hrs: "2.8h", val: "h-[28%]" },
                { day: "Fri", hrs: "4.5h", val: "h-[45%]" },
                { day: "Sat", hrs: "1.2h", val: "h-[12%]" },
                { day: "Sun", hrs: "0.0h", val: "h-[0%]" },
              ].map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hrs}
                  </span>
                  <div className={`w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-colors ${d.val}`} />
                  <span className="text-[10px] font-semibold text-zinc-500">{d.day}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mock Chart 2: Top modified files */}
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Code2 className="h-4.5 w-4.5 text-blue-600" /> Most Edited Files (Top 3)
              </CardTitle>
              <CardDescription className="text-xs">Files with the highest saving metrics recorded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {[
                { name: "app/page.js", count: "24 saves", width: "w-[80%]" },
                { name: "components/dashboard-sidebar.jsx", count: "18 saves", width: "w-[60%]" },
                { name: "middleware.js", count: "10 saves", width: "w-[35%]" },
              ].map((f) => (
                <div key={f.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-800 font-semibold break-all">{f.name}</span>
                    <span className="text-zinc-500 shrink-0">{f.count}</span>
                  </div>
                  <div className="w-full bg-zinc-150 h-2 rounded-full overflow-hidden">
                    <div className={`bg-blue-600 h-full rounded-full ${f.width}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mock Chart 3: Visited docs domains */}
          <Card className="border border-zinc-200 bg-white shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-blue-600" /> Reference Searches (By Whitelist Domain)
              </CardTitle>
              <CardDescription className="text-xs">Documentation visits tracked inside browser pages.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
              {[
                { name: "react.dev", visits: 15, pct: "47%" },
                { name: "github.com", visits: 10, pct: "31%" },
                { name: "clerk.com", visits: 7, pct: "22%" },
              ].map((d) => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase">{d.name}</div>
                    <div className="text-lg font-bold text-zinc-950 mt-0.5">{d.visits} visits</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {d.pct}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
