import { NextRequest, NextResponse } from "next/server";

/**
 * Security middleware:
 * 1. CSRF origin check on mutating API requests
 * 2. In-memory rate limiting per IP on AI endpoints (prevents OpenAI cost abuse)
 */

/* ─── Rate Limiter ──────────────────────────────────────────── */

interface RateEntry {
  count: number;
  resetAt: number;
}

const RATE_WINDOW_MS = 60_000; // 1 minute window
const MAX_AI_REQUESTS_PER_WINDOW = 20; // AI endpoints: 20 req/min per IP
const MAX_GITHUB_REQUESTS_PER_WINDOW = 30; // GitHub endpoints: 30 req/min per IP

const rateLimitMap = new Map<string, RateEntry>();

/** Clean up expired entries periodically to prevent memory leak */
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key);
  }
}

function checkRateLimit(key: string, maxRequests: number): boolean {
  cleanupExpired();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/* ─── Helpers ───────────────────────────────────────────────── */

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** AI endpoint paths that consume OpenAI credits */
const AI_PATHS = ["/api/ai-edit", "/api/ai-regenerate", "/api/ai-rewrite-text", "/api/import", "/api/github/import"];

/** GitHub-related paths */
const GITHUB_PATHS = ["/api/github/repos"];

/** All API paths that should have CSRF origin checking */
const PROTECTED_API_PREFIX = "/api/";

/* ─── Middleware ─────────────────────────────────────────────── */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith(PROTECTED_API_PREFIX)) {
    return NextResponse.next();
  }

  // 1. CSRF: Check Origin header on all POST/PUT/DELETE API requests
  if (["POST", "PUT", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // In production, require Origin to match Host
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "Forbidden: cross-origin request" },
          { status: 403 }
        );
      }
    }
  }

  // 2. Rate limiting
  const ip = getClientIp(request);

  if (AI_PATHS.some((p) => pathname.startsWith(p))) {
    if (!checkRateLimit(`ai:${ip}`, MAX_AI_REQUESTS_PER_WINDOW)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }
  }

  if (GITHUB_PATHS.some((p) => pathname.startsWith(p))) {
    if (!checkRateLimit(`gh:${ip}`, MAX_GITHUB_REQUESTS_PER_WINDOW)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
