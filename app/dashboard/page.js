"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Code, Library, Sparkles, RefreshCw, FileCode, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

// Helper to format timestamps to relative time strings
function getRelativeTime(dateStr) {
  try {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recently";
  }
}

// Simple helper to parse **bold** text in lines
function renderBoldText(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-zinc-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Lightweight Renderer for Gemini-produced Markdown logs
function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-3.5 text-zinc-700 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Headers: ### Title
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-zinc-900 mt-5 first:mt-0 flex items-center gap-1.5 border-b border-zinc-100 pb-1.5 tracking-tight">
              {trimmed.replace('###', '').trim()}
            </h4>
          );
        }
        
        // Bullet points: - Text
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const text = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 py-0.5">
              <span className="text-blue-500 mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span className="text-zinc-650">{renderBoldText(text)}</span>
            </div>
          );
        }
        
        // Skip blank lines
        if (!trimmed) {
          return null;
        }
        
        // Paragraphs
        return (
          <p key={idx} className="text-zinc-650">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const [pageState, setPageState] = useState("api"); // 'api' (real database), 'success' (mock), 'loading', 'empty', 'error'
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Fetch metrics and statistics from PostgreSQL API
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const data = await res.json();
      setApiData(data);
      
      // If there are absolutely zero logged events overall, default to empty screen illustration
      if (data.totalEventsCount === 0) {
        setPageState("empty");
      } else {
        setPageState("api");
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
      setPageState("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleStateToggle = (state) => {
    if (state === "api") {
      fetchDashboardStats();
    } else {
      setLoading(true);
      setPageState(state);
      setTimeout(() => {
        setLoading(false);
      }, 550);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    setSummaryError("");
    try {
      // Use current calendar day (YYYY-MM-DD)
      const dateStr = new Date().toISOString().split('T')[0];
      
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date: dateStr })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to trigger AI focus summary compilation.");
      }

      const data = await res.json();
      
      // Update local API metrics state with newly generated summary contents
      setApiData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          latestSummary: data
        };
      });
    } catch (error) {
      console.error("Summary generation error:", error);
      setSummaryError(error.message || "Failed to generate daily summary.");
    } finally {
      setGenerating(false);
    }
  };

  // Mock Fallback Success Data for Demonstration
  const mockData = {
    codingTime: "4h 25m",
    filesModifiedCount: 14,
    docVisitsCount: 32,
    recentEvents: [
      {
        id: "mock-1",
        eventType: "FILE_SAVE",
        resourceName: "components/dashboard-sidebar.jsx",
        workspace: "FlowSense-AI",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: { language: "javascript" }
      },
      {
        id: "mock-2",
        eventType: "DOC_VISIT",
        resourceName: "https://react.dev/reference/react/useState",
        workspace: "react.dev",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        metadata: { title: "useState - React Docs" }
      },
      {
        id: "mock-3",
        eventType: "FILE_OPEN",
        resourceName: "app/page.js",
        workspace: "FlowSense-AI",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        metadata: { language: "javascript" }
      }
    ],
    latestSummary: {
      content: "### 🚀 Key Focus Areas\n- **Configuring middleware parameters** for the dashboard redirection checks.\n- **Setting up Prisma schemas** mapping the relational TelemetryEvent models.\n\n### 📚 Documentation Visited\n- Researched Next.js Route Guard and middleware patterns on Clerk documentation site.\n\n### 💡 Summary & Insights\nYou spent the morning successfully initializing the backend storage schemas and hooking up authentication guards. Progress was smooth and highly efficient. Ready to proceed to testing."
    }
  };

  // Prevent accessing properties of null during initial rendering tick while API is fetching
  if (pageState === "api" && !apiData && loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard Overview</h1>
            <p className="text-zinc-500">Track and recover your developer flow metrics.</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-sm animate-pulse">
          <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-zinc-900">Synchronizing Telemetry Metrics</p>
            <p className="text-xs text-zinc-500">Querying your events logs from Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  // Select between live API data or recruiter toggled mock data (safeguarded against null values)
  const data = (pageState === "api" ? apiData : mockData) || mockData;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard Overview</h1>
          <p className="text-zinc-500">Track and recover your developer flow metrics.</p>
        </div>
        {/* State Toggle Switcher for Recruiters */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold self-start">
          <span className="text-zinc-500 px-2">Dev States:</span>
          <button
            onClick={() => handleStateToggle("api")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "api" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
          >
            Live DB
          </button>
          <button
            onClick={() => handleStateToggle("success")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "success" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
          >
            Mock Success
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
            Empty
          </button>
          <button
            onClick={() => handleStateToggle("error")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "error" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
          >
            Error
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC STATE LAYOUTS */}
      {loading || pageState === "loading" ? (
        // A. LOADING SPINNER STATE
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-sm animate-pulse">
          <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-zinc-900">Synchronizing Telemetry Metrics</p>
            <p className="text-xs text-zinc-500">Querying your events logs from Supabase...</p>
          </div>
        </div>
      ) : pageState === "error" ? (
        // B. ERROR ALERTS STATE
        <Card className="border border-red-200 bg-red-50/50 p-6 text-center">
          <CardHeader className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-655 mb-2 font-bold text-lg">
              !
            </div>
            <CardTitle className="text-lg font-bold text-red-900">Database Connection Error</CardTitle>
            <CardDescription className="text-red-700 max-w-md mx-auto">
              Failed to query stats. Please verify your Supabase database instance is active and configured correctly in the .env settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDashboardStats} className="bg-red-650 text-white hover:bg-red-700 cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry Database Connection
            </Button>
          </CardContent>
        </Card>
      ) : pageState === "empty" ? (
        // C. EMPTY TELEMETRY INBOX STATE
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-zinc-200 bg-white shadow-sm opacity-60">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-zinc-400" /> Coding Time (Today)</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0h 0m</p></CardContent>
            </Card>
            <Card className="border border-zinc-200 bg-white shadow-sm opacity-60">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Code className="h-4 w-4 text-zinc-400" /> Files Modified</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0 files</p></CardContent>
            </Card>
            <Card className="border border-zinc-200 bg-white shadow-sm opacity-60">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 font-medium"><Library className="h-4 w-4 text-zinc-400" /> Whitelisted Doc Visits</CardDescription>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-zinc-400">0 pages</p></CardContent>
            </Card>
          </div>

          <Card className="border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
            <CardHeader className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 mb-3 text-lg font-bold">
                📡
              </div>
              <CardTitle className="text-lg font-bold text-zinc-900">No Telemetry Events Logged</CardTitle>
              <CardDescription className="text-zinc-550 max-w-md mx-auto">
                Your database is connected, but no event tracks have been received yet. Go to your settings, generate a Personal Access Token (PAT), and connect your client extensions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        // D. SUCCESS STATE
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
                <div className="text-2xl font-bold text-zinc-950">{data?.codingTime || "0h 0m"}</div>
                <p className="text-xs text-zinc-500 mt-1">Based on file saving logs</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-blue-600" /> Files Modified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950">{data?.filesModifiedCount || 0} files</div>
                <p className="text-xs text-zinc-500 mt-1">Saves recorded today</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Library className="h-4 w-4 text-blue-600" /> Reference Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950">{data?.docVisitsCount || 0} pages</div>
                <p className="text-xs text-zinc-500 mt-1">Whitelisted developer sites</p>
              </CardContent>
            </Card>
          </div>

          {/* Grid Layout for Focus Summary and Activity TIMELINE Preview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* AI Summary Card */}
            <Card className="border border-zinc-200 bg-white shadow-sm overflow-hidden md:col-span-2 flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" /> Daily Focus Summary
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">Synthesized context logs for current working session.</CardDescription>
                  </div>
                  {data?.latestSummary && !summaryError && (
                    <Button 
                      size="sm" 
                      onClick={handleGenerateSummary}
                      disabled={generating}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Compiling...
                        </>
                      ) : "Regenerate"}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {generating && !data?.latestSummary ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-zinc-500 animate-pulse font-semibold">FlowSense AI is analyzing today's workspace logs...</p>
                    </div>
                  ) : summaryError ? (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-red-900 flex items-center justify-center gap-1.5">
                        ⚠️ Generation Failed
                      </p>
                      <p className="text-xs text-red-700 mt-2 max-w-md mx-auto leading-relaxed">{summaryError}</p>
                      <Button 
                        size="sm" 
                        onClick={handleGenerateSummary} 
                        className="bg-red-650 hover:bg-red-700 text-white text-xs mt-4 cursor-pointer"
                      >
                        Retry Focus Summary Generation
                      </Button>
                    </div>
                  ) : data?.latestSummary ? (
                    <div className="relative">
                      {generating && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-2xs">
                          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
                            <RefreshCw className="h-4 w-4 animate-spin" /> Updating daily focus summary...
                          </div>
                        </div>
                      )}
                      <MarkdownRenderer content={data.latestSummary.content} />
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm font-bold text-zinc-900">No Focus Summary Generated Yet</p>
                      <p className="text-xs mt-1.5 text-zinc-550 max-w-sm mx-auto leading-relaxed">
                        Compile your local file saving history and browser reference visits into an AI-synthesized markdown brief.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={handleGenerateSummary}
                        disabled={generating}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs mt-4 cursor-pointer"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analyzing logs...
                          </>
                        ) : "Generate Focus Summary"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Recent Timeline Preview panel */}
            <Card className="border border-zinc-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 py-4">
                  <CardTitle className="text-sm font-bold text-zinc-950">
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-xs">Last logged events.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-4">
                  <div className="space-y-3">
                    {data?.recentEvents && data.recentEvents.length > 0 ? (
                      data.recentEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-2.5 text-xs text-zinc-650 pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0">
                          <div className={`p-1.5 rounded-md ${event.eventType && event.eventType.startsWith("FILE_") ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-650"}`}>
                            {event.eventType && event.eventType.startsWith("FILE_") ? (
                              <FileCode className="h-3.5 w-3.5" />
                            ) : (
                              <Search className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">
                              {event.eventType === "FILE_SAVE" ? "Saved file" : event.eventType === "FILE_OPEN" ? "Opened file" : "Visited doc"}
                            </p>
                            <p className="text-zinc-500 truncate mt-0.5" title={event.resourceName}>
                              {event.resourceName && event.resourceName.includes("/") ? event.resourceName.split("/").pop() : event.resourceName || "Unnamed Resource"}
                            </p>
                          </div>
                          <span className="text-zinc-400 self-center shrink-0">
                            {getRelativeTime(event.timestamp)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-zinc-400">No events logged.</p>
                    )}
                  </div>
                </CardContent>
              </div>
              <CardContent className="pt-2 pb-4 border-t border-zinc-100 bg-zinc-50/20">
                <Link href="/dashboard/timeline" className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 group cursor-pointer">
                  <span>View Timeline Feed</span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
