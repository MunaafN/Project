import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openaiClient";
import type { PatchAction } from "@/lib/schema";

const SYSTEM_PROMPT = `You are an AI text rewriting assistant. You receive a piece of text, a target node ID, a target prop name, and a rewrite mode.

Rewrite modes:
- "professional": Make the text sound corporate, polished, and authoritative.
- "casual": Make the text friendly, warm, and conversational.
- "concise": Shorten the text while keeping the core meaning.
- "expand": Elaborate on the text with more detail and persuasion.
- "creative": Make the text more unique, imaginative, and engaging.

You MUST return ONLY valid JSON with a single key "actions" containing exactly ONE action of type "UPDATE_TEXT".
You MUST NEVER return JSX, HTML, or raw code.

Example response:
{
  "actions": [
    {
      "targetId": "hero-1",
      "type": "UPDATE_TEXT",
      "changes": { "heading": "The rewritten text goes here" }
    }
  ]
}`;

interface AIRewriteTextRequest {
  text: string;
  targetId: string;
  propName: string;
  mode: "professional" | "casual" | "concise" | "expand" | "creative";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIRewriteTextRequest;
    const { text, targetId, propName, mode } = body;

    if (!text || !targetId || !propName || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: text, targetId, propName, mode" },
        { status: 400 }
      );
    }

    const VALID_MODES = ["professional", "casual", "concise", "expand", "creative"];
    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json(
        { error: "Invalid rewrite mode." },
        { status: 400 }
      );
    }

    const userMessage = JSON.stringify({ text, targetId, propName, mode });

    const result = (await chatCompletion(SYSTEM_PROMPT, userMessage)) as {
      actions: PatchAction[];
    };

    if (!result.actions || !Array.isArray(result.actions)) {
      return NextResponse.json(
        { error: "AI returned invalid response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({ actions: result.actions });
  } catch (error) {
    console.error("AI Rewrite Text error:", error);

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
      { error: "An unexpected error occurred while rewriting text." },
      { status: 500 }
    );
  }
}
