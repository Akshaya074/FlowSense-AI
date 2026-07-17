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
            <h3 className="text-sm font-bold text-zinc-900">Setup Instructions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* VS Code Setup */}
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-blue-600" /> VS Code Integration
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-zinc-650 space-y-2.5 leading-relaxed">
                    <li>Copy your **Personal Access Token** generated above.</li>
                    <li>Clone the public repo to get the extensions: <code className="bg-zinc-150 px-1 rounded text-[10px]">git clone https://github.com/Akshaya074/FlowSense-AI.git</code>.</li>
                    <li>Copy the **`vscode-extension`** folder from the repo into your VS Code extensions folder (on Windows: <code className="bg-zinc-150 px-1 rounded text-[10px]">%USERPROFILE%\.vscode\extensions</code>).</li>
                    <li>Or, open the **`vscode-extension`** folder in VS Code, run <code className="bg-zinc-150 px-1 rounded text-[10px]">npm install</code>, and press <kbd className="bg-white border px-1 rounded text-[10px]">F5</kbd> to launch.</li>
                    <li>Open VS Code Settings (`Ctrl+,`), search for **`FlowSense AI: Service URL`**, and set it to your deployed domain (e.g. `https://flow-sense-ai-self.vercel.app`).</li>
                    <li>Open the Command Palette (<kbd className="bg-white border px-1 rounded text-[10px]">Ctrl+Shift+P</kbd>). Select **`FlowSense AI: Set Personal Access Token`** and paste your token.</li>
                  </ol>
                </div>
              </div>

              {/* Browser Setup */}
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-blue-600" /> Chrome Browser Integration
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-zinc-650 space-y-2.5 leading-relaxed">
                    <li>Copy your **Personal Access Token** generated above.</li>
                    <li>Clone the public repo: <code className="bg-zinc-150 px-1 rounded text-[10px]">git clone https://github.com/Akshaya074/FlowSense-AI.git</code>.</li>
                    <li>Open Chrome and navigate to <code className="bg-zinc-150 px-1 rounded text-[10px]">chrome://extensions/</code>.</li>
                    <li>Toggle on **Developer Mode** in the top-right corner.</li>
                    <li>Click **Load Unpacked** (top-left) and select the **`browser-extension`** folder inside the cloned codebase directory.</li>
                    <li>Click the **FlowSense AI** icon in your Chrome extensions bar toolbar, paste your token and live Vercel URL, and click **Save**.</li>
                  </ol>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
