"use client";

import React from "react";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { PromoPanel } from "@/components/editor/PromoPanel";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HistoryPage() {
  return (
    <div className="h-full flex overflow-hidden">
      {/* Main history panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-zinc-800/80 shrink-0">
          <h1 className="text-base font-semibold text-white mb-1">Edit History</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Review every change you've made. Undo any edit with a single click to restore previous states.
          </p>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <DiffViewer />
          </div>
        </ScrollArea>
      </div>

      {/* Right tips panel */}
      <aside className="w-[300px] border-l border-zinc-800/80 bg-zinc-950/60 shrink-0 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-800/80 shrink-0">
          <span className="text-xs font-semibold text-zinc-300">Tips &amp; Help</span>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <PromoPanel />
        </ScrollArea>
      </aside>
    </div>
  );
}
