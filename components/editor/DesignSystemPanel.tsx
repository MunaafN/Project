"use client";

import React from "react";
import { useEditorStore } from "@/state/editorStore";
import { DESIGN_SYSTEMS } from "@/lib/designSystems";
import { FONT_FAMILIES, SHADOW_PRESETS, SEL, INP } from "./constants";
import { Section } from "./Section";
import {
  Brush,
  Paintbrush,
  Type,
  Palette,
  BoxSelect,
  Check,
} from "lucide-react";

export function DesignSystemPanel() {
  const { page, updateTheme, applyDesignSystem, activeDesignSystemId } = useEditorStore();
  const { theme } = page;

  return (
    <>
      {/* Header label */}
      <div className="px-4 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Brush className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-300">Design System</span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-1">Choose a preset or customize manually</p>
      </div>

      {/* Design System Preset Grid */}
      <Section title="Presets" icon={<Paintbrush className="w-3.5 h-3.5 text-zinc-500" />}>
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_SYSTEMS.map((ds) => {
            const isActive = activeDesignSystemId === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => applyDesignSystem(ds.id)}
                className={`relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200 group ${
                  isActive
                    ? "border-indigo-500/60 ring-1 ring-indigo-500/30"
                    : "border-zinc-800/80 hover:border-zinc-600"
                }`}
              >
                {/* Color preview strip */}
                <div
                  className="h-10 w-full"
                  style={{ background: ds.preview }}
                />
                {/* Accent dot row */}
                <div className="flex gap-1 px-2 pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ds.nodeOverrides.ctaBg }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ds.nodeOverrides.accentColor, opacity: 0.5 }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ds.nodeOverrides.sectionBg1, border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                {/* Label */}
                <div className="px-2 pt-1.5 pb-2 text-left">
                  <div className="text-[11px] font-semibold text-zinc-200 leading-tight">{ds.name}</div>
                  <div className="text-[10px] text-zinc-600 leading-tight mt-0.5">{ds.description}</div>
                </div>
                {/* Active check */}
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Manual overrides below */}
      <Section title="Font" icon={<Type className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <select
          className={SEL}
          value={theme.font}
          onChange={(e) => updateTheme({ font: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f === "Default" ? "Inter" : f}>{f}</option>
          ))}
        </select>
      </Section>

      <Section title="Primary Color" icon={<Palette className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-zinc-700/60 bg-transparent cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={theme.primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className={INP}
          />
        </div>
      </Section>

      <Section title="Border Radius" icon={<BoxSelect className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-zinc-500 font-medium">Radius</label>
            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900/80 px-1.5 py-0.5 rounded">{theme.radius}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.125"
            value={parseFloat(theme.radius)}
            onChange={(e) => updateTheme({ radius: `${e.target.value}rem` })}
            className="w-full accent-white h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </Section>

      <Section title="Shadows" icon={<BoxSelect className="w-3.5 h-3.5 text-zinc-500" />} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          {SHADOW_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border border-zinc-700/50 bg-zinc-900/80 hover:border-zinc-500 hover:bg-zinc-800/60 transition-colors"
              title={preset.label}
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
