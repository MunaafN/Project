"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/state/editorStore";
import { DESIGN_SYSTEMS } from "@/lib/designSystems";
import { PreviewCanvas } from "@/components/editor/PreviewCanvas";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

/* ─── Collapsible Section (v0-style) ─────────────────────────── */

function V0Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

/* ─── Color Token Row ────────────────────────────────────────── */

function ColorToken({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-cyan-300/70 mb-1.5">{label}</p>
      <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded border border-zinc-700/60 bg-transparent cursor-pointer shrink-0 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-xs text-zinc-300 font-mono outline-none min-w-0"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

/* ─── Slider Row ─────────────────────────────────────────────── */

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-zinc-400 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-blue-500 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer"
        />
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-zinc-200 font-mono bg-zinc-900/80 border border-zinc-800/60 rounded px-2 py-1 w-14 text-center">
            {value}
          </span>
          <span className="text-[10px] text-zinc-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Font families ──────────────────────────────────────────── */

const SANS_FONTS = ["Inter", "Geist", "Roboto", "Poppins", "Montserrat", "Open Sans", "Lato", "Nunito", "Raleway", "Work Sans"];
const SERIF_FONTS = ["Georgia", "Source Serif 4", "Merriweather", "Playfair Display", "Lora", "Noto Serif", "PT Serif", "Crimson Text"];
const MONO_FONTS = ["Geist Mono", "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono", "Roboto Mono", "Ubuntu Mono"];

/* ─── Default color tokens ───────────────────────────────────── */

const DEFAULT_COLORS = {
  primaryColor: "#6366f1",
  primaryForeground: "#ffffff",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  accent: "#27272a",
  accentForeground: "#fafafa",
  background: "#09090b",
  foreground: "#fafafa",
  card: "#09090b",
  cardForeground: "#fafafa",
  popover: "#09090b",
  popoverForeground: "#fafafa",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  destructive: "#dc2626",
  destructiveForeground: "#fafafa",
  border: "#27272a",
  input: "#27272a",
  ring: "#6366f1",
  chart1: "#6366f1",
  chart2: "#8b5cf6",
  chart3: "#a78bfa",
  chart4: "#c4b5fd",
  chart5: "#ddd6fe",
  sidebar: "#09090b",
  sidebarForeground: "#fafafa",
};

/* ─── Main Design Page ───────────────────────────────────────── */

export default function DesignPage() {
  const { page, updateTheme, applyDesignSystem, activeDesignSystemId } =
    useEditorStore();
  const { theme } = page;

  /** Get a theme color value with fallback to defaults */
  function color(key: keyof typeof DEFAULT_COLORS): string {
    return (theme as unknown as Record<string, string>)[key] ?? DEFAULT_COLORS[key];
  }

  function setColor(key: string, value: string) {
    updateTheme({ [key]: value } as Partial<typeof theme>);
  }

  // Parse shadow values
  const shadowX = parseFloat(theme.shadowX ?? "0");
  const shadowY = parseFloat(theme.shadowY ?? "1");
  const shadowBlur = parseFloat(theme.shadowBlur ?? "2");
  const shadowSpread = parseFloat(theme.shadowSpread ?? "0");
  const shadowColor = theme.shadowColor ?? "#0000000d";

  // Parse radius
  const radiusVal = parseFloat(theme.radius ?? "0.5");

  // Typography
  const fontSans = theme.fontSans ?? theme.font ?? "Inter";
  const fontSerif = theme.fontSerif ?? "Georgia";
  const fontMono = theme.fontMono ?? "Geist Mono";

  /** Color token pairs (label, themeKey) displayed in two-column grid */
  const colorPairs: [string, string, string, string][] = [
    ["Primary", "primaryColor", "Primary Foreground", "primaryForeground"],
    ["Secondary", "secondary", "Secondary Foreground", "secondaryForeground"],
    ["Accent", "accent", "Accent Foreground", "accentForeground"],
    ["Background", "background", "Foreground", "foreground"],
    ["Card", "card", "Card Foreground", "cardForeground"],
    ["Popover", "popover", "Popover Foreground", "popoverForeground"],
    ["Muted", "muted", "Muted Foreground", "mutedForeground"],
    ["Destructive", "destructive", "Destructive Foreground", "destructiveForeground"],
  ];

  const singleTokens: [string, string][] = [
    ["Border", "border"],
    ["Input", "input"],
    ["Ring", "ring"],
  ];

  const chartPairs: [string, string, string, string][] = [
    ["Chart 1", "chart1", "Chart 2", "chart2"],
    ["Chart 3", "chart3", "Chart 4", "chart4"],
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left panel — design controls */}
      <div className="w-[460px] border-r border-zinc-800/80 bg-zinc-950/60 shrink-0 flex flex-col overflow-hidden">
        {/* Header with presets */}
        <div className="px-5 py-4 border-b border-zinc-800/80 shrink-0">
          <h1 className="text-base font-semibold text-white mb-1">
            Design System
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Customize your theme tokens, typography, and styling.
          </p>
        </div>

        {/* Preset strip */}
        <div className="px-5 py-3 border-b border-zinc-800/80 shrink-0">
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mb-2">
            Presets
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DESIGN_SYSTEMS.map((ds) => {
              const isActive = activeDesignSystemId === ds.id;
              return (
                <button
                  key={ds.id}
                  onClick={() => applyDesignSystem(ds.id)}
                  className={`relative shrink-0 flex flex-col rounded-lg border overflow-hidden transition-all w-[100px] ${
                    isActive
                      ? "border-indigo-500/60 ring-1 ring-indigo-500/30"
                      : "border-zinc-800/80 hover:border-zinc-600"
                  }`}
                >
                  <div
                    className="h-8 w-full"
                    style={{ background: ds.preview }}
                  />
                  <div className="px-2 py-1.5 bg-zinc-900/80">
                    <span className="text-[10px] font-medium text-zinc-300 truncate block">
                      {ds.name}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Design token sections */}
        <ScrollArea className="flex-1 min-h-0">
          {/* ── Colors ── */}
          <V0Section title="Colors" defaultOpen={true}>
            <div className="space-y-4">
              {/* Paired tokens */}
              {colorPairs.map(([lLabel, lKey, rLabel, rKey]) => (
                <div key={lKey} className="grid grid-cols-2 gap-3">
                  <ColorToken
                    label={lLabel}
                    value={color(lKey as keyof typeof DEFAULT_COLORS)}
                    onChange={(v) => setColor(lKey, v)}
                  />
                  <ColorToken
                    label={rLabel}
                    value={color(rKey as keyof typeof DEFAULT_COLORS)}
                    onChange={(v) => setColor(rKey, v)}
                  />
                </div>
              ))}

              {/* Single tokens */}
              {singleTokens.map(([label, key]) => (
                <ColorToken
                  key={key}
                  label={label}
                  value={color(key as keyof typeof DEFAULT_COLORS)}
                  onChange={(v) => setColor(key, v)}
                />
              ))}

              {/* Chart pairs */}
              {chartPairs.map(([lLabel, lKey, rLabel, rKey]) => (
                <div key={lKey} className="grid grid-cols-2 gap-3">
                  <ColorToken
                    label={lLabel}
                    value={color(lKey as keyof typeof DEFAULT_COLORS)}
                    onChange={(v) => setColor(lKey, v)}
                  />
                  <ColorToken
                    label={rLabel}
                    value={color(rKey as keyof typeof DEFAULT_COLORS)}
                    onChange={(v) => setColor(rKey, v)}
                  />
                </div>
              ))}

              {/* Chart 5 standalone */}
              <ColorToken
                label="Chart 5"
                value={color("chart5")}
                onChange={(v) => setColor("chart5", v)}
              />

              {/* Sidebar pair */}
              <div className="grid grid-cols-2 gap-3">
                <ColorToken
                  label="Sidebar"
                  value={color("sidebar")}
                  onChange={(v) => setColor("sidebar", v)}
                />
                <ColorToken
                  label="Sidebar Foreground"
                  value={color("sidebarForeground")}
                  onChange={(v) => setColor("sidebarForeground", v)}
                />
              </div>
            </div>
          </V0Section>

          {/* ── Typography ── */}
          <V0Section title="Typography" defaultOpen={false}>
            <div className="space-y-5">
              <div>
                <p className="text-[11px] text-cyan-300/70 mb-1.5">Font Sans</p>
                <select
                  value={fontSans}
                  onChange={(e) =>
                    updateTheme({ fontSans: e.target.value, font: e.target.value })
                  }
                  className="w-full bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none"
                >
                  {SANS_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-[11px] text-cyan-300/70 mb-1.5">Font Serif</p>
                <select
                  value={fontSerif}
                  onChange={(e) => updateTheme({ fontSerif: e.target.value })}
                  className="w-full bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none"
                >
                  {SERIF_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-[11px] text-cyan-300/70 mb-1.5">Font Mono</p>
                <select
                  value={fontMono}
                  onChange={(e) => updateTheme({ fontMono: e.target.value })}
                  className="w-full bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none"
                >
                  {MONO_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </V0Section>

          {/* ── Other ── */}
          <V0Section title="Other" defaultOpen={false}>
            <div className="space-y-6">
              {/* Radius */}
              <SliderRow
                label="Radius"
                value={radiusVal}
                min={0}
                max={2}
                step={0.125}
                unit="rem"
                onChange={(v) => updateTheme({ radius: `${v}rem` })}
              />

              {/* Shadow */}
              <div>
                <p className="text-sm font-semibold text-zinc-200 mb-4">
                  Shadow
                </p>
                <div className="space-y-4">
                  <SliderRow
                    label="X Offset"
                    value={shadowX}
                    min={-20}
                    max={20}
                    step={1}
                    unit="px"
                    onChange={(v) =>
                      updateTheme({ shadowX: String(v) })
                    }
                  />
                  <SliderRow
                    label="Y Offset"
                    value={shadowY}
                    min={-20}
                    max={20}
                    step={1}
                    unit="px"
                    onChange={(v) =>
                      updateTheme({ shadowY: String(v) })
                    }
                  />
                  <SliderRow
                    label="Blur"
                    value={shadowBlur}
                    min={0}
                    max={50}
                    step={1}
                    unit="px"
                    onChange={(v) =>
                      updateTheme({ shadowBlur: String(v) })
                    }
                  />
                  <SliderRow
                    label="Spread"
                    value={shadowSpread}
                    min={-20}
                    max={20}
                    step={1}
                    unit="px"
                    onChange={(v) =>
                      updateTheme({ shadowSpread: String(v) })
                    }
                  />

                  <div>
                    <p className="text-[11px] text-zinc-400 mb-2">Color</p>
                    <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2">
                      <input
                        type="color"
                        value={shadowColor.slice(0, 7)}
                        onChange={(e) =>
                          updateTheme({ shadowColor: e.target.value })
                        }
                        className="w-5 h-5 rounded border border-zinc-700/60 bg-transparent cursor-pointer shrink-0 p-0"
                      />
                      <input
                        type="text"
                        value={shadowColor}
                        onChange={(e) =>
                          updateTheme({ shadowColor: e.target.value })
                        }
                        className="flex-1 bg-transparent text-xs text-zinc-300 font-mono outline-none min-w-0"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </V0Section>
        </ScrollArea>
      </div>

      {/* Right panel — live preview */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-5 py-3 border-b border-zinc-800/80 shrink-0 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-300">
              Live Preview
            </span>
            <span className="text-[11px] text-zinc-600 ml-2">
              Changes apply in real time
            </span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono bg-zinc-900/60 px-2 py-0.5 rounded">
            {activeDesignSystemId}
          </span>
        </div>
        <div className="flex-1 overflow-auto bg-[#09090b]">
          <PreviewCanvas />
        </div>
      </div>
    </div>
  );
}
