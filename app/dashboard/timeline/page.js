"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Code2, Globe, Clock, FileCode, Search, ChevronRight } from "lucide-react";

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

// Helper to extract clean event detail description
function getEventDetails(event) {
  if (!event || !event.eventType) return "Workspace log recorded";
  
  if (event.eventType === "FILE_SAVE") {
    const lines = event.metadata?.linesCount ? ` (${event.metadata.linesCount} lines)` : "";
    return `Saved ${event.metadata?.language || "unknown"} file${lines}`;
  }
  if (event.eventType === "FILE_OPEN") {
    return `Opened ${event.metadata?.language || "unknown"} file`;
  }
  if (event.eventType === "DOC_VISIT") {
    return event.metadata?.title || "Visited reference documentation";
  }
  return "Workspace log recorded";
}

export default function TimelinePage() {
  const [pageState, setPageState] = useState("api"); // api, success (mock), loading, empty, error
  const [events, setEvents] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all"); // all, code, docs

  // Fetch paginated events from PostgreSQL via Route Handler
  const fetchTimelineEvents = async (pageNumber = 1, append = false) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const res = await fetch(`/api/dashboard/timeline?page=${pageNumber}&limit=5`);
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      
      const newEvents = data?.events || [];
      if (append) {
        setEvents((prev) => [...prev, ...newEvents]);
      } else {
        setEvents(newEvents);
      }
      setNextPage(data?.nextPage || null);

      // Default to empty state UI if zero events found overall on page 1
      if (pageNumber === 1 && newEvents.length === 0) {
        setPageState("empty");
      } else if (pageNumber === 1) {
        setPageState("api");
      }
    } catch (error) {
      console.error("Timeline fetch error:", error);
      if (pageNumber === 1) setPageState("error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const handleStateToggle = (state) => {
    if (state === "api") {
      fetchTimelineEvents(1, false);
    } else {
      setLoading(true);
      setPageState(state);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleLoadMore = () => {
    if (nextPage) {
      fetchTimelineEvents(nextPage, true);
    }
  };

  // Mock Fallback Data for demonstration
  const mockEvents = [
    {
      id: "mock-1",
      eventType: "FILE_SAVE",
      resourceName: "app/dashboard/timeline/page.js",
      workspace: "FlowSense-AI",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: { language: "javascript", linesCount: 210 }
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
      resourceName: "components/dashboard-sidebar.jsx",
      workspace: "FlowSense-AI",
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      metadata: { language: "javascript" }
    },
    {
      id: "mock-4",
      eventType: "DOC_VISIT",
      resourceName: "https://clerk.com/docs/references/nextjs/clerk-middleware",
      workspace: "clerk.com",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metadata: { title: "clerkMiddleware | Clerk Docs" }
    }
  ];

  // Pick between live API list or mock fallback logs
  const rawEventsList = pageState === "api" ? events : mockEvents;

  // Filter events client-side based on filter tabs selection
  const filteredEvents = (rawEventsList || []).filter((e) => {
    if (!e || !e.eventType) return false;
    if (filter === "all") return true;
    if (filter === "code") return e.eventType.startsWith("FILE_");
    if (filter === "docs") return e.eventType === "DOC_VISIT";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Activity Timeline</h1>
          <p className="text-zinc-500">Chronological feed of your active telemetry workspace logs.</p>
        </div>

        {/* State Toggle bar */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold self-start">
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

      {/* FILTER BAR */}
      {(pageState === "api" || pageState === "success") && !loading && (
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-sm font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${filter === "all" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("code")}
            className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${filter === "code" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            IDE Logs
          </button>
          <button
            onClick={() => setFilter("docs")}
            className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${filter === "docs" ? "border-blue-600 text-blue-650" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
          >
            Doc Site Visits
          </button>
        </div>
      )}

      {/* RENDER BODY */}
      {loading || pageState === "loading" ? (
        // A. LOADING TIMELINE STATE
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-sm animate-pulse">
          <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-zinc-900">Synchronizing Activity History</p>
            <p className="text-xs text-zinc-500">Retrieving event streams from PostgreSQL database...</p>
          </div>
        </div>
      ) : pageState === "error" ? (
        // B. ERROR TIMELINE STATE
        <Card className="border border-red-200 bg-red-50/50 p-8 text-center shadow-sm">
          <CardHeader className="flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-650 mb-2 font-bold text-lg">
              !
            </div>
            <CardTitle className="text-lg font-bold text-red-900">Historical Query Failed</CardTitle>
            <CardDescription className="text-red-700 max-w-sm mx-auto">
              Could not retrieve telemetry events history. Check connection strings or database logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchTimelineEvents(1, false)} className="bg-red-650 text-white hover:bg-red-700 cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry Query
            </Button>
          </CardContent>
        </Card>
      ) : pageState === "empty" ? (
        // C. EMPTY TIMELINE STATE
        <Card className="border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 mx-auto mb-3 text-lg font-bold">
            📡
          </div>
          <CardTitle className="text-lg font-bold text-zinc-950">No Activity Logs Found</CardTitle>
          <CardDescription className="text-zinc-500 max-w-sm mx-auto mt-1.5">
            You haven't recorded any telemetry events. Make sure to generate your Personal Access Token in your settings and link the VS Code plugin.
          </CardDescription>
        </Card>
      ) : (
        // D. SUCCESS STATE
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            <div className="relative border-l-2 border-zinc-200 pl-6 ml-4 space-y-6">
              {filteredEvents.map((item) => (
                <div key={item.id} className="relative">
                  {/* Timeline dot icon container */}
                  <div className="absolute -left-[38px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                    {item.eventType && item.eventType.startsWith("FILE_") ? (
                      <FileCode className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Search className="h-4 w-4 text-purple-650" />
                    )}
                  </div>

                  {/* Event card details */}
                  <Card className="border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow">
                    <CardHeader className="py-3.5 px-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                          item.eventType === "FILE_SAVE" 
                            ? "bg-blue-50 text-blue-700 border border-blue-100" 
                            : item.eventType === "FILE_OPEN" 
                            ? "bg-sky-50 text-sky-700 border border-sky-100"
                            : "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {item.eventType || "EVENT"}
                        </span>
                        <CardTitle className="text-sm font-bold text-zinc-950 mt-2 break-all max-w-xl">
                          {item.resourceName && item.resourceName.includes("/") 
                            ? item.resourceName.split("/").pop() 
                            : item.resourceName || "Unnamed Resource"}
                        </CardTitle>
                        {item.eventType === "DOC_VISIT" && item.resourceName && (
                          <a 
                            href={item.resourceName} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate block mt-1 max-w-lg"
                          >
                            {item.resourceName}
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-semibold shrink-0 sm:self-center">
                        {getRelativeTime(item.timestamp)}
                      </span>
                    </CardHeader>
                    <CardContent className="py-2.5 px-4 text-xs text-zinc-550 border-t border-zinc-50 bg-zinc-50/20">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-1">
                        <span>
                          Workspace/Domain: <strong className="text-zinc-700 font-semibold">{item.workspace || "unknown"}</strong>
                        </span>
                      </div>
                      <p className="text-zinc-700 font-medium mt-1.5 italic">
                        {getEventDetails(item)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
              <p className="text-zinc-500 text-sm">No events found matching the selected filter.</p>
            </Card>
          )}

          {/* LOAD MORE BUTTON FOR PAGINATION */}
          {nextPage && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-6 py-4 rounded-lg cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading more events...
                  </>
                ) : (
                  "Load More Activity"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
