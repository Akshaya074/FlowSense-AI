"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Clock, Code2, Globe, FileText, Activity, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
  const [pageState, setPageState] = useState("loading"); // loading, empty, error, success
  const [analytics, setAnalytics] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDev, setIsDev] = useState(false);

  // Fetch compiled statistics on load
  const fetchAnalytics = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/dashboard/analytics");
      if (!res.ok) {
        throw new Error("Failed to fetch analytics statistics");
      }
      
      const data = await res.json();
      
      // If no telemetry events exist overall, trigger the empty/insufficient state
      if (!data.metrics || data.metrics.totalEventsCount === 0) {
        setPageState("empty");
      } else {
        setAnalytics(data);
        setPageState("success");
      }
    } catch (err) {
      console.error("[FlowSense AI] Analytics query failed:", err);
      setPageState("error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        setIsDev(true);
      }
    }
  }, []);

  const handleStateToggle = (state) => {
    if (state === "loading") {
      setPageState("loading");
    } else if (state === "error") {
      setPageState("error");
      setAnalytics(null);
    } else if (state === "empty") {
      setPageState("empty");
      setAnalytics(null);
    } else {
      // Success triggers live reload
      fetchAnalytics();
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Workspace Analytics</h1>
          <p className="text-zinc-500">Visual summaries of your coding hours, active languages, and reference searches.</p>
        </div>

        {/* State Toggle bar */}
        {isDev && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold self-start">
            <span className="text-zinc-500 px-2">Dev States:</span>
            <button
              onClick={() => handleStateToggle("success")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "success" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Live Redis
            </button>
            <button
              onClick={() => handleStateToggle("loading")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "loading" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Loading
            </button>
            <button
              onClick={() => handleStateToggle("empty")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "empty" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Empty UI
            </button>
            <button
              onClick={() => handleStateToggle("error")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "error" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Error UI
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEW BODY */}
      {pageState === "loading" || isFetching ? (
        <Card className="border border-zinc-200 bg-white p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mx-auto mb-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <CardTitle className="text-base font-bold text-zinc-950 animate-pulse">Syncing Cache Workspace...</CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Please wait while FlowSense aggregates your telemetry database records and caches the stats on Upstash Redis.
          </CardDescription>
        </Card>
      ) : pageState === "error" ? (
        <Card className="border border-red-200 bg-red-50/50 p-8 text-center shadow-sm max-w-lg mx-auto mt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 mx-auto mb-3 border border-red-200">
            ⚠️
          </div>
          <CardTitle className="text-sm font-bold text-red-900 mb-1.5">Metrics Ingestion Offline</CardTitle>
          <CardDescription className="text-xs text-red-755 leading-relaxed">
            Failed to connect to the Upstash Redis database or database coordinates are missing in `.env`. Verify your cache configurations.
          </CardDescription>
        </Card>
      ) : pageState === "empty" ? (
        <Card className="border border-zinc-200 border-dashed bg-white p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 mx-auto mb-3.5">
            <BarChart3 className="h-6 w-6 text-zinc-500" />
          </div>
          <CardTitle className="text-base font-bold text-zinc-950">No Activity Logs Found</CardTitle>
          <CardDescription className="text-xs text-zinc-500 max-w-xs mx-auto mt-2 leading-relaxed">
            FlowSense needs telemetry records to map analytics charts. Save files inside VS Code or visit whitelisted doc pages.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Metrics Top Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border border-zinc-200 bg-white shadow-sm p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-3xs font-bold text-zinc-450 uppercase tracking-wider">Coding Time</div>
                <div className="text-lg font-black text-zinc-900 truncate mt-0.5">{analytics.metrics.totalCodingTimeFormatted}</div>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-3xs font-bold text-zinc-450 uppercase tracking-wider">Files Edited</div>
                <div className="text-lg font-black text-zinc-900 truncate mt-0.5">{analytics.metrics.uniqueFilesModified} files</div>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100 shadow-sm">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-3xs font-bold text-zinc-450 uppercase tracking-wider">Doc Searches</div>
                <div className="text-lg font-black text-zinc-900 truncate mt-0.5">{analytics.metrics.totalDocVisits} hits</div>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-3xs font-bold text-zinc-450 uppercase tracking-wider">Total Actions</div>
                <div className="text-lg font-black text-zinc-900 truncate mt-0.5">{analytics.metrics.totalEventsCount} logs</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Chart 1: Active Coding Hours Trends (Sliding SVG columns) */}
            <Card className="border border-zinc-200 bg-white shadow-sm flex flex-col h-72">
              <CardHeader className="py-4 border-b border-zinc-100">
                <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-blue-600" /> Coding Trends (Past 7 Days)
                </CardTitle>
                <CardDescription className="text-2xs">Calculated minutes active in VS Code files per day.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end justify-between gap-3 pt-6 pb-4 px-6 overflow-hidden">
                {(() => {
                  const maxMins = Math.max(...analytics.dailyActivityTrends.map(t => t.minutes), 60);
                  return analytics.dailyActivityTrends.map((t, idx) => {
                    const pct = (t.minutes / maxMins) * 100;
                    return (
                      <div key={t.dateKey || idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all select-none">
                          {t.minutes}m
                        </span>
                        
                        <div 
                          className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all duration-500 cursor-pointer shadow-sm" 
                          style={{ height: `${Math.max(4, pct)}%` }} 
                        />
                        
                        <span className="text-[10px] font-bold text-zinc-500 tracking-tight">{t.date}</span>
                      </div>
                    );
                  });
                })()}
              </CardContent>
            </Card>

            {/* Chart 2: Active Languages Ratio percentages */}
            <Card className="border border-zinc-200 bg-white shadow-sm flex flex-col h-72">
              <CardHeader className="py-4 border-b border-zinc-100">
                <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <Code2 className="h-4.5 w-4.5 text-blue-600" /> Language Distribution
                </CardTitle>
                <CardDescription className="text-2xs">Ratio based on total file save modifications.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {analytics.languages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-zinc-400 font-medium">
                    No files saved yet.
                  </div>
                ) : (
                  analytics.languages.slice(0, 4).map((lang) => (
                    <div key={lang.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-800">{lang.name}</span>
                        <span className="text-zinc-500">{lang.count} saves ({lang.value}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-205">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${lang.value}%` }} 
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Chart 3: Top Whitelisted Domains */}
            <Card className="border border-zinc-200 bg-white shadow-sm md:col-span-2">
              <CardHeader className="py-4 border-b border-zinc-100">
                <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-blue-600" /> Reference Web Queries (Top Domains)
                </CardTitle>
                <CardDescription className="text-2xs">Domains mapped inside whitelisted document telemetry events.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3 p-4">
                {analytics.topDocumentationDomains.length === 0 ? (
                  <div className="sm:col-span-3 flex items-center justify-center py-6 text-xs text-zinc-450 font-semibold">
                    No whitelisted documentation visits logged yet today.
                  </div>
                ) : (
                  analytics.topDocumentationDomains.map((dom) => {
                    const totalVisits = analytics.metrics.totalDocVisits || 1;
                    const pct = Math.round((dom.visits / totalVisits) * 100);
                    return (
                      <div 
                        key={dom.domain} 
                        className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-205 bg-zinc-50/50 hover:bg-zinc-50 transition-colors shadow-sm"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide truncate">{dom.domain}</div>
                          <div className="text-base font-black text-zinc-900 mt-0.5">{dom.visits} visits</div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100 shrink-0 select-none">
                          {pct}%
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
