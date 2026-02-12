"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/state/editorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Github,
  Key,
  Shield,
  Search,
  Lock,
  Globe,
  GitBranch,
  Clock,
  FolderGit2,
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────── */

const ACCEPTED_EXTENSIONS = [
  ".html", ".htm",
  ".css", ".scss", ".sass", ".less", ".module.css",
  ".jsx", ".tsx", ".js", ".ts",
  ".vue", ".svelte",
  ".json",
  ".md", ".mdx",
];

const ACCEPTED_MIME =
  ".html,.htm,.css,.scss,.sass,.less,.jsx,.tsx,.js,.ts,.vue,.svelte,.json,.md,.mdx";

const GITHUB_TOKEN_KEY = "ai-editor-github-token";
const GITHUB_PAT_URL =
  "https://github.com/settings/tokens/new?scopes=repo&description=AI+Editor";

/* ─── File-type detection ────────────────────────────────────── */

type FileCategory =
  | "html"
  | "css"
  | "react"
  | "typescript"
  | "javascript"
  | "vue"
  | "svelte"
  | "json"
  | "markdown"
  | "other";

function detectCategory(fileName: string): FileCategory {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  if ([".html", ".htm"].includes(ext)) return "html";
  if ([".css", ".scss", ".sass", ".less", ".module.css"].includes(ext))
    return "css";
  if ([".jsx", ".tsx"].includes(ext)) return "react";
  if ([".ts"].includes(ext)) return "typescript";
  if ([".js"].includes(ext)) return "javascript";
  if ([".vue"].includes(ext)) return "vue";
  if ([".svelte"].includes(ext)) return "svelte";
  if ([".json"].includes(ext)) return "json";
  if ([".md", ".mdx"].includes(ext)) return "markdown";
  return "other";
}

const CATEGORY_META: Record<
  FileCategory,
  { label: string; bg: string; text: string }
> = {
  html: { label: "HTML", bg: "bg-orange-500/10", text: "text-orange-400" },
  css: { label: "CSS", bg: "bg-blue-500/10", text: "text-blue-400" },
  react: { label: "React", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  typescript: { label: "TS", bg: "bg-blue-600/10", text: "text-blue-400" },
  javascript: { label: "JS", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  vue: { label: "Vue", bg: "bg-green-500/10", text: "text-green-400" },
  svelte: { label: "Svelte", bg: "bg-orange-600/10", text: "text-orange-400" },
  json: { label: "JSON", bg: "bg-zinc-500/10", text: "text-zinc-400" },
  markdown: { label: "MD", bg: "bg-purple-500/10", text: "text-purple-400" },
  other: { label: "File", bg: "bg-zinc-500/10", text: "text-zinc-400" },
};

/* ─── Types ──────────────────────────────────────────────────── */

interface UploadedFile {
  name: string;
  category: FileCategory;
  content: string;
  size: number;
}

interface RepoItem {
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  updatedAt: string;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
}

/* ─── Language color map ─────────────────────────────────────── */

const LANGUAGE_COLORS: Record<string, string> = {
  HTML: "bg-orange-500",
  CSS: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  TypeScript: "bg-blue-600",
  Python: "bg-green-500",
  Java: "bg-red-500",
  Ruby: "bg-red-600",
  PHP: "bg-violet-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-700",
  Swift: "bg-orange-500",
  Kotlin: "bg-purple-500",
};

function languageColor(lang: string | null): string {
  if (!lang) return "bg-zinc-500";
  return LANGUAGE_COLORS[lang] ?? "bg-zinc-500";
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* ─── Upload Tab (existing functionality) ────────────────────── */

function UploadTab({
  onSuccess,
}: {
  onSuccess: (label: string) => void;
}) {
  const { setPage } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ACCEPTED_EXTENSIONS.includes(ext)) return null;
      const content = await file.text();
      return {
        name: file.name,
        category: detectCategory(file.name),
        content,
        size: file.size,
      };
    },
    []
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const newFiles: UploadedFile[] = [];
      for (const file of Array.from(fileList)) {
        const processed = await processFile(file);
        if (processed) newFiles.push(processed);
      }
      if (newFiles.length === 0) {
        setError(
          "No supported files found. Upload HTML, CSS, JSX, TSX, Vue, Svelte, or other web files."
        );
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImport = useCallback(async () => {
    if (files.length === 0) {
      setError("Please upload at least one file.");
      return;
    }
    setIsImporting(true);
    setError(null);
    try {
      const fileBundle = files.map((f) => ({
        name: f.name,
        category: f.category,
        content: f.content,
      }));

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileBundle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");
      setPage(data.page, `Imported: ${files[0].name}`);
      setSuccess(true);
      onSuccess(files[0].name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Import failed. Please try again."
      );
    } finally {
      setIsImporting(false);
    }
  }, [files, setPage, onSuccess]);

  /** Build category summary counts */
  const categoryCounts = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1;
    return acc;
  }, {});
  const hasFiles = files.length > 0;

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-700/80 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/60"
        } ${success ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isDragging
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
            }`}
          >
            <FileCode className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-1">
            {isDragging ? "Drop files here" : "Drag & drop your project files"}
          </p>
          <p className="text-xs text-zinc-500">
            HTML, CSS, JSX, TSX, Vue, Svelte, JS, TS, JSON, SCSS
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIME}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">
                Uploaded Files
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                {files.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 flex-wrap justify-end">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span key={cat} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_META[cat as FileCategory].text.replace("text-", "bg-")}`} />
                  {count} {CATEGORY_META[cat as FileCategory].label}
                </span>
              ))}
            </div>
          </div>
          <ScrollArea className="max-h-48">
            <div className="divide-y divide-zinc-800/50">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        CATEGORY_META[file.category].bg
                      } ${CATEGORY_META[file.category].text}`}
                    >
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300 leading-relaxed">
            Import successful! Redirecting to editor...
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI parses React, Next.js, Vue, Svelte, and vanilla projects</span>
        </div>
        <Button
          onClick={handleImport}
          disabled={!hasFiles || isImporting || success}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 h-auto rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing with AI...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Imported!
            </>
          ) : (
            <>
              Import & Edit
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── GitHub Tab ──────────────────────────────────────────────── */

function GitHubTab({
  onSuccess,
}: {
  onSuccess: (label: string) => void;
}) {
  const { setPage } = useEditorStore();

  const [token, setToken] = useState("");
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [search, setSearch] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load saved token from session storage (cleared when browser tab closes)
  useEffect(() => {
    const saved = sessionStorage.getItem(GITHUB_TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
    if (value.trim()) {
      sessionStorage.setItem(GITHUB_TOKEN_KEY, value.trim());
    } else {
      sessionStorage.removeItem(GITHUB_TOKEN_KEY);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (!token.trim()) {
      setError("Please enter your GitHub Personal Access Token.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to connect");

      setRepos(data.repos);
      setIsConnected(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to GitHub."
      );
    } finally {
      setIsConnecting(false);
    }
  }, [token]);

  const handleImportRepo = useCallback(async () => {
    if (!selectedRepo) return;

    setIsImporting(true);
    setError(null);

    const [owner, repo] = selectedRepo.fullName.split("/");

    try {
      const response = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          owner,
          repo,
          branch: selectedRepo.defaultBranch,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");

      setPage(data.page, `GitHub: ${selectedRepo.fullName}`);
      setSuccess(true);
      onSuccess(selectedRepo.fullName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Import failed. Please try again."
      );
    } finally {
      setIsImporting(false);
    }
  }, [selectedRepo, token, setPage, onSuccess]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setRepos([]);
    setSelectedRepo(null);
    setSearch("");
    setError(null);
  }, []);

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Not connected yet — show token input
  if (!isConnected) {
    return (
      <div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-zinc-400" />
              <label className="text-xs font-semibold text-zinc-300">
                GitHub Personal Access Token
              </label>
            </div>
            <Input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="bg-zinc-900/60 border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 h-10"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-500">
                Stored in this session only — cleared when you close the tab. Needs{" "}
                <code className="text-zinc-400">repo</code> scope.{" "}
                <a
                  href={GITHUB_PAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  Create one here
                </a>
              </span>
            </div>
          </div>

          <div className="px-5 py-4">
            <Button
              onClick={handleConnect}
              disabled={!token.trim() || isConnecting}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium h-10 rounded-lg disabled:opacity-50 text-sm border border-zinc-700/50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Connect to GitHub
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Connected — show repo browser
  return (
    <div>
      {/* Connection header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">
            Connected to GitHub
          </span>
          <span className="text-[10px] text-zinc-500">
            {repos.length} repositories
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors underline"
        >
          Disconnect
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <Input
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900/60 border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 h-9 pl-9"
        />
      </div>

      {/* Repo list */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
        <ScrollArea className="h-[420px]">
          {filteredRepos.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">
                {search
                  ? "No repositories match your search."
                  : "No repositories found."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {filteredRepos.map((repo) => {
                const isSelected = selectedRepo?.fullName === repo.fullName;
                return (
                  <button
                    key={repo.fullName}
                    onClick={() => setSelectedRepo(isSelected ? null : repo)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-indigo-500/10 border-l-2 border-indigo-500"
                        : "hover:bg-zinc-800/30 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-zinc-200 truncate">
                            {repo.name}
                          </span>
                          {repo.isPrivate ? (
                            <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-[10px] text-zinc-500 truncate leading-relaxed">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          {repo.language && (
                            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <span
                                className={`w-2 h-2 rounded-full ${languageColor(
                                  repo.language
                                )}`}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <GitBranch className="w-2.5 h-2.5" />
                            {repo.defaultBranch}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(repo.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300 leading-relaxed">
            Import successful! Redirecting to editor...
          </p>
        </div>
      )}

      {/* Import button */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI detects React, Next.js, Vue, Svelte, and HTML projects</span>
        </div>
        <Button
          onClick={handleImportRepo}
          disabled={!selectedRepo || isImporting || success}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 h-auto rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Imported!
            </>
          ) : (
            <>
              Import & Edit
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Import Page ───────────────────────────────────────── */

export default function ImportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"upload" | "github">("github");

  const handleSuccess = useCallback(
    (_label: string) => {
      setTimeout(() => router.push("/editor"), 1500);
    },
    [router]
  );

  return (
    <div className="h-full flex items-center justify-center bg-zinc-950/50 p-6 overflow-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Import Your Website
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Connect your GitHub repo or upload files directly. Our AI will parse
            them into an editable canvas so you can customize everything visually.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-1">
          <button
            onClick={() => setTab("github")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === "github"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === "upload"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Files
          </button>
        </div>

        {/* Tab content */}
        {tab === "upload" ? (
          <UploadTab onSuccess={handleSuccess} />
        ) : (
          <GitHubTab onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}
