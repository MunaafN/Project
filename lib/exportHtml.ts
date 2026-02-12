import type { PageDocument, PageNode } from "./schema";

/** Convert a camelCase CSS property to kebab-case */
function toKebab(prop: string): string {
  return prop.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/** Convert a style object into an inline style string */
function styleToString(style: Record<string, string>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${toKebab(k)}: ${v}`)
    .join("; ");
}

/** Escape HTML special characters (safe for double-quoted attribute contexts) */
function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a value for safe inclusion inside a JavaScript single-quoted string literal.
 * Prevents script injection via theme values.
 */
function escJs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

/**
 * Sanitize a CSS value to prevent injection in style contexts.
 * Strips characters that could break out of a CSS property value.
 */
function escCss(value: string): string {
  return value.replace(/[;{}\\<>"'()]/g, "");
}

/** Void (self-closing) HTML elements */
const VOID_ELEMENTS = new Set(["img", "input", "br", "hr", "meta", "link", "col"]);

/** Block component types that need special rendering */
const BLOCK_COMPONENTS = new Set(["HeroCentered", "HeroSplitImageLeft", "PricingGrid", "Testimonials"]);

/**
 * Recursively render a PageNode tree into HTML string.
 * Block components are rendered as semantic <section> wrappers.
 */
function renderNode(node: PageNode): string {
  const tag = BLOCK_COMPONENTS.has(node.type) ? "section" : node.type;
  const isVoid = VOID_ELEMENTS.has(tag);

  // Build attribute string
  const attrs: string[] = [];

  const className = node.props.className as string | undefined;
  if (className) attrs.push(`class="${escHtml(className)}"`);

  const href = node.props.href as string | undefined;
  if (href) attrs.push(`href="${escHtml(href)}"`);

  const src = node.props.src as string | undefined;
  if (src) attrs.push(`src="${escHtml(src)}"`);

  const alt = node.props.alt as string | undefined;
  if (alt) attrs.push(`alt="${escHtml(alt)}"`);

  const placeholder = node.props.placeholder as string | undefined;
  if (placeholder) attrs.push(`placeholder="${escHtml(placeholder)}"`);

  const type = node.props.type as string | undefined;
  if (type) attrs.push(`type="${escHtml(type)}"`);

  const name = node.props.name as string | undefined;
  if (name) attrs.push(`name="${escHtml(name)}"`);

  const value = node.props.value as string | undefined;
  if (value) attrs.push(`value="${escHtml(value)}"`);

  // Inline styles
  const styleStr = styleToString(node.style);
  if (styleStr) attrs.push(`style="${escHtml(styleStr)}"`);

  const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

  if (isVoid) {
    return `<${tag}${attrStr} />`;
  }

  // Content: text prop or rendered children
  const textContent = (node.props.text ?? node.props.content) as string | undefined;
  const childrenHtml = node.children.length > 0
    ? node.children.map(renderNode).join("\n")
    : "";
  const innerHtml = childrenHtml || (textContent ? escHtml(textContent) : "");

  return `<${tag}${attrStr}>${innerHtml}</${tag}>`;
}

/**
 * Export a PageDocument as a complete, self-contained HTML page.
 * Includes Tailwind CSS via CDN and Google Fonts.
 * All user-controlled values are properly escaped to prevent XSS.
 */
export function exportPageToHtml(page: PageDocument): string {
  const { theme, nodes } = page;

  const fontFamily = theme.font || "Inter";
  const safeFontJs = escJs(fontFamily);
  const safeFontCss = escCss(fontFamily);
  const safePrimaryColorJs = escJs(theme.primaryColor);
  const safeRadiusJs = escJs(theme.radius);
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;800&display=swap`;

  const bodyHtml = nodes.map(renderNode).join("\n");

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta http-equiv="X-Frame-Options" content="DENY" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <title>My Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${escHtml(googleFontUrl)}" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['${safeFontJs}', 'system-ui', 'sans-serif'] },
          colors: { primary: '${safePrimaryColorJs}' },
          borderRadius: { DEFAULT: '${safeRadiusJs}' },
        }
      }
    };
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: '${safeFontCss}', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body class="bg-[#09090b] text-white min-h-screen">
${bodyHtml}
</body>
</html>`;
}
