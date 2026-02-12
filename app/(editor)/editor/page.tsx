"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/state/editorStore";
import { SidebarInspector } from "@/components/editor/SidebarInspector";
import { CanvasRenderer } from "@/components/editor/CanvasRenderer";
import { PreviewCanvas } from "@/components/editor/PreviewCanvas";
import { PromptBar } from "@/components/editor/PromptBar";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { PromoPanel } from "@/components/editor/PromoPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelLeftClose,
  PanelRightClose,
  Eye,
  X,
  Clock,
  MessageSquare,
  MousePointerClick,
  Loader2,
} from "lucide-react";

function RightSidebar() {
  const [tab, setTab] = useState<"editing" | "prompts">("editing");

  return (
    <aside className="w-[300px] border-l border-zinc-800/80 bg-zinc-950/60 shrink-0 overflow-hidden flex flex-col">
      {/* Tab bar */}
      <div className="flex shrink-0 bg-zinc-950/50">
        <button
          onClick={() => setTab("editing")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "editing"
              ? "text-white border-white"
              : "text-zinc-500 hover:text-zinc-300 border-transparent"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          History
        </button>
        <button
          onClick={() => setTab("prompts")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "prompts"
              ? "text-white border-white"
              : "text-zinc-500 hover:text-zinc-300 border-transparent"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Help
        </button>
      </div>

      {/* Tab content */}
      <ScrollArea className="h-full flex-1 min-h-0">
        <div className="pb-6">
          {tab === "editing" ? <DiffViewer /> : <PromoPanel />}
        </div>
      </ScrollArea>
    </aside>
  );
}

export default function EditorPage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const { selectedNodeId, isLoading, selectNode } = useEditorStore();

  // Preview mode — clean full-screen view
  if (previewMode) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Minimal preview header */}
        <div className="h-11 border-b border-zinc-800/80 flex items-center justify-between px-4 shrink-0 bg-zinc-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300">Preview Mode</span>
            <span className="text-[10px] text-zinc-600 font-medium">— This is how your site looks to visitors</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] gap-1.5 px-3 rounded-lg border border-zinc-800/80"
            onClick={() => setPreviewMode(false)}
          >
            <X className="w-3.5 h-3.5" />
            Exit Preview
          </Button>
        </div>
        {/* Full-width clean canvas */}
        <div className="flex-1 overflow-auto">
          <PreviewCanvas />
        </div>
      </div>
    );
  }

  // Editor mode
  return (
    <TooltipProvider>
      <div className="h-full flex overflow-hidden">
        {/* Toolbar strip at top of center area (panel toggles + preview) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Thin tool strip */}
          <div className="h-10 border-b border-zinc-800/80 flex items-center justify-between px-3 shrink-0 bg-zinc-950/50">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-md ${leftSidebarOpen ? "text-white bg-white/[0.08]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"}`}
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle properties panel</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-md ${rightSidebarOpen ? "text-white bg-white/[0.08]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"}`}
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  >
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle history panel</TooltipContent>
              </Tooltip>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] gap-1.5 px-2.5 rounded-md"
              onClick={() => { selectNode(null); setPreviewMode(true); }}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Button>
          </div>

          {/* Content area with sidebars */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar */}
            {leftSidebarOpen && (
              <aside className="w-[280px] border-r border-zinc-800/80 bg-zinc-950/60 shrink-0 overflow-hidden flex flex-col min-w-[240px]">
                <SidebarInspector />
              </aside>
            )}

            {/* Center canvas */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#09090b] min-w-0">
              {/* Canvas area */}
              <div className="flex-1 overflow-auto">
                <div className="w-full">
                  <CanvasRenderer />
                </div>
              </div>

              {/* Bottom prompt bar */}
              <div className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-5 py-4">
                {(selectedNodeId || isLoading) && (
                  <div className="flex items-center gap-2 mb-3">
                    {selectedNodeId && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-indigo-300 bg-indigo-500/[0.08] border border-indigo-500/20">
                        <MousePointerClick className="w-3 h-3" />
                        {selectedNodeId}
                      </span>
                    )}
                    {isLoading && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-amber-400/90 bg-amber-500/[0.08] border border-amber-500/20">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing...
                      </span>
                    )}
                  </div>
                )}
                <PromptBar />
              </div>
            </main>

            {/* Right sidebar */}
            {rightSidebarOpen && <RightSidebar />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
