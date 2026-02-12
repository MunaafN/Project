import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openaiClient";
import type { PageDocument } from "@/lib/schema";
import {
  IMPORT_SYSTEM_PROMPT,
  MAX_FILE_SIZE,
  MAX_TOTAL_PAYLOAD,
  MAX_FILES_COUNT,
  prioritizeFiles,
} from "@/lib/importPrompt";

/* ─── Types ──────────────────────────────────────────────────── */

interface FileEntry {
  name: string;
  category: string;
  content: string;
}

/** Legacy payload shape (HTML + optional CSS) */
interface LegacyImportRequest {
  html: string;
  css?: string;
}

/** New multi-file payload */
interface MultiFileImportRequest {
  files: FileEntry[];
}

type ImportRequest = LegacyImportRequest | MultiFileImportRequest;

function isMultiFile(body: ImportRequest): body is MultiFileImportRequest {
  return "files" in body && Array.isArray(body.files);
}

/* ─── Route ──────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequest;

    let filesToSend: { name: string; content: string }[];

    if (isMultiFile(body)) {
      /* ── Multi-file bundle ── */
      if (body.files.length === 0) {
        return NextResponse.json(
          { error: "No files provided." },
          { status: 400 }
        );
      }

      if (body.files.length > MAX_FILES_COUNT) {
        return NextResponse.json(
          {
            error: `Too many files. Maximum is ${MAX_FILES_COUNT}. Upload only the key source files.`,
          },
          { status: 400 }
        );
      }

      let totalSize = 0;
      for (const file of body.files) {
        if (!file.name || !file.content || typeof file.content !== "string") {
          return NextResponse.json(
            { error: `Invalid file entry: ${file.name ?? "unnamed"}` },
            { status: 400 }
          );
        }
        if (file.content.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `File "${file.name}" exceeds the 500KB size limit.`,
            },
            { status: 400 }
          );
        }
        totalSize += file.content.length;
      }

      if (totalSize > MAX_TOTAL_PAYLOAD) {
        return NextResponse.json(
          {
            error: "Total upload size exceeds 800KB. Upload fewer or smaller files.",
          },
          { status: 400 }
        );
      }

      filesToSend = prioritizeFiles(
        body.files.map((f) => ({ name: f.name, content: f.content }))
      );
    } else {
      /* ── Legacy HTML + CSS payload (backward compatible) ── */
      const { html, css } = body;

      if (!html || typeof html !== "string" || html.trim().length === 0) {
        return NextResponse.json(
          { error: "No content provided." },
          { status: 400 }
        );
      }

      if (html.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "HTML file is too large. Maximum size is 500KB." },
          { status: 400 }
        );
      }

      filesToSend = [{ name: "index.html", content: html.slice(0, 80000) }];
      if (css && typeof css === "string" && css.trim().length > 0) {
        filesToSend.push({
          name: "styles.css",
          content: css.slice(0, 30000),
        });
      }
    }

    /* ── Build user message ── */
    const userMessage = JSON.stringify(
      filesToSend.map((f) => ({ file: f.name, content: f.content }))
    );

    const result = (await chatCompletion(
      IMPORT_SYSTEM_PROMPT,
      userMessage
    )) as PageDocument;

    if (!result.nodes || !Array.isArray(result.nodes)) {
      return NextResponse.json(
        { error: "AI failed to parse the files into a valid page structure." },
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

    return NextResponse.json({ page: result });
  } catch (error) {
    console.error("Import error:", error);

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
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during import." },
      { status: 500 }
    );
  }
}
