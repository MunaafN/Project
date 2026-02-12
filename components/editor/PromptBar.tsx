"use client";

import React, { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/state/editorStore";
import type { PatchAction } from "@/lib/schema";
import {
  Sparkles,
  Loader2,
  ArrowUp,
} from "lucide-react";

/** Quick action suggestions — context-aware based on canvas state */
const EMPTY_SUGGESTIONS = [
  "Build a login page",
  "Create a landing page with hero",
  "Make a pricing page",
  "Build a contact form",
  "Create a dashboard layout",
];

const ELEMENT_SUGGESTIONS = [
  "Make this bigger",
  "Change the color to match the theme",
  "Make the text more compelling",
  "Add more padding",
  "Make this bold",
];

const GENERAL_SUGGESTIONS = [
  "Add a new section below",
  "Build a FAQ section",
  "Add a footer",
  "Create a testimonials section",
  "Add a contact form",
];

export function PromptBar() {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    page,
    selectedNodeId,
    lockedNodeIds,
    constraints,
    applyPatch,
    isLoading,
    setLoading,
    setError,
  } = useEditorStore();

  const handleSubmit = useCallback(async (overridePrompt?: string) => {
    const text = overridePrompt ?? prompt;
    if (!text.trim() || isLoading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text.trim(),
          page,
          targetId: selectedNodeId,
          constraints,
          lockedNodeIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Request failed");
      }

      const data = (await response.json()) as { actions: PatchAction[] };

      if (data.actions && data.actions.length > 0) {
        applyPatch(text.trim(), data.actions);
      } else {
        setError("AI returned no actions for this prompt.");
      }

      setPrompt("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process edit";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    prompt,
    isLoading,
    page,
    selectedNodeId,
    lockedNodeIds,
    constraints,
    applyPatch,
    setLoading,
    setError,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setPrompt(suggestion);
      // Auto-submit the suggestion
      handleSubmit(suggestion);
    },
    [handleSubmit]
  );

  // Pick suggestions based on context
  const isEmpty = page.nodes.length === 0;
  const suggestions = isEmpty
    ? EMPTY_SUGGESTIONS
    : selectedNodeId
      ? ELEMENT_SUGGESTIONS
      : GENERAL_SUGGESTIONS;

  return (
    <div className="relative w-full">
      {/* Action prompt suggestions */}
      {!isLoading && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-500 bg-zinc-900/60 border border-zinc-800/80 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors"
            >
              <Sparkles className="w-2.5 h-2.5 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="relative flex items-center bg-zinc-900/80 border border-zinc-700/60 rounded-xl focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/30 transition-all duration-200">
        <Sparkles className="absolute left-4 w-4 h-4 text-zinc-500" />
        <input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedNodeId
              ? `Describe changes for "${selectedNodeId}"...`
              : isEmpty
                ? "Describe what you want to build..."
                : "Describe what you want to build or change..."
          }
          disabled={isLoading}
          className="flex-1 bg-transparent pl-11 pr-3 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <div className="pr-2.5 py-1.5">
          <button
            onClick={() => handleSubmit()}
            disabled={isLoading || !prompt.trim()}
            className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
