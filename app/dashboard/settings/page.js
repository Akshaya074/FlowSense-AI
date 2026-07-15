"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [token, setToken] = useState("fs_pat_d3v_t0k3n_flowsense_mvp_7a2b9");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      // Simulate generating a new key
      const randomString = Math.random().toString(36).substring(2, 11);
      setToken(`fs_pat_live_${randomString}`);
      setRegenerating(false);
    }, 1000);
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
            <div className="flex-1 font-mono text-sm bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-lg select-all break-all text-zinc-700 flex items-center justify-between">
              <span>{token}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="text-zinc-700 border-zinc-255 hover:bg-zinc-100 flex-1 sm:flex-none justify-center"
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
                onClick={handleRegenerate}
                disabled={regenerating}
                className="bg-blue-600 text-white hover:bg-blue-700 flex-1 sm:flex-none justify-center min-w-[140px]"
              >
                {regenerating ? (
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
          <div className="border-t border-zinc-150 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900">Setup Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VS Code Setup */}
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide mb-2">VS Code Integration</h4>
                <ol className="list-decimal list-inside text-xs text-zinc-600 space-y-1.5 leading-relaxed">
                  <li>Install the <strong>FlowSense Telemetry</strong> extension.</li>
                  <li>Open command palette (<kbd className="bg-white border px-1 rounded shadow-sm text-[10px]">Ctrl+Shift+P</kbd>).</li>
                  <li>Type <span className="font-semibold text-zinc-700">"FlowSense: Set Token"</span>.</li>
                  <li>Paste your Personal Access Token and hit enter.</li>
                </ol>
              </div>

              {/* Browser Setup */}
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide mb-2">Browser Integration</h4>
                <ol className="list-decimal list-inside text-xs text-zinc-600 space-y-1.5 leading-relaxed">
                  <li>Click the <strong>FlowSense AI</strong> extension logo.</li>
                  <li>Paste your token inside the prompt options box.</li>
                  <li>Click <span className="font-semibold text-zinc-700">"Save Token"</span> to verify link setup.</li>
                  <li>Visit Stack Overflow or MDN to begin logging visits.</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
