"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Code, Library, Sparkles, RefreshCw } from "lucide-react";

export default function DashboardOverviewPage() {
  // Simulate page states: loading, empty (first run), success, error
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
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard Overview</h1>
          <p className="text-zinc-500">Track and recover your developer flow metrics.</p>
        </div>
        {/* Toggle bar for recruiters to easily test different design states */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold">
          <span className="text-zinc-500 px-2">Dev States:</span>
          <button
            onClick={() => handleStateToggle("success")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "success" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-150"}`}
          >
            Success
          </button>
          <button
            onClick={() => handleStateToggle("loading")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "loading" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-150"}`}
          >
            Loading
          </button>
          <button
            onClick={() => handleStateToggle("empty")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "empty" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-150"}`}
          >
            Empty
          </button>
          <button
            onClick={() => handleStateToggle("error")}
            className={`px-2.5 py-1 rounded-md transition-colors ${pageState === "error" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-150"}`}
          >
            Error
          </button>
        </div>
      </div>

      {/* RENDER STATES */}
      {loading || pageState === "loading" ? (
        // LOADING STATE
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border border-zinc-200 animate-pulse">
                <CardHeader className="h-20 bg-zinc-100 rounded-t-xl" />
                <CardContent className="h-16 bg-zinc-50 rounded-b-xl" />
              </Card>
            ))}
          </div>
          <Card className="border border-zinc-200 animate-pulse h-48 bg-zinc-50" />
        </div>
      ) : pageState === "error" ? (
        // ERROR STATE
        <Card className="border border-red-200 bg-red-50/50 p-6 text-center">
          <CardHeader className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              ⚠️
            </div>
            <CardTitle className="text-lg font-bold text-red-900">Connection Failed</CardTitle>
            <CardDescription className="text-red-700">
              FlowSense backend API routes are unavailable. Check configuration keys and database tables status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleStateToggle("success")} className="bg-red-600 text-white hover:bg-red-700">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
            </Button>
          </CardContent>
        </Card>
      ) : pageState === "empty" ? (
        // EMPTY STATE (No events recorded)
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4" /> Coding Time</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0h 0m</p></CardContent>
            </Card>
            <Card className="border border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Code className="h-4 w-4" /> Files Edited</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0 files</p></CardContent>
            </Card>
            <Card className="border border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Library className="h-4 w-4" /> Reference Searches</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0 tabs</p></CardContent>
            </Card>
          </div>

          <Card className="border border-zinc-200 border-dashed bg-white p-8 text-center">
            <CardHeader className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 mb-2">
                📡
              </div>
              <CardTitle className="text-lg font-bold text-zinc-900">No Telemetry Logs Yet</CardTitle>
              <CardDescription className="text-zinc-550 max-w-md mx-auto">
                FlowSense AI is waiting for logs. Generate a Personal Access Token in your settings and set up the VS Code and Browser extensions to track your context.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        // SUCCESS STATE (Active dashboard view with mock overview stats)
        <div className="space-y-6">
          {/* Card list */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" /> Coding Time (Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950">4h 25m</div>
                <p className="text-xs text-zinc-500 mt-1">Based on telemetry saves</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-blue-600" /> Files Modified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950">14 files</div>
                <p className="text-xs text-zinc-500 mt-1">Across 2 workspaces</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Library className="h-4 w-4 text-blue-600" /> Whitelisted Doc Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950">32 pages</div>
                <p className="text-xs text-zinc-500 mt-1">MDN, Stack Overflow, React</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary Card mockup */}
          <Card className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" /> Daily Focus Summary
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Synthesized context logs for current working session.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Generate Daily Summary
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
                <p>
                  <strong>Overview:</strong> You spent the morning initializing the application shell and route middleware configurations for <strong>FlowSense AI</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-650 ml-2">
                  <li>Configured Next.js App Router structures and Tailwind styling tokens.</li>
                  <li>Integrated Clerk authentication providers and built dashboard layout guards.</li>
                  <li>Searched Clerk and React Router navigation docs for setup references (8 visits).</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
