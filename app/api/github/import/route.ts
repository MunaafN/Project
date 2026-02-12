import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openaiClient";
import type { PageDocument } from "@/lib/schema";
import {
  IMPORT_SYSTEM_PROMPT,
  COMPONENT_EXTENSIONS,
  STYLE_EXTENSIONS,
  MARKUP_EXTENSIONS,
  CONFIG_FILES,
  detectFramework,
  prioritizeFiles,
} from "@/lib/importPrompt";

const GITHUB_API = "https://api.github.com";

/* ─── Types ──────────────────────────────────────────────────── */

interface GitHubImportRequest {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

interface TreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

/* ─── Constants ──────────────────────────────────────────────── */

/** Maximum number of files we'll fetch from a repo */
const MAX_FETCH_FILES = 25;

/** Maximum combined character count sent to AI */
const MAX_AI_INPUT_CHARS = 120_000;

/** Validates GitHub owner/repo names: alphanumeric, hyphens, underscores, dots */
const SAFE_GITHUB_NAME = /^[a-zA-Z0-9._-]+$/;

/** All extensions we care about (components + styles + markup + config) */
const ALL_EXTENSIONS = [
  ...COMPONENT_EXTENSIONS,
  ...STYLE_EXTENSIONS,
  ...MARKUP_EXTENSIONS,
];

/* ─── Helpers ────────────────────────────────────────────────── */

function getExtension(filePath: string): string {
  const basename = filePath.split("/").pop() ?? filePath;
  const dot = basename.lastIndexOf(".");
  return dot >= 0 ? basename.slice(dot).toLowerCase() : "";
}

function getBasename(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function isConfigFile(filePath: string): boolean {
  const basename = getBasename(filePath);
  return CONFIG_FILES.includes(basename.toLowerCase());
}

function isImportableFile(filePath: string): boolean {
  const ext = getExtension(filePath);
  return ALL_EXTENSIONS.includes(ext) || isConfigFile(filePath);
}

/** Depth in the directory tree (0 = root) */
function fileDepth(filePath: string): number {
  return filePath.split("/").length - 1;
}

/**
 * Score a file for import priority. Lower = higher priority.
 * Considers: entry point names, file type, directory depth.
 */
function scoreFile(filePath: string, framework: string): number {
  const basename = getBasename(filePath).toLowerCase();
  const ext = getExtension(filePath);
  const depth = fileDepth(filePath);
  const pathLower = filePath.toLowerCase();

  let score = 100;

  // Config files are very high priority
  if (basename === "package.json" && depth === 0) return 1;
  if (basename.startsWith("tailwind.config")) return 2;

  // Framework-specific entry points
  if (framework === "nextjs") {
    if (pathLower.match(/app\/(page|layout)\.(tsx|jsx|ts|js)$/)) score = 5;
    else if (pathLower.match(/pages\/index\.(tsx|jsx|ts|js)$/)) score = 6;
    else if (pathLower.match(/app\/.*\/(page|layout)\.(tsx|jsx|ts|js)$/)) score = 10;
    else if (pathLower.match(/pages\/.*\.(tsx|jsx)$/)) score = 12;
    else if (pathLower.includes("/components/")) score = 20 + depth;
  } else if (framework === "react") {
    if (basename.match(/^(app|index|main)\.(tsx|jsx)$/)) score = 5;
    else if (pathLower.includes("/components/")) score = 15 + depth;
    else if (pathLower.includes("/pages/")) score = 18 + depth;
  } else if (framework === "vue" || framework === "nuxt") {
    if (basename === "app.vue") score = 5;
    else if (pathLower.match(/pages\/index\.vue$/)) score = 6;
    else if (ext === ".vue") score = 15 + depth;
  } else if (framework === "svelte") {
    if (pathLower.match(/routes\/\+page\.svelte$/)) score = 5;
    else if (basename.match(/^(app|main)\.(svelte|ts|js)$/)) score = 6;
    else if (ext === ".svelte") score = 15 + depth;
  } else {
    // Vanilla
    if (basename === "index.html" && depth === 0) score = 3;
    else if (ext === ".html") score = 10 + depth;
  }

  // Style files are moderately important
  if (STYLE_EXTENSIONS.includes(ext)) {
    if (basename.match(/^(globals?|app|index|main|style)\./)) score = Math.min(score, 8);
    else score = Math.min(score, 25 + depth);
  }

  // Component files by extension
  if (COMPONENT_EXTENSIONS.includes(ext) && score > 30) {
    score = 30 + depth;
  }

  // Markup files
  if (MARKUP_EXTENSIONS.includes(ext) && score > 10) {
    score = 10 + depth;
  }

  // Penalize deep nesting, node_modules, test files, config
  if (pathLower.includes("node_modules/")) score = 999;
  if (pathLower.includes("__tests__/") || pathLower.includes(".test.") || pathLower.includes(".spec.")) score = 998;
  if (pathLower.includes(".stories.")) score = 997;
  if (pathLower.includes("dist/") || pathLower.includes("build/") || pathLower.includes(".next/")) score = 996;

  return score;
}

/** Fetch raw file content from GitHub */
async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  branch: string
): Promise<string> {
  const encodedPath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encodedPath}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }
  return response.text();
}

/** Fetch the repo tree with fallback from main → master */
async function fetchTree(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<{ tree: TreeItem[]; resolvedBranch: string }> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const treeUrl = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const response = await fetch(treeUrl, { headers });

  if (response.ok) {
    const data = await response.json();
    return { tree: data.tree, resolvedBranch: branch };
  }

  // Try "master" fallback
  if (response.status === 404 && branch === "main") {
    const fallbackUrl = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/master?recursive=1`;
    const fallback = await fetch(fallbackUrl, { headers });
    if (fallback.ok) {
      const data = await fallback.json();
      return { tree: data.tree, resolvedBranch: "master" };
    }
  }

  throw new Error(
    `Could not access repository tree (HTTP ${response.status}). Check that the repo exists and is not empty.`
  );
}

/* ─── Route Handler ──────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GitHubImportRequest;
    const { token, owner, repo, branch } = body;

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "Missing required fields: token, owner, repo" },
        { status: 400 }
      );
    }

    if (!SAFE_GITHUB_NAME.test(owner) || !SAFE_GITHUB_NAME.test(repo)) {
      return NextResponse.json(
        { error: "Invalid repository owner or name." },
        { status: 400 }
      );
    }

    if (branch && !SAFE_GITHUB_NAME.test(branch)) {
      return NextResponse.json(
        { error: "Invalid branch name." },
        { status: 400 }
      );
    }

    const targetBranch = branch || "main";

    /* ── 1. Fetch repo tree ── */
    const { tree, resolvedBranch } = await fetchTree(
      token,
      owner,
      repo,
      targetBranch
    );

    /* ── 2. Filter to importable files ── */
    const blobs = tree.filter(
      (item) =>
        item.type === "blob" &&
        isImportableFile(item.path) &&
        !item.path.toLowerCase().includes("node_modules/") &&
        !item.path.toLowerCase().includes(".next/") &&
        !item.path.toLowerCase().includes("dist/") &&
        !item.path.toLowerCase().includes("build/") &&
        (item.size ?? 0) < 500_000 // Skip files > 500KB
    );

    if (blobs.length === 0) {
      return NextResponse.json(
        {
          error:
            "No importable files found. This import supports HTML, CSS, React (JSX/TSX), Vue, Svelte, and more.",
        },
        { status: 400 }
      );
    }

    /* ── 3. Detect framework ── */
    let framework = "vanilla";
    const packageJsonEntry = blobs.find(
      (b) => b.path === "package.json" || b.path === "./package.json"
    );

    if (packageJsonEntry) {
      try {
        const packageJsonContent = await fetchFileContent(
          token,
          owner,
          repo,
          packageJsonEntry.path,
          resolvedBranch
        );
        const pkg = JSON.parse(packageJsonContent);
        framework = detectFramework(
          pkg.dependencies ?? {},
          pkg.devDependencies ?? {}
        );
      } catch {
        // Failed to parse package.json, continue with vanilla detection
      }
    }

    // Fallback framework detection from file extensions
    if (framework === "vanilla") {
      const extensions = blobs.map((b) => getExtension(b.path));
      if (extensions.some((e) => [".tsx", ".jsx"].includes(e))) {
        framework = "react";
      } else if (extensions.some((e) => e === ".vue")) {
        framework = "vue";
      } else if (extensions.some((e) => e === ".svelte")) {
        framework = "svelte";
      }
    }

    /* ── 4. Score and pick best files ── */
    const scored = blobs
      .map((b) => ({ ...b, score: scoreFile(b.path, framework) }))
      .filter((b) => b.score < 900) // Exclude penalized files
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_FETCH_FILES);

    /* ── 5. Fetch file contents ── */
    const fileContents: { name: string; content: string }[] = [];

    for (const file of scored) {
      try {
        const content = await fetchFileContent(
          token,
          owner,
          repo,
          file.path,
          resolvedBranch
        );
        fileContents.push({ name: file.path, content });
      } catch {
        // Skip files that fail to fetch
      }
    }

    if (fileContents.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch any files from the repository." },
        { status: 500 }
      );
    }

    /* ── 6. Prioritize and send to AI ── */
    const prioritized = prioritizeFiles(fileContents, MAX_AI_INPUT_CHARS);

    const userMessage = JSON.stringify({
      framework,
      files: prioritized.map((f) => ({ file: f.name, content: f.content })),
    });

    const result = (await chatCompletion(
      IMPORT_SYSTEM_PROMPT,
      userMessage
    )) as PageDocument;

    if (!result.nodes || !Array.isArray(result.nodes)) {
      return NextResponse.json(
        {
          error:
            "AI failed to parse the repository into a valid page structure.",
        },
        { status: 500 }
      );
    }

    if (!result.theme) {
      result.theme = {
        primaryColor: "#6366f1",
        font: "Inter",
        radius: "0.5rem",
        spacing: "1rem",
      };
    }

    return NextResponse.json({
      page: result,
      framework,
      importedFiles: prioritized.map((f) => f.name),
    });
  } catch (error) {
    console.error("GitHub import error:", error);

    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured." },
          { status: 503 }
        );
      }
      if (error.name === "AbortError" || error.message.includes("abort")) {
        return NextResponse.json(
          { error: "The AI request timed out. Please try again." },
          { status: 504 }
        );
      }
      if (error.message.includes("Could not access repository tree")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during import." },
      { status: 500 }
    );
  }
}
