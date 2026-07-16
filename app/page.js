import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Search, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  // 1. Check user authentication server-side using Clerk auth()
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              FS
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              FlowSense <span className="text-blue-600">AI</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 cursor-pointer">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 cursor-pointer">
                    Go to Dashboard
                  </Button>
                </Link>
                <UserButton />
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              🚀 Recover Cognitive Context Instantly
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
              Never lose your <br />
              <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-600 to-indigo-600">
                coding context
              </span>{" "}
              again.
            </h1>
            <p className="text-lg text-zinc-600 sm:text-xl">
              FlowSense AI automatically tracks your IDE saving actions and documentation web searches, compiling daily digests and enabling semantic RAG query search to recover your mental state in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {!isSignedIn ? (
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]">
                    Get Started for Free
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-zinc-700 border-zinc-300 hover:bg-zinc-100 text-base px-8 py-6 rounded-xl">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t border-zinc-200 bg-zinc-100/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Seamless Developer Telemetry
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Built specifically for developers to recover cognitive focus without manual trackers or invasive logging.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <Card className="border border-zinc-200/80 bg-white transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-900">
                    IDE Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-600">
                  A lightweight VS Code extension monitors active text files opened and saved. No source code content is transmitted.
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border border-zinc-200/80 bg-white transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Search className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-900">
                    Doc Site Whitelisting
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-600">
                  Chrome Extension captures reference website paths strictly matches whitelisted developer pages (GitHub, MDN, Stack Overflow).
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border border-zinc-200/80 bg-white transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-900">
                    On-Demand RAG Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-600">
                  Compile daily markdown standups and query your work context semantically using generative AI context matching.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FlowSense AI. Designed as a developer placement portfolio project.</p>
        </div>
      </footer>
    </div>
  );
}
