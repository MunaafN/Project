"use client";

import React, { useState, useCallback } from "react";
import { useEditorStore } from "@/state/editorStore";
import type { PatchAction } from "@/lib/schema";
import {
  MousePointerClick,
  Loader2,
  ArrowUp,
} from "lucide-react";

export function RefinePrompt() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { page, selectedNodeId, lockedNodeIds, constraints, applyPatch, setError } = useEditorStore();

  const handleRefine = useCallback(async () => {
    if (!text.trim() || loading || !selectedNodeId) return;
    setLoading(true);
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
      if (!response.ok) throw new Error("Request failed");
      const data = (await response.json()) as { actions: PatchAction[] };
      if (data.actions?.length > 0) applyPatch(text.trim(), data.actions);
      setText("");
    } catch {
      setError("Failed to refine element.");
    } finally {
      setLoading(false);
    }
  }, [text, loading, selectedNodeId, page, constraints, lockedNodeIds, applyPatch, setError]);

  return (
    <div className="px-3 py-3 border-t border-zinc-800/80 bg-zinc-950/50">
      {selectedNodeId && (
        <div className="flex items-center gap-1.5 mb-2">
          <MousePointerClick className="w-3 h-3 text-zinc-600" />
          <span className="text-[10px] font-medium text-zinc-500 truncate">
            {selectedNodeId}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRefine()}
          placeholder={selectedNodeId ? "Refine this element..." : "Select an element first"}
          disabled={loading || !selectedNodeId}
          className="flex-1 bg-zinc-900/90 border border-zinc-700/60 rounded-lg px-2.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 disabled:opacity-40 transition-colors"
        />
        <button
          onClick={handleRefine}
          disabled={loading || !text.trim() || !selectedNodeId}
          className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 disabled:opacity-20 hover:bg-zinc-200 transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
