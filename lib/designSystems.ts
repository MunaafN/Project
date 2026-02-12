import type { ThemeConfig, PageNode } from "./schema";

/** A predefined design system with theme + node style overrides */
export interface DesignSystemPreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  theme: ThemeConfig;
  nodeOverrides: {
    heroGradient: string;
    sectionBg1: string;
    sectionBg2: string;
    ctaBg: string;
    ctaText: string;
    ctaClass: string;
    headingClass: string;
    subheadingClass: string;
    accentColor: string;
  };
}

export const DESIGN_SYSTEMS: DesignSystemPreset[] = [
  {
    id: "base",
    name: "Base",
    description: "Clean minimal dark",
    preview: "linear-gradient(135deg, #0f0f0f, #1a1a2e)",
    theme: {
      primaryColor: "#6366f1",
      font: "Inter",
      radius: "0.5rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
      sectionBg1: "#0a0a0a",
      sectionBg2: "#0f0f0f",
      ctaBg: "#ffffff",
      ctaText: "#000000",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-colors",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#6366f1",
    },
  },
  {
    id: "mono",
    name: "Mono",
    description: "Monochrome grayscale",
    preview: "linear-gradient(135deg, #111111, #222222)",
    theme: {
      primaryColor: "#ffffff",
      font: "ui-monospace, monospace",
      radius: "0.25rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(180deg, #111111 0%, #1a1a1a 100%)",
      sectionBg1: "#0e0e0e",
      sectionBg2: "#141414",
      ctaBg: "#ffffff",
      ctaText: "#000000",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-mono font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors border border-gray-300",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight font-mono",
      subheadingClass: "text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-mono",
      accentColor: "#ffffff",
    },
  },
  {
    id: "cosmic-night",
    name: "Cosmic Night",
    description: "Deep purple nebula",
    preview: "linear-gradient(135deg, #0d0015, #1a0533, #2d1b69)",
    theme: {
      primaryColor: "#a855f7",
      font: "Inter",
      radius: "0.75rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #0d0015 0%, #1a0533 50%, #2d1b69 100%)",
      sectionBg1: "#0a0012",
      sectionBg2: "#10001e",
      ctaBg: "#a855f7",
      ctaText: "#ffffff",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-purple-500 rounded-full hover:bg-purple-400 transition-colors shadow-lg shadow-purple-500/25",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-purple-300/70 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#a855f7",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool teal depths",
    preview: "linear-gradient(135deg, #021b23, #0a3a4a, #0d4f5e)",
    theme: {
      primaryColor: "#14b8a6",
      font: "Inter",
      radius: "0.5rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #021b23 0%, #0a3a4a 50%, #0d4f5e 100%)",
      sectionBg1: "#031820",
      sectionBg2: "#052530",
      ctaBg: "#14b8a6",
      ctaText: "#ffffff",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-teal-500 rounded-full hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/25",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-teal-300/60 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#14b8a6",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural earthy greens",
    preview: "linear-gradient(135deg, #0a1a0a, #1a2e1a, #0f2010)",
    theme: {
      primaryColor: "#22c55e",
      font: "Georgia, serif",
      radius: "0.375rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #0a1a0a 0%, #112211 50%, #0f2010 100%)",
      sectionBg1: "#0a140a",
      sectionBg2: "#0d1a0d",
      ctaBg: "#22c55e",
      ctaText: "#ffffff",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-400 transition-colors",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-green-300/60 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#22c55e",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm amber glow",
    preview: "linear-gradient(135deg, #1a0a00, #2d1500, #3d1e08)",
    theme: {
      primaryColor: "#f59e0b",
      font: "Inter",
      radius: "0.75rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #3d1e08 100%)",
      sectionBg1: "#140a00",
      sectionBg2: "#1a0e02",
      ctaBg: "#f59e0b",
      ctaText: "#000000",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black bg-amber-400 rounded-full hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-amber-300/60 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#f59e0b",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Vibrant cyberpunk",
    preview: "linear-gradient(135deg, #0a0015, #150025, #0a001a)",
    theme: {
      primaryColor: "#ec4899",
      font: "Inter",
      radius: "0.5rem",
      spacing: "1rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #0a0015 0%, #150025 50%, #0a001a 100%)",
      sectionBg1: "#08000f",
      sectionBg2: "#0d0018",
      ctaBg: "#ec4899",
      ctaText: "#ffffff",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white bg-pink-500 rounded-full hover:bg-pink-400 transition-colors shadow-lg shadow-pink-500/30",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-pink-300/60 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#ec4899",
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated serif",
    preview: "linear-gradient(135deg, #0f0d08, #1a1710, #211e14)",
    theme: {
      primaryColor: "#d4a574",
      font: "Georgia, serif",
      radius: "0.25rem",
      spacing: "1.25rem",
    },
    nodeOverrides: {
      heroGradient: "linear-gradient(135deg, #0f0d08 0%, #1a1710 50%, #211e14 100%)",
      sectionBg1: "#0d0b07",
      sectionBg2: "#12100a",
      ctaBg: "#d4a574",
      ctaText: "#1a1710",
      ctaClass: "inline-flex items-center justify-center px-8 py-3 text-sm font-medium bg-amber-300/80 text-amber-950 rounded hover:bg-amber-300 transition-colors",
      headingClass: "text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight",
      subheadingClass: "text-lg md:text-xl text-amber-200/50 mb-10 max-w-2xl mx-auto leading-relaxed",
      accentColor: "#d4a574",
    },
  },
];

/** Semantic element categories used for theme application */
const HEADING_TYPES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const BUTTON_TYPES = new Set(["button", "a"]);
const INPUT_TYPES = new Set(["input", "textarea", "select"]);
const CONTAINER_TYPES = new Set(["section", "div", "main", "article", "aside", "form", "nav", "header", "footer"]);

/** All accent Tailwind color families that themes may swap */
const ACCENT_COLORS = "indigo|purple|teal|green|amber|pink|blue|violet|fuchsia|emerald|rose|cyan|sky|red|orange|yellow|lime";

/**
 * Replace ALL accent-colored Tailwind classes in a className string with the theme accent.
 * Handles:
 *  - Named classes: bg-indigo-600, text-purple-400, border-teal-500
 *  - Arbitrary values: bg-[#6366f1], text-[#a855f7], border-[#14b8a6]
 *  - Variant prefixes: hover:bg-indigo-500, focus:border-indigo-500, focus:ring-indigo-500
 *  - Shadow modifiers: shadow-indigo-500/25
 */
function replaceAccentInClassName(className: string, accentColor: string): string {
  let result = className;

  // 1) Named Tailwind color classes (with optional variant prefix like hover:, focus:, etc.)
  //    e.g. bg-indigo-600 → bg-[#accent], hover:bg-indigo-500 → hover:bg-[#accent]
  const namedPattern = new RegExp(
    `((?:[a-z]+:)*)(bg|text|border|ring|shadow|outline|from|to|via|accent|decoration|divide|ring-offset)-(${ACCENT_COLORS})-(\\d{2,3})(\\/\\d+)?`,
    "g"
  );
  result = result.replace(namedPattern, (_match, variant, prefix, _color, _shade, opacity) => {
    const op = opacity ?? "";
    return `${variant}${prefix}-[${accentColor}]${op}`;
  });

  // 2) Arbitrary hex value classes that look like accent colors
  //    e.g. bg-[#6366f1] → bg-[#newAccent], focus:border-[#6366f1] → focus:border-[#newAccent]
  const arbitraryPattern = /((?:[a-z]+:)*)(bg|text|border|ring|shadow|outline|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g;
  result = result.replace(arbitraryPattern, (_match, variant, prefix) => {
    return `${variant}${prefix}-[${accentColor}]`;
  });

  return result;
}

/** Check if a className indicates a primary/accent button (has colored background, not neutral) */
function isAccentButton(className: string): boolean {
  // Has a bg-* class that isn't neutral (zinc, gray, slate, neutral, stone, white, black, transparent)
  const neutralBgPattern = /bg-(zinc|gray|slate|neutral|stone|white|black|transparent)/;
  const hasBg = /bg-/.test(className);
  return hasBg && !neutralBgPattern.test(className);
}

/** Check if a className has a dark neutral background (for cards, containers) */
function hasNeutralDarkBg(className: string): boolean {
  return /bg-(zinc|gray|slate|neutral|stone)-(800|900|950)/.test(className)
    || /bg-\[#(0[a-f0-9]{5}|1[a-f0-9]{5})\]/i.test(className)
    || /bg-zinc-900\//.test(className);
}

/**
 * Apply a design system's overrides to the page node tree.
 * Walks ALL nodes and applies theme by detecting semantic roles.
 * Works on any AI-generated content — no hardcoded IDs needed.
 */
export function applyDesignSystemToNodes(
  nodes: PageNode[],
  preset: DesignSystemPreset
): PageNode[] {
  const { nodeOverrides, theme } = preset;
  let sectionIndex = 0;

  function walkNode(node: PageNode, depth: number): PageNode {
    const updated: PageNode = {
      ...node,
      style: { ...node.style },
      props: { ...node.props },
      children: node.children.map((c) => walkNode(c, depth + 1)),
    };

    const className = (updated.props.className as string) ?? "";

    // ── HeroCentered block component ──
    if (node.type === "HeroCentered") {
      updated.style.background = nodeOverrides.heroGradient;
      return updated;
    }

    // ── Block components (PricingGrid, Testimonials) ──
    if (node.type === "PricingGrid" || node.type === "Testimonials") {
      if (updated.style.background) {
        updated.style.background = sectionIndex % 2 === 0 ? nodeOverrides.sectionBg1 : nodeOverrides.sectionBg2;
        sectionIndex++;
      }
      return updated;
    }

    // ── Top-level nodes: apply section background ──
    if (depth === 0) {
      if (updated.style.background) {
        // Gradient backgrounds get the hero gradient, solid gets section alternation
        if (updated.style.background.includes("gradient")) {
          updated.style.background = nodeOverrides.heroGradient;
        } else {
          updated.style.background = sectionIndex % 2 === 0 ? nodeOverrides.sectionBg1 : nodeOverrides.sectionBg2;
        }
        sectionIndex++;
      } else if (!updated.style.background && CONTAINER_TYPES.has(node.type)) {
        // Top-level section with no explicit background — give it one
        updated.style.background = sectionIndex % 2 === 0 ? nodeOverrides.sectionBg1 : nodeOverrides.sectionBg2;
        sectionIndex++;
      }
    }

    // ── Buttons and links with accent backgrounds ──
    if (BUTTON_TYPES.has(node.type) && className) {
      if (isAccentButton(className)) {
        let newClass = replaceAccentInClassName(className, nodeOverrides.ctaBg);
        // Fix text color to match CTA contrast
        const lightCta = nodeOverrides.ctaText === "#ffffff" || nodeOverrides.ctaText === "#fff";
        if (lightCta) {
          newClass = newClass.replace(/\btext-black\b/g, "text-white").replace(/\btext-\[#000000\]/g, `text-[${nodeOverrides.ctaText}]`);
        } else {
          newClass = newClass.replace(/\btext-white\b/g, `text-[${nodeOverrides.ctaText}]`);
        }
        updated.props.className = newClass;
      }
    }

    // ── Input elements: swap focus accent colors ──
    if (INPUT_TYPES.has(node.type) && className) {
      updated.props.className = replaceAccentInClassName(className, nodeOverrides.accentColor);
    }

    // ── Labels: light text for dark themes is fine, but swap any accent colors ──
    if (node.type === "label" && className) {
      updated.props.className = replaceAccentInClassName(className, nodeOverrides.accentColor);
    }

    // ── Headings: swap accent colors if present ──
    if (HEADING_TYPES.has(node.type) && className) {
      updated.props.className = replaceAccentInClassName(className, nodeOverrides.accentColor);
    }

    // ── Nested containers: swap inline style backgrounds ──
    if (CONTAINER_TYPES.has(node.type) && updated.style.background && depth > 0) {
      const bg = updated.style.background;
      if (bg.startsWith("#") && !bg.includes("gradient")) {
        const bgLower = bg.toLowerCase();
        // Dark background hex → theme section bg
        if (["#0a0a0a", "#0f0f0f", "#111111", "#000000", "#0a0a0b", "#09090b", "#0e0e0e", "#141414", "#1a1a1a"].includes(bgLower)) {
          updated.style.background = nodeOverrides.sectionBg1;
        }
      } else if (bg.includes("gradient")) {
        updated.style.background = nodeOverrides.heroGradient;
      }
    }

    // ── Nested containers: swap className-based backgrounds that use accent colors ──
    if (CONTAINER_TYPES.has(node.type) && className) {
      // Only replace accent-colored backgrounds, not neutral ones (cards, etc.)
      if (!hasNeutralDarkBg(className)) {
        updated.props.className = replaceAccentInClassName(className, nodeOverrides.accentColor);
      }
    }

    // ── Spans and paragraphs: swap any accent colored text ──
    if ((node.type === "span" || node.type === "p") && className) {
      updated.props.className = replaceAccentInClassName(className, nodeOverrides.accentColor);
    }

    // ── Apply theme font to the root if present ──
    if (depth === 0 && theme.font) {
      updated.style.fontFamily = theme.font;
    }

    return updated;
  }

  return nodes.map((n) => walkNode(n, 0));
}

export function getDesignSystem(id: string): DesignSystemPreset | undefined {
  return DESIGN_SYSTEMS.find((ds) => ds.id === id);
}
