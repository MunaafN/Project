"use client";

import React, { useCallback } from "react";
import { useEditorStore } from "@/state/editorStore";
import { FONT_FAMILIES, FONT_WEIGHTS, FONT_SIZES, SHADOW_PRESETS, SEL, INP, LBL } from "./constants";
import { Section } from "./Section";
import type { PageNode } from "@/lib/schema";
import {
  Lock,
  Unlock,
  ChevronRight,
  Type,
  Paintbrush,
  Palette,
  LayoutGrid,
  BoxSelect,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";

export function ElementEditorPanel({ node }: { node: PageNode }) {
  const { applyPatch, lockedNodeIds, lockNode, unlockNode } = useEditorStore();
  const isLocked = lockedNodeIds.includes(node.id);

  const applyStyle = useCallback(
    (key: string, value: string) => {
      if (isLocked) return;
      applyPatch(`Style: ${key}`, [
        { targetId: node.id, type: "UPDATE_STYLE", changes: { [key]: value } },
      ]);
    },
    [node.id, isLocked, applyPatch]
  );

  const getStyle = (key: string) => (node.style as Record<string, string>)[key] ?? "";

  return (
    <>
      {/* Breadcrumb header with lock */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/30">
        <div className="flex items-center gap-2 min-w-0">
          <button className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors font-medium">Page</button>
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="text-[11px] text-white font-semibold truncate bg-white/[0.06] px-2 py-0.5 rounded">{node.type}</span>
        </div>
        <button
          onClick={() => (isLocked ? unlockNode(node.id) : lockNode(node.id))}
          className={`p-1.5 rounded-lg transition-colors ${isLocked ? "bg-amber-500/10 hover:bg-amber-500/20" : "hover:bg-white/[0.06]"}`}
          title={isLocked ? "Unlock element" : "Lock element"}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>
      </div>

      {/* Node ID badge */}
      <div className="px-4 py-2 border-b border-zinc-800/80">
        <span className="text-[10px] text-zinc-600 font-mono">{node.id}</span>
      </div>

      {/* Typography */}
      <Section title="Typography" icon={<Type className="w-3.5 h-3.5 text-zinc-500" />}>
        <div className="space-y-3">
          <div>
            <label className={LBL}>Font Family</label>
            <select
              className={SEL}
              value={getStyle("fontFamily") || "Default"}
              onChange={(e) => applyStyle("fontFamily", e.target.value === "Default" ? "" : e.target.value)}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Weight</label>
              <select
                className={SEL}
                value={getStyle("fontWeight") || "400"}
                onChange={(e) => applyStyle("fontWeight", e.target.value)}
              >
                {FONT_WEIGHTS.map((fw) => (
                  <option key={fw.value} value={fw.value}>{fw.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LBL}>Size</label>
              <select
                className={SEL}
                value={getStyle("fontSize") || ""}
                onChange={(e) => applyStyle("fontSize", e.target.value)}
              >
                <option value="">Default</option>
                {FONT_SIZES.map((fs) => (
                  <option key={fs.value} value={fs.value}>{fs.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Line Height</label>
              <input
                className={INP}
                placeholder="e.g. 1.5"
                value={getStyle("lineHeight")}
                onChange={(e) => applyStyle("lineHeight", e.target.value)}
              />
            </div>
            <div>
              <label className={LBL}>Letter Spacing</label>
              <input
                className={INP}
                placeholder="e.g. 0.05em"
                value={getStyle("letterSpacing")}
                onChange={(e) => applyStyle("letterSpacing", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LBL}>Alignment</label>
            <div className="flex gap-1.5">
              {[
                { icon: AlignLeft, value: "left" },
                { icon: AlignCenter, value: "center" },
                { icon: AlignRight, value: "right" },
                { icon: AlignJustify, value: "justify" },
              ].map(({ icon: Icon, value }) => (
                <button
                  key={value}
                  onClick={() => applyStyle("textAlign", value)}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors ${
                    getStyle("textAlign") === value
                      ? "bg-white/[0.1] border-zinc-500 text-white"
                      : "border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LBL}>Decoration</label>
            <div className="flex gap-1.5">
              {[
                { icon: Bold, style: "fontWeight", val: "700", label: "B" },
                { icon: Italic, style: "fontStyle", val: "italic", label: "I" },
                { icon: Underline, style: "textDecoration", val: "underline", label: "U" },
                { icon: Strikethrough, style: "textDecoration", val: "line-through", label: "S" },
              ].map(({ icon: Icon, style, val, label }) => (
                <button
                  key={label}
                  onClick={() => applyStyle(style, getStyle(style) === val ? "" : val)}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors ${
                    getStyle(style) === val
                      ? "bg-white/[0.1] border-zinc-500 text-white"
                      : "border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Color */}
      <Section title="Color" icon={<Paintbrush className="w-3.5 h-3.5 text-zinc-500" />}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={getStyle("color") || "#ffffff"}
            onChange={(e) => applyStyle("color", e.target.value)}
            className="w-8 h-8 rounded-lg border border-zinc-700/60 bg-transparent cursor-pointer shrink-0"
          />
          <input
            className={INP}
            placeholder="e.g. #ffffff"
            value={getStyle("color")}
            onChange={(e) => applyStyle("color", e.target.value)}
          />
        </div>
      </Section>

      {/* Background */}
      <Section title="Background" icon={<Palette className="w-3.5 h-3.5 text-zinc-500" />}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={getStyle("background")?.startsWith("#") ? getStyle("background") : "#000000"}
            onChange={(e) => applyStyle("background", e.target.value)}
            className="w-8 h-8 rounded-lg border border-zinc-700/60 bg-transparent cursor-pointer shrink-0"
          />
          <input
            className={INP}
            placeholder="Color or gradient"
            value={getStyle("background")}
            onChange={(e) => applyStyle("background", e.target.value)}
          />
        </div>
      </Section>

      {/* Layout */}
      <Section title="Layout" icon={<LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />}>
        <div className="space-y-3">
          <div>
            <label className={LBL}>Margin</label>
            <div className="grid grid-cols-2 gap-2">
              <input className={INP} placeholder="Top/Bottom" value={getStyle("marginBlock")} onChange={(e) => applyStyle("marginBlock", e.target.value)} />
              <input className={INP} placeholder="Left/Right" value={getStyle("marginInline")} onChange={(e) => applyStyle("marginInline", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={LBL}>Padding</label>
            <div className="grid grid-cols-2 gap-2">
              <input className={INP} placeholder="Top/Bottom" value={getStyle("paddingBlock") || getStyle("padding")?.split(" ")[0] || ""} onChange={(e) => applyStyle("paddingBlock", e.target.value)} />
              <input className={INP} placeholder="Left/Right" value={getStyle("paddingInline") || getStyle("padding")?.split(" ")[1] || ""} onChange={(e) => applyStyle("paddingInline", e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Border */}
      <Section title="Border" icon={<BoxSelect className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Width</label>
              <input className={INP} placeholder="e.g. 1px" value={getStyle("borderWidth")} onChange={(e) => applyStyle("borderWidth", e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Radius</label>
              <input className={INP} placeholder="e.g. 8px" value={getStyle("borderRadius")} onChange={(e) => applyStyle("borderRadius", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={LBL}>Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getStyle("borderColor") || "#333333"}
                onChange={(e) => applyStyle("borderColor", e.target.value)}
                className="w-8 h-8 rounded-lg border border-zinc-700/60 bg-transparent cursor-pointer shrink-0"
              />
              <input className={INP} value={getStyle("borderColor")} onChange={(e) => applyStyle("borderColor", e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Shadows */}
      <Section title="Shadows" icon={<BoxSelect className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          {SHADOW_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyStyle("boxShadow", preset.value)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border transition-colors ${
                getStyle("boxShadow") === preset.value
                  ? "bg-white/[0.1] border-zinc-500"
                  : "border-zinc-700/50 bg-zinc-900/80 hover:border-zinc-500 hover:bg-zinc-800/60"
              }`}
            >
              <div
                className="w-7 h-5 bg-zinc-600 rounded-sm"
                style={{ boxShadow: preset.value === "none" ? "none" : preset.value }}
              />
              <span className="text-[10px] text-zinc-500">{preset.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
