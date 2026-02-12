"use client";

import React from "react";
import { useEditorStore } from "@/state/editorStore";
import { summarizeActions } from "@/lib/diffEngine";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Undo2,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";

export function DiffViewer() {
  const { history, undoPatch, undoPatchById, error } = useEditorStore();

  return (
    <div className="shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            Edit History
          </span>
          {history.length > 0 && (
            <span className="ml-auto text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 break-words min-w-0">{error}</p>
        </div>
      )}

      <div className="px-4 py-3 space-y-2.5">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500 font-medium mb-1">No edits yet</p>
            <p className="text-[11px] text-zinc-600">
              Use the prompt bar below to make AI-powered changes
            </p>
          </div>
        ) : (
          <>
            {[...history].reverse().map((entry, index) => {
              const summaries = summarizeActions(entry.actions);
              const isLatest = index === 0;

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 group hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs text-zinc-300 font-medium leading-snug flex-1 min-w-0 break-words">
                      {entry.prompt}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                            onClick={() =>
                              isLatest
                                ? undoPatch()
                                : undoPatchById(entry.id)
                            }
                          >
                            <Undo2 className="w-3 h-3 text-zinc-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo this edit</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-1">
                    {summaries.map((s, si) => (
                      <div
                        key={si}
                        className="flex items-center gap-2 text-xs min-w-0"
                      >
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-500 shrink-0">
                          {s.type}
                        </span>
                        <span className="text-zinc-500 truncate min-w-0">
                          {s.summary}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-2">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
            <button
              onClick={undoPatch}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800/60 rounded-lg border border-zinc-800/60 transition-colors mt-1"
            >
              <Undo2 className="w-3 h-3" />
              Undo Last Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
