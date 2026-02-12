/**
 * Shared system prompt for the multi-framework import pipeline.
 * Used by both /api/import (file upload) and /api/github/import.
 */

export const IMPORT_SYSTEM_PROMPT = `You are an expert web-project-to-JSON converter. You receive source files from a web project (which may be vanilla HTML/CSS, React, Next.js, Vue, Svelte, or any other frontend framework) and convert the visual output into a structured PageDocument JSON.

You MUST return ONLY valid JSON with this exact shape:
{
  "theme": {
    "primaryColor": "#hex",
    "font": "FontName",
    "radius": "0.5rem",
    "spacing": "1rem"
  },
  "nodes": [ ...PageNode tree... ]
}

## PageNode structure

Every node must follow:
{
  "id": "unique-string-id",
  "type": "elementType",
  "props": { "text": "visible text", "className": "tailwind classes", ... },
  "style": { "cssProperty": "value", ... },
  "children": [ ...child PageNode objects... ],
  "locked": false
}

## Supported element types
div, section, header, footer, nav, main, h1-h6, p, span, a, button, img, input, form, textarea, select, option, ul, ol, li, table, thead, tbody, tr, td, th, label, figure, figcaption, blockquote, article, aside, strong, em, video, audio, iframe.

## Framework-specific conversion rules

### React / Next.js (JSX / TSX)
1. **Components** → Flatten React component trees into their rendered HTML output. If a component renders a <div className="card">, convert that to { type: "div", props: { className: "card" }, ... }.
2. **JSX expressions** → Evaluate simple expressions. For {title} or {props.title}, use reasonable placeholder text like "Page Title".
3. **Conditional rendering** → Render the truthy branch. For {isLoggedIn ? <Profile /> : <Login />}, pick the primary UI path.
4. **map() calls** → Render 2-3 representative items from list renders.
5. **Hooks / state** → Ignore hooks; use default/initial state values to determine what renders.
6. **Imports** → Trace imported components through the provided files. If a component file is available, inline its rendered output at the usage site.
7. **Next.js specifics** → Handle page.tsx/layout.tsx/app structure. Treat <Link> as <a>, <Image> as <img>.
8. **Client/Server Components** → Ignore 'use client'/'use server' directives; focus on the rendered DOM output.

### Vue (.vue SFC)
1. **Template** → Convert the <template> section directly to PageNodes.
2. **v-for** → Render 2-3 representative iterations.
3. **v-if / v-show** → Render the truthy branch.
4. **{{ interpolation }}** → Use reasonable placeholder text.
5. **<script setup>** → Ignore script logic; use default values for reactive state.
6. **Scoped styles** → Extract relevant styles from <style scoped>.
7. **Component composition** → Trace child components through provided files.

### Svelte (.svelte)
1. **Template** → Convert the HTML section to PageNodes.
2. **{#each}** → Render 2-3 representative items.
3. **{#if}** → Render the truthy branch.
4. **{expression}** → Use placeholder text.
5. **<style>** → Extract and apply relevant styles.

### Vanilla HTML/CSS
1. **HTML elements** → Map each HTML element to its corresponding type.
2. **CSS classes** → Convert to Tailwind utility classes where possible.
3. **Inline styles** → Convert to camelCase style objects.
4. **External stylesheets** → Apply styles found in provided CSS files.

## Universal conversion rules

1. **Text content** → Put visible text into props.text. Example: <h1 class="title">Hello</h1> → { type: "h1", props: { text: "Hello", className: "title" }, children: [] }

2. **CSS/Tailwind classes** → Put class attributes into props.className. Convert inline styles to the style object with camelCase keys. When possible, convert CSS to Tailwind utility classes.

3. **Images** → { type: "img", props: { src: "url", alt: "text", className: "..." } }. Preserve original src URLs. For Next.js <Image>, extract src and alt.

4. **Links** → { type: "a", props: { text: "...", href: "...", className: "..." } }

5. **Forms** → Preserve form, input (with placeholder, type), textarea, select, option, button, label.

6. **Nesting** → Preserve the full DOM hierarchy.

7. **IDs** → Generate unique, descriptive IDs: "header-section", "nav-links", "hero-title", etc.

8. **Theme detection** → Analyze styles to detect primary color, font family, border radius. Detect from:
   - CSS variables (--primary, --font-family, --radius)
   - Tailwind config (if tailwind.config provided)
   - Most-used non-neutral color
   - Body/root font-family

9. **Skip non-visual** → Ignore <script>, <style>, <meta>, <link>, <noscript>, comments, import statements, hook calls, utility functions.

10. **Clean up** → Remove JavaScript event handlers, data-* attributes, framework-specific attributes (ng-*, v-*, x-*, on:*, bind:*).

11. **Top-level sections** → Group into logical sections (header, hero, content, footer).

12. **SCSS / Sass / Less** → Treat as CSS; extract relevant class names and style values. Ignore mixins, variables, and nesting syntax—just extract the final visual properties.

13. **package.json** → If provided, use the dependencies to understand which framework is being used to better interpret component files.

14. **TypeScript** → Ignore type annotations, interfaces, generics. Focus only on the rendered JSX/template output.

## Important

- Return ONLY the JSON object, nothing else.
- The output must be a valid PageDocument that can be rendered immediately.
- Preserve as much of the original visual layout and content as possible.
- If the source is very complex, focus on the main content areas and simplify deeply nested structures.
- Always produce at least one node. Never return an empty nodes array.
- When source files reference component libraries (shadcn/ui, MUI, Chakra, Vuetify, etc.), infer what they render visually and produce equivalent semantic HTML nodes.`;

/** Maximum sizes for import payloads */
export const MAX_FILE_SIZE = 500_000; // 500KB per file
export const MAX_TOTAL_PAYLOAD = 800_000; // 800KB total
export const MAX_FILES_COUNT = 30;

/** File extensions recognized by the import pipeline */
export const COMPONENT_EXTENSIONS = [
  ".jsx", ".tsx", ".js", ".ts",
  ".vue", ".svelte",
];

export const STYLE_EXTENSIONS = [
  ".css", ".scss", ".sass", ".less", ".module.css",
];

export const MARKUP_EXTENSIONS = [".html", ".htm"];

export const CONFIG_FILES = [
  "package.json",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tailwind.config.mjs",
];

export const ALL_IMPORTABLE_EXTENSIONS = [
  ...MARKUP_EXTENSIONS,
  ...STYLE_EXTENSIONS,
  ...COMPONENT_EXTENSIONS,
  ".json", ".md", ".mdx",
];

/** Detect the project framework from a package.json dependency list */
export function detectFramework(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string> = {}
): string {
  const all = { ...dependencies, ...devDependencies };
  if (all["next"]) return "nextjs";
  if (all["nuxt"] || all["nuxt3"]) return "nuxt";
  if (all["@sveltejs/kit"] || all["svelte"]) return "svelte";
  if (all["vue"] || all["@vue/cli-service"]) return "vue";
  if (all["react"] || all["react-dom"]) return "react";
  if (all["@angular/core"]) return "angular";
  return "vanilla";
}

/**
 * Prioritize which files to send to the AI (budget-limited).
 * Returns files sorted by importance, truncated to fit within limits.
 */
export function prioritizeFiles(
  files: { name: string; content: string }[],
  maxTotalChars: number = 120_000
): { name: string; content: string }[] {
  const PRIORITY_PATTERNS = [
    // Entry points (highest priority)
    /^(index|app|page|layout|main|home)\.(html|htm|tsx|jsx|vue|svelte|ts|js)$/i,
    /^src\/(app|pages|routes)\//i,
    /^app\//i,
    /^pages?\//i,
    // Config
    /^package\.json$/i,
    /^tailwind\.config/i,
    // Components
    /\.(tsx|jsx|vue|svelte)$/i,
    // Styles
    /\.(css|scss|sass|less)$/i,
    // Other markup
    /\.(html|htm)$/i,
    // TypeScript / JavaScript
    /\.(ts|js)$/i,
    // Everything else
    /./,
  ];

  const scored = files.map((f) => {
    const basename = f.name.split("/").pop() ?? f.name;
    let priority = PRIORITY_PATTERNS.length;
    for (let i = 0; i < PRIORITY_PATTERNS.length; i++) {
      if (PRIORITY_PATTERNS[i].test(basename) || PRIORITY_PATTERNS[i].test(f.name)) {
        priority = i;
        break;
      }
    }
    return { ...f, priority };
  });

  scored.sort((a, b) => a.priority - b.priority);

  const result: { name: string; content: string }[] = [];
  let totalChars = 0;

  for (const file of scored) {
    if (totalChars + file.content.length > maxTotalChars) {
      // Try to include a truncated version
      const remaining = maxTotalChars - totalChars;
      if (remaining > 500) {
        result.push({
          name: file.name,
          content: file.content.slice(0, remaining) + "\n// ... truncated ...",
        });
      }
      break;
    }
    result.push({ name: file.name, content: file.content });
    totalChars += file.content.length;
  }

  return result;
}
