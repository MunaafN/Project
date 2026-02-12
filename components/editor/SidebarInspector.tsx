"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/state/editorStore";
import type { PageNode } from "@/lib/schema";
import { findNodeRecursive } from "./helpers";
import { DesignSystemPanel } from "./DesignSystemPanel";
import { ElementEditorPanel } from "./ElementEditorPanel";
import { RefinePrompt } from "./RefinePrompt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Layers,
  Settings2,
  Lock,
  Type,
  Palette,
  LayoutGrid,
} from "lucide-react";

export function SidebarInspector() {
  const [tab, setTab] = useState<"properties" | "layers">("properties");
  const {
    page,
    selectedNodeId,
    selectNode,
    lockedNodeIds,
    constraints,
    setConstraints,
  } = useEditorStore();

  const selectedNode = selectedNodeId
    ? findNodeRecursive(page.nodes, selectedNodeId)
    : undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex shrink-0 bg-zinc-950/50">
        <button
          onClick={() => setTab("properties")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "properties"
              ? "text-white border-white"
              : "text-zinc-500 hover:text-zinc-300 border-transparent"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          {selectedNode ? selectedNode.type : "Page"}
        </button>
        <button
          onClick={() => setTab("layers")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
            tab === "layers"
              ? "text-white border-white"
              : "text-zinc-500 hover:text-zinc-300 border-transparent"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers
        </button>
      </div>

      {/* Tab content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pb-2">
          {tab === "properties" ? (
            selectedNode ? (
              <ElementEditorPanel node={selectedNode} />
            ) : (
              <DesignSystemPanel />
            )
          ) : (
            /* Layers tree */
            <div className="py-2">
              <div className="px-4 py-2">
                <p className="text-[11px] text-zinc-600 font-medium">Click any layer to select and edit it</p>
              </div>
              <div className="px-3 space-y-0.5">
                {(() => {
                  function LayerItem({ node, depth = 0 }: { node: PageNode; depth?: number }) {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div className="flex flex-col">
                        <button
                          onClick={() => { selectNode(node.id); setTab("properties"); }}
                          className={`w-full flex items-center gap-2 py-2 pr-3 rounded-lg text-left text-[12px] transition-colors ${
                            isSelected
                              ? "bg-white/[0.08] text-white border border-zinc-700/80"
                              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"
                          }`}
                          style={{ paddingLeft: `${12 + depth * 16}px` }}
                        >
                          <LayoutGrid className="w-3.5 h-3.5 shrink-0 opacity-50" />
                          <span className="truncate flex-1 min-w-0 font-medium">
                            {node.type}
                            {node.props?.text != null &&
                              typeof node.props.text === "string" &&
                              (node.props.text as string).length > 0 &&
                              <span className="font-normal text-zinc-600">{` — "${String(node.props.text).slice(0, 12)}${(node.props.text as string).length > 12 ? "…" : ""}"`}</span>}
                          </span>
                          {lockedNodeIds.includes(node.id) && (
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                        </button>
                        {node.children.map((child) => (
                          <LayerItem key={child.id} node={child} depth={depth + 1} />
                        ))}
                      </div>
                    );
                  }
                  return page.nodes.map((n) => <LayerItem key={n.id} node={n} />);
                })()}
              </div>

              {/* Constraints */}
              <div className="mx-4 mt-4 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 mb-3">
                  <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">AI Constraints</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Allow text changes", key: "allowTextChanges" as const, icon: <Type className="w-3 h-3 shrink-0" /> },
                    { label: "Allow style changes", key: "allowStyleChanges" as const, icon: <Palette className="w-3 h-3 shrink-0" /> },
                    { label: "Allow layout changes", key: "allowLayoutChanges" as const, icon: <LayoutGrid className="w-3 h-3 shrink-0" /> },
                  ].map(({ label, key, icon }) => (
                    <label key={key} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="text-xs text-zinc-400 flex items-center gap-1.5">{icon} {label}</span>
                      <Switch
                        checked={constraints[key]}
                        onCheckedChange={(checked) => setConstraints({ [key]: checked })}
                        className="shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Refine prompt at bottom */}
      <RefinePrompt />
    </div>
  );
}
