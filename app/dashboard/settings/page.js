"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, RefreshCw, Terminal, Globe } from "lucide-react";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateToken = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/user/token", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to generate access token.");
      }
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      console.error("[FlowSense AI] Token generation error:", err);
      setErrorMsg("Error generating secure token. Please verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  // Generate a token on first mount if none is shown
  useEffect(() => {
    handleGenerateToken();
  }, []);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Settings</h1>
        <p className="text-zinc-500">Configure client credentials and secure access tokens.</p>
      </div>

      {/* Access Token Card */}
      <Card className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 py-4">
          <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-blue-600" /> Personal Access Token (PAT)
          </CardTitle>
          <CardDescription className="text-xs">
            Use this token to authenticate the VS Code and Browser extensions with your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Token Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 font-mono text-sm bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-lg select-all break-all text-zinc-700 flex items-center justify-between min-h-[44px]">
              {loading && !token ? (
                <span className="text-zinc-400 animate-pulse">Generating secure token...</span>
              ) : errorMsg ? (
                <span className="text-red-600 font-semibold text-xs">{errorMsg}</span>
              ) : (
                <span>{token || "No Token Active"}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!token || loading}
                variant="outline"
                className="text-zinc-700 border-zinc-200 hover:bg-zinc-100 flex-1 sm:flex-none justify-center cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy Token
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateToken}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 flex-1 sm:flex-none justify-center min-w-[140px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Regenerating
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="border-t border-zinc-150 pt-6 space-y-6">
            
            {/* Download Buttons Row */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                  📥 Download Extension Clients
                </h4>
                <p className="text-xs text-zinc-500 mt-1.5">
                  Get the companion extension builds directly to start logging your developer events.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <a 
                  href="/downloads/flowsense-vscode-extension.zip" 
                  download 
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-xs px-4.5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex-1 sm:flex-none text-center cursor-pointer"
                >
                  VS Code Plugin (.zip)
                </a>
                <a 
                  href="/downloads/flowsense-chrome-extension.zip" 
                  download 
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs px-4.5 py-2.5 hover:bg-blue-700 transition-colors shadow-sm flex-1 sm:flex-none text-center cursor-pointer"
                >
                  Chrome Extension (.zip)
                </a>
              </div>
            </div>

            <h3 className="text-sm font-bold text-zinc-900">Setup Instructions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* VS Code Setup Card */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-zinc-50 border-b border-zinc-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-bold text-zinc-900">VS Code Integration</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full select-none">IDE PLUGIN</span>
                </div>
                <div className="p-5 flex-1 space-y-4">
                  
                  {/* Step 1 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xs font-bold text-blue-600 border border-blue-100">1</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Download Extension Build</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Click the black button above to download the zip package, and unzip it on your computer.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xs font-bold text-blue-600 border border-blue-100">2</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Install in VS Code Extensions Folder</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Move the extracted <code className="bg-zinc-100 px-1 rounded font-mono text-[10px] text-zinc-800">vscode-extension</code> folder directly to:</p>
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] text-zinc-650 flex items-center gap-1.5"><strong className="text-zinc-700">Windows:</strong> <code className="bg-zinc-150 px-1 rounded text-2xs font-mono text-zinc-650">%USERPROFILE%\.vscode\extensions</code></p>
                        <p className="text-[10px] text-zinc-650 flex items-center gap-1.5"><strong className="text-zinc-700">macOS/Linux:</strong> <code className="bg-zinc-150 px-1 rounded text-2xs font-mono text-zinc-650">~/.vscode/extensions/</code></p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xs font-bold text-blue-600 border border-blue-100">3</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Configure Service Endpoint URL</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Restart VS Code. Open Settings (<kbd className="border bg-zinc-50 px-1 rounded text-[10px]">Ctrl+,</kbd> or <kbd className="border bg-zinc-50 px-1 rounded text-[10px]">Cmd+,</kbd>), search for <strong className="text-zinc-850">FlowSense</strong>, and paste your backend endpoint in the box:</p>
                      <code className="block w-full mt-1.5 p-2 bg-zinc-900 text-zinc-100 rounded-lg text-2xs font-mono select-all">https://flow-sense-ai-self.vercel.app/api/events</code>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xs font-bold text-blue-600 border border-blue-100">4</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Set Personal Access Token (PAT)</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Open the Command Palette (<kbd className="border bg-zinc-50 px-1 rounded text-[10px]">Ctrl+Shift+P</kbd>), select <strong className="text-zinc-850">FlowSense: Set Token</strong>, and paste the PAT you copied above.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Chrome Setup Card */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-zinc-50 border-b border-zinc-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-bold text-zinc-900">Chrome Browser Integration</span>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full select-none">BROWSER CLIENT</span>
                </div>
                <div className="p-5 flex-1 space-y-4">

                  {/* Step 1 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-2xs font-bold text-purple-600 border border-purple-100">1</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Download Extension Package</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Click the blue button above to download the Chrome extension ZIP, and extract it on your machine.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-2xs font-bold text-purple-600 border border-purple-100">2</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Load Unpacked in Chrome</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Open Chrome and go to <code className="bg-zinc-100 px-1 rounded font-mono text-[10px] text-zinc-800">chrome://extensions/</code>. Toggle on <strong className="text-zinc-800">Developer Mode</strong> (top-right), click <strong className="text-zinc-850">Load Unpacked</strong>, and select the extracted folder.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-2xs font-bold text-purple-600 border border-purple-100">3</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Enter Credentials & URL Link</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Click the FlowSense puzzle logo in your browser extensions bar. Enter your Personal Access Token, paste the live URL box below, and click **Save Settings**:</p>
                      <code className="block w-full mt-1.5 p-2 bg-zinc-900 text-zinc-100 rounded-lg text-2xs font-mono select-all">https://flow-sense-ai-self.vercel.app</code>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-2xs font-bold text-purple-600 border border-purple-100">4</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Verify Telemetry Tracking</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">Visit Stack Overflow, MDN Web Docs, or nextjs.org. The extension will automatically log visits under your timeline tab!</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
