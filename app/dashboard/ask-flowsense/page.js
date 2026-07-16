"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, HelpCircle, AlertCircle, Bot, User, RefreshCw, Calendar } from "lucide-react";

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

// Reuse the MarkdownRenderer to render Gemini RAG responses beautifully
function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-zinc-750 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Headers: ### Title or ## Title
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const cleanHeader = trimmed.replace(/^#+\s+/, '');
          return (
            <h4 key={idx} className="text-sm font-bold text-zinc-900 mt-4 first:mt-0 pb-1 border-b border-zinc-200/50">
              {cleanHeader}
            </h4>
          );
        }
        
        // Bullet points: - Text
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const text = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-blue-500 mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>{renderBoldText(text)}</span>
            </div>
          );
        }
        
        // Skip blank lines
        if (!trimmed) {
          return null;
        }
        
        // Paragraphs
        return (
          <p key={idx}>
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function AskFlowSensePage() {
  const [pageState, setPageState] = useState("chat"); // chat, success (mock), loading, empty, error
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const chatEndRef = useRef(null);

  // Chat conversation logs list state
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your FlowSense Context Assistant. Ask me anything about your past coding sessions, documentation sites visited, or files edited (e.g. *'What files did I edit today?'* or *'What did I read about clerkMiddleware?'*). I will search your Semantics vector index to answer."
    }
  ]);

  const starterQuestions = [
    "What files did I edit recently?",
    "Show me what reference docs I visited today",
    "Summarize my main focus areas from my summaries",
  ];

  // Auto-scroll chat feed container to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendQuery = async (textToSend) => {
    const trimmedQuery = textToSend.trim();
    if (!trimmedQuery) return;

    // 1. Add User query message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuery
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setErrorMsg("");

    try {
      // 2. Fetch RAG conversational answer from vector search endpoint
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to retrieve RAG response.");
      }

      const data = await res.json();

      // 3. Add Assistant answer message containing reference payload links
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        references: data.references || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong querying the assistant.");
      
      // Log error bubble to chat stream
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Search Error**: ${err.message || "Could not retrieve semantic logs context. Verify Supabase & Qdrant collections."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (q) => {
    handleSendQuery(q);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your FlowSense Context Assistant. Ask me anything about your past coding sessions, documentation sites visited, or files edited (e.g. *'What files did I edit today?'* or *'What did I read about clerkMiddleware?'*). I will search your Semantics vector index to answer."
      }
    ]);
    setErrorMsg("");
    setQuery("");
  };

  const handleStateToggle = (state) => {
    if (state === "chat") {
      handleClearChat();
      setPageState("chat");
    } else {
      setPageState(state);
    }
  };

  // Mock Success message stream for developer recruiter preview
  const mockMessages = [
    {
      id: "mock-welcome",
      role: "assistant",
      content: "Hello! I am your FlowSense Context Assistant. Ask me anything about your past coding sessions, documentation sites visited, or files edited."
    },
    {
      id: "mock-user",
      role: "user",
      content: "What did I work on yesterday afternoon?"
    },
    {
      id: "mock-assistant",
      role: "assistant",
      content: "### Yesterday Afternoon Highlights\n- **Prisma Schema configurations**: You edited [schema.prisma](file:///c:/Users/aksha/.gemini/antigravity/scratch/flowsense-ai/prisma/schema.prisma) and ran migrations.\n- **Authentication middleware guards**: Set clerk routes inside your middleware file.\n- **Doc site research**: Spent 12 minutes reading the official Clerk Middleware redirect parameters on `clerk.com`.",
      references: [
        { id: "ref-1", date: "2026-07-15", score: 0.89 }
      ]
    }
  ];

  const activeMessagesList = pageState === "success" ? mockMessages : messages;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Ask FlowSense</h1>
          <p className="text-zinc-500">Query your telemetry history semantically using Gemini RAG.</p>
        </div>

        {/* State Toggle bar */}
        {process.env.NODE_ENV === "development" && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm text-xs font-semibold self-start">
            <span className="text-zinc-500 px-2">Dev States:</span>
            <button
              onClick={() => handleStateToggle("chat")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "chat" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Live RAG
            </button>
            <button
              onClick={() => handleStateToggle("success")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pageState === "success" ? "bg-blue-600 text-white" : "text-zinc-650 hover:bg-zinc-100"}`}
            >
              Mock Chat
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

      {/* CHAT FRAMEWORK CONTAINER */}
      <Card className="border border-zinc-200 bg-white flex flex-col h-[550px] shadow-sm overflow-hidden">
        {/* Chat Header bar */}
        <CardHeader className="border-b border-zinc-100 py-3 px-4 bg-zinc-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-950">FlowSense Context Assistant</CardTitle>
              <CardDescription className="text-2xs">Semantic agent referencing your daily summaries</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="xs" 
            onClick={handleClearChat}
            className="text-xs border-zinc-200 hover:bg-zinc-50 cursor-pointer px-2.5 py-1 text-zinc-600"
          >
            Reset Chat
          </Button>
        </CardHeader>

        {/* Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/10">
          
          {pageState === "loading" ? (
            // A. LOADING STATE WRAPPER
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4 max-w-[80%] shadow-2xs space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-28 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-48 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-36 animate-pulse" />
              </div>
            </div>
          ) : pageState === "error" ? (
            // B. ERROR STATE WRAPPER
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm space-y-2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-650 mx-auto mb-2">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Search Framework Error</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Qdrant collection queries failed or the Gemini API returned a quota limit error. Verify keys inside your `.env` configuration.
                </p>
              </div>
            </div>
          ) : pageState === "empty" ? (
            // C. EMPTY STATE WRAPPER
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-5 p-6">
              <div className="space-y-1.5">
                <div className="h-10 w-10 bg-zinc-50 border border-zinc-200 text-lg flex items-center justify-center rounded-xl mx-auto mb-2 font-bold">
                  💬
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Ask Anything About Your History</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Select a starter query below to trigger semantic lookup, or type your own question to scan summaries.
                </p>
              </div>
              <div className="w-full space-y-2">
                {starterQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSelectQuestion(q)}
                    className="w-full flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 p-3 text-left text-xs font-semibold text-zinc-650 transition-colors cursor-pointer shadow-3xs"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // D. SUCCESS ACTIVE CONVERSATION STATE
            <div className="space-y-4">
              {activeMessagesList.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {/* Bot Avatar Icon */}
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-3xs">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}

                  {/* Message Bubble Card */}
                  <div className={`rounded-xl p-4 max-w-[80%] text-sm shadow-3xs border ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white border-blue-500 font-medium" 
                      : "bg-white text-zinc-800 border-zinc-200 leading-relaxed"
                  }`}>
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* Source References Badges */}
                    {msg.role === "assistant" && msg.references && msg.references.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-100 text-3xs font-semibold">
                        <span className="text-zinc-400 uppercase tracking-wider select-none">Sources:</span>
                        {msg.references.map((ref, rIdx) => (
                          <span 
                            key={ref.id || rIdx} 
                            title={`Relevance Score: ${(ref.score * 100).toFixed(1)}%`}
                            className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 text-zinc-600"
                          >
                            <Calendar className="h-2.5 w-2.5 text-zinc-450" /> {ref.date}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Avatar Icon */}
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-150 text-zinc-650 border border-zinc-200 shadow-3xs">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Bot Processing Loader bubble */}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-3xs">
                    <Bot className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 max-w-[80%] shadow-3xs flex items-center gap-2.5">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                    <span className="text-xs text-zinc-500 font-semibold animate-pulse">Searching semantic summaries...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input form box */}
        <CardFooter className="border-t border-zinc-100 p-3 bg-zinc-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(query);
            }}
            className="flex w-full items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask context assistant (e.g. 'What files did I edit?')"
              disabled={loading || pageState === "loading" || pageState === "error"}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none placeholder-zinc-400 focus:border-blue-500 transition-colors disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!query.trim() || loading || pageState === "loading" || pageState === "error"}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 h-10 w-10 flex items-center justify-center rounded-lg shadow-sm cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
