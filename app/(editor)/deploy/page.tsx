"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/state/editorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Shield,
  Copy,
  Check,
} from "lucide-react";

const NETLIFY_TOKEN_KEY = "ai-editor-netlify-token";
const NETLIFY_TOKEN_HELP_URL =
  "https://app.netlify.com/user/applications#personal-access-tokens";

interface DeployResult {
  url: string;
  siteId: string;
  siteName: string;
  deployId: string;
  adminUrl: string;
}

export default function DeployPage() {
  const { page } = useEditorStore();

  const [token, setToken] = useState("");
  const [siteName, setSiteName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeployResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Load saved token from session storage (cleared when browser tab closes)
  useEffect(() => {
    const saved = sessionStorage.getItem(NETLIFY_TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  // Save token to session storage (not localStorage — tokens shouldn't persist indefinitely)
  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
    if (value.trim()) {
      sessionStorage.setItem(NETLIFY_TOKEN_KEY, value.trim());
    } else {
      sessionStorage.removeItem(NETLIFY_TOKEN_KEY);
    }
  }, []);

  const handleDeploy = useCallback(async () => {
    if (!token.trim()) {
      setError("Please enter your Netlify personal access token.");
      return;
    }

    if (page.nodes.length === 0) {
      setError("Your canvas is empty. Build or import a page first before deploying.");
      return;
    }

    setIsDeploying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          netlifyToken: token.trim(),
          siteName: siteName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  }, [token, siteName, page]);

  const copyUrl = useCallback(() => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const hasContent = page.nodes.length > 0;

  return (
    <div className="h-full flex items-center justify-center bg-zinc-950/50 p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Deploy to Netlify</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Export your canvas as a standalone website and deploy it live to Netlify
            with a single click.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          {/* Token input */}
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-zinc-400" />
              <label className="text-xs font-semibold text-zinc-300">
                Netlify Personal Access Token
              </label>
            </div>
            <Input
              type="password"
              placeholder="nfp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="bg-zinc-900/60 border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 h-10"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-500">
                Stored in this session only — cleared when you close the tab.{" "}
                <a
                  href={NETLIFY_TOKEN_HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  Get your token here
                </a>
              </span>
            </div>
          </div>

          {/* Site name input */}
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-zinc-400" />
              <label className="text-xs font-semibold text-zinc-300">
                Site Name
                <span className="text-zinc-500 font-normal ml-1">(optional)</span>
              </label>
            </div>
            <Input
              type="text"
              placeholder="my-awesome-site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="bg-zinc-900/60 border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 h-10"
            />
            <p className="text-[10px] text-zinc-500 mt-2">
              Will be accessible at <span className="text-zinc-400">{siteName || "your-site"}.netlify.app</span>
            </p>
          </div>

          {/* Deploy button */}
          <div className="px-5 py-4">
            <Button
              onClick={handleDeploy}
              disabled={!token.trim() || !hasContent || isDeploying}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-11 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying to Netlify...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Now
                </>
              )}
            </Button>

            {!hasContent && (
              <p className="text-[10px] text-amber-400/80 mt-2 text-center">
                Your canvas is empty. Build or import content first.
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 overflow-hidden">
            <div className="px-4 py-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-300 mb-1">
                  Deployed successfully!
                </p>
                <p className="text-[10px] text-emerald-400/70">
                  Your site is now live at:
                </p>
              </div>
            </div>

            <div className="px-4 pb-3 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-900/60 rounded-lg px-3 py-2 border border-zinc-800/60 min-w-0">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-300 hover:text-emerald-200 truncate underline"
                >
                  {result.url}
                </a>
              </div>
              <button
                onClick={copyUrl}
                className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="px-4 pb-4 flex items-center gap-2">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs h-9"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View Live Site
                </Button>
              </a>
              <a
                href={result.adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full border-zinc-700/80 text-zinc-300 hover:bg-zinc-800/40 text-xs h-9"
                >
                  Netlify Dashboard
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
