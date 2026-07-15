"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Code2, Globe, Clock } from "lucide-react";

export default function TimelinePage() {
  const [pageState, setPageState] = useState("success"); // success, loading, empty, error
  const [filter, setFilter] = useState("all"); // all, code, docs
  const [loading, setLoading] = useState(false);

  const handleStateToggle = (state) => {
    setLoading(true);
    setPageState(state);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const mockEvents = [
    {
      id: 1,
      type: "code",
      event: "FILE_SAVE",
      resource: "app/dashboard/timeline/page.js",
      workspace: "FlowSense-AI",
      time: "10:45 AM",
      details: "Added developer states dashboard filters",
    },
    {
      id: 2,
      type: "docs",
      event: "DOC_VISIT",
      resource: "https://react.dev/reference/react/useState",
      workspace: "react.dev",
      time: "10:30 AM",
      details: "React useState hook configuration patterns",
    },
    {
      id: 3,
      type: "code",
      event: "FILE_OPEN",
      resource: "components/dashboard-sidebar.jsx",
      workspace: "FlowSense-AI",
      time: "10:15 AM",
      details: "Opened sidebar component",
    },
    {
      id: 4,
      type: "docs",
      event: "DOC_VISIT",
      resource: "https://clerk.com/docs/references/nextjs/clerk-middleware",
      workspace: "clerk.com",
      time: "09:45 AM",
      details: "Next.js App Router route protecting setups",
    },
  ];

  const filteredEvents = mockEvents.filter(
    (e) => filter === "all" || e.type === filter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Activity Timeline</h1>
          <p className="text-zinc-500">Chronological feed of your active telemetry workspace logs.</p>
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

      {/* FILTER BAR */}
      {pageState === "success" && !loading && (
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-sm font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`pb-2 px-1 border-b-2 transition-all ${filter === "all" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("code")}
            className={`pb-2 px-1 border-b-2 transition-all ${filter === "code" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            IDE Logs
          </button>
          <button
            onClick={() => setFilter("docs")}
            className={`pb-2 px-1 border-b-2 transition-all ${filter === "docs" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            Documentation Visits
          </button>
        </div>
      )}

      {/* RENDER BODY */}
      {loading || pageState === "loading" ? (
        // LOADING TIMELINE
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="border border-zinc-200 animate-pulse bg-white p-4 flex gap-4">
              <div className="h-10 w-10 bg-zinc-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-zinc-100 rounded w-1/4" />
                <div className="h-3 bg-zinc-50 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : pageState === "error" ? (
        // ERROR TIMELINE
        <Card className="border border-red-200 bg-red-50/50 p-8 text-center">
          <CardTitle className="text-lg font-bold text-red-900 mb-2">Query Failed</CardTitle>
          <CardDescription className="text-red-700 mb-4">
            Could not fetch historical workspace events. Check your network or database linkages.
          </CardDescription>
          <button
            onClick={() => handleStateToggle("success")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-750"
          >
            <RefreshCw className="h-4 w-4" /> Retry Fetch
          </button>
        </Card>
      ) : pageState === "empty" ? (
        // EMPTY TIMELINE
        <Card className="border border-zinc-200 border-dashed bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 mx-auto mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-zinc-950">No Events Found</CardTitle>
          <CardDescription className="text-zinc-550 max-w-sm mx-auto mt-1.5">
            You haven't recorded any telemetry events. Install the VS Code plugin or use our whitelisted Chrome extension to see events here.
          </CardDescription>
        </Card>
      ) : (
        // SUCCESS STATE (Chronological feed)
        <div className="relative border-l-2 border-zinc-200 pl-6 ml-4 space-y-6">
          {filteredEvents.map((item) => (
            <div key={item.id} className="relative">
              {/* Timeline dot icon */}
              <div className="absolute -left-[38px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                {item.type === "code" ? (
                  <Code2 className="h-4 w-4 text-blue-600" />
                ) : (
                  <Globe className="h-4 w-4 text-emerald-600" />
                )}
              </div>

              {/* Event card details */}
              <Card className="border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300">
                <CardHeader className="py-3 px-4 flex flex-row items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-800 uppercase">
                      {item.event}
                    </span>
                    <CardTitle className="text-sm font-bold text-zinc-950 mt-1.5 break-all">
                      {item.resource}
                    </CardTitle>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium shrink-0">
                    {item.time}
                  </span>
                </CardHeader>
                <CardContent className="py-2 px-4 text-xs text-zinc-550">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1">
                    <span>
                      Workspace: <strong className="text-zinc-700">{item.workspace}</strong>
                    </span>
                  </div>
                  <p className="text-zinc-650 italic mt-1.5">{item.details}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
