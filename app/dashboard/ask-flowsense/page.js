"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, HelpCircle, AlertCircle, Bot, User } from "lucide-react";

export default function AskFlowSensePage() {
  const [pageState, setPageState] = useState("success"); // success, loading, empty, error
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleStateToggle = (state) => {
    setLoading(true);
    setPageState(state);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const starterQuestions = [
    "What files did I edit yesterday afternoon?",
    "Show me the MDN documentation links I visited",
    "Synthesize my main focus areas for this week",
  ];

  const handleSelectQuestion = (q) => {
    setQuery(q);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Ask FlowSense</h1>
          <p className="text-zinc-500">Query your telemetry history semantically using Gemini RAG.</p>
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

      {/* CHAT FRAMEWORK */}
      <Card className="border border-zinc-200 bg-white flex flex-col h-[550px] shadow-sm">
        {/* Chat Header */}
        <CardHeader className="border-b border-zinc-100 py-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-950">FlowSense Context Assistant</CardTitle>
              <CardDescription className="text-xs">RAG Agent referencing your daily summaries</CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading || pageState === "loading" ? (
            // LOADING CHAT
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-zinc-100 rounded-xl p-4 max-w-[80%] animate-pulse space-y-2">
                <div className="h-3.5 bg-zinc-200 rounded w-48" />
                <div className="h-3 bg-zinc-200 rounded w-64" />
              </div>
            </div>
          ) : pageState === "error" ? (
            // ERROR CHAT
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-2">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950">Model Search Error</h3>
                <p className="text-xs text-zinc-500">
                  Qdrant collection query failed or Gemini API key is invalid. Set key params in environment keys.
                </p>
              </div>
            </div>
          ) : pageState === "empty" ? (
            // EMPTY CHAT (Starter recommendations)
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950">Ask anything about your work history</h3>
                <p className="text-xs text-zinc-500">
                  Select a starter query below or write your own question. Your RAG pipeline will read summaries to retrieve the context.
                </p>
              </div>
              <div className="w-full space-y-2.5">
                {starterQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSelectQuestion(q)}
                    className="w-full flex items-center gap-3 rounded-lg border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 p-3 text-left text-xs font-semibold text-zinc-700 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // SUCCESS CHAT (Conversation display)
            <div className="space-y-4">
              {/* User message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600 text-white rounded-xl p-4 max-w-[80%] text-sm">
                  What did I work on yesterday morning?
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-650">
                  <User className="h-5 w-5" />
                </div>
              </div>

              {/* Bot response */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-zinc-100 text-zinc-800 rounded-xl p-4 max-w-[80%] text-sm space-y-2">
                  <p>
                    Yesterday morning, you focused on project scaffolding and dependency installations:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-700">
                    <li>Initialized Next.js app config and installed Clerk.</li>
                    <li>Added shadcn/ui components (Button, Card).</li>
                    <li>Visits: Researched Clerk routes in browser (5 tabs).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <CardFooter className="border-t border-zinc-100 p-3 bg-zinc-50/50">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask FlowSense about your context..."
              disabled={pageState === "loading" || pageState === "error"}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none placeholder-zinc-400 focus:border-blue-600 transition-colors disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!query.trim() || pageState === "loading" || pageState === "error"}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 h-10 w-10 flex items-center justify-center rounded-lg shadow-sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
