import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openaiClient";
import type { PageDocument, PatchAction } from "@/lib/schema";

const SYSTEM_PROMPT = `You are an AI website editor tasked with regenerating a single section of a page.

You receive the current page JSON schema and a target section ID. Your job is to generate a completely new version of that section while keeping it appropriate for the page context.

You MUST return ONLY valid JSON with a single key "actions" containing exactly ONE action of type "REPLACE_SECTION".
You MUST NEVER return JSX, HTML, or raw code.

The action must have:
- "targetId": the ID of the section to replace
- "type": "REPLACE_SECTION"
- "changes": { "node": { full new node object } }

The new node MUST include: id (same as targetId), type, props, style, children (empty array), locked (false).

Available types: HeroCentered, HeroSplitImageLeft, PricingGrid, Testimonials, or primitive elements (div, section, p, h1, h2, etc.)

Generate creative, professional content for the section. Vary the style and text from the original.

Example response:
{
  "actions": [
    {
      "targetId": "hero-1",
      "type": "REPLACE_SECTION",
      "changes": {
        "node": {
          "id": "hero-1",
          "type": "HeroCentered",
          "props": {
            "heading": "New Creative Heading",
            "subheading": "New compelling subheading",
            "ctaText": "Try Now",
            "ctaLink": "#"
          },
          "style": {
            "background": "#0a0a0a",
            "padding": "6rem 2rem"
          },
          "children": [],
          "locked": false
        }
      }
    }
  ]
}`;

interface AIRegenerateRequest {
  page: PageDocument;
  targetId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIRegenerateRequest;
    const { page, targetId } = body;

    if (!page || !targetId) {
      return NextResponse.json(
        { error: "Missing required fields: page, targetId" },
        { status: 400 }
      );
    }

    const userMessage = JSON.stringify({ page, targetId });

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
    console.error("AI Regenerate error:", error);

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
      { error: "An unexpected error occurred while regenerating the section." },
      { status: 500 }
    );
  }
}
