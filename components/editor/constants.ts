export const FONT_FAMILIES = ["Default", "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman", "Poppins", "Roboto", "Montserrat"];

export const FONT_WEIGHTS = [
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
];

export const FONT_SIZES = [
  { label: "xs", value: "0.75rem" },
  { label: "sm", value: "0.875rem" },
  { label: "base", value: "1rem" },
  { label: "lg", value: "1.125rem" },
  { label: "xl", value: "1.25rem" },
  { label: "2xl", value: "1.5rem" },
  { label: "3xl", value: "1.875rem" },
  { label: "4xl", value: "2.25rem" },
  { label: "5xl", value: "3rem" },
  { label: "6xl", value: "3.75rem" },
];

export const SHADOW_PRESETS = [
  { label: "Small", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  { label: "Medium", value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
  { label: "Large", value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
  { label: "None", value: "none" },
  { label: "Glow", value: "0 0 15px rgb(99 102 241 / 0.35)" },
  { label: "Solid", value: "4px 4px 0 0 rgb(0 0 0 / 0.25)" },
];

/** Shared Tailwind class strings for form controls */
export const SEL = "w-full bg-zinc-900/90 border border-zinc-700/60 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 appearance-none cursor-pointer transition-colors";
export const INP = "w-full bg-zinc-900/90 border border-zinc-700/60 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors";
export const LBL = "text-[11px] text-zinc-500 mb-1.5 block font-medium";

export const FEATURE_HIGHLIGHTS = [
  "JSON-schema driven — no raw JSX, full undo control",
  "Select divs, headings, paragraphs, buttons — any element",
  "Nested element tree in Layers panel with hierarchy",
  "AI patch actions: UPDATE_PROPS, UPDATE_STYLE, SWAP_COMPONENT",
  "Lock nodes to prevent AI from modifying them",
  "Undo any edit with one click — full history",
];

export const AI_TIPS = [
  "Select any element — blocks or nested divs, spans, headings",
  "Use the Layers panel to select nested elements by hierarchy",
  "Try: Make the hero heading more compelling",
  "Try: Change the pricing section to annual billing",
  "Lock sections you're happy with to avoid accidental changes",
  "Use 'professional' or 'casual' rewrite modes for different tones",
];
