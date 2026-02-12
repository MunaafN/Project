import type { PageNode } from "./schema";

/** Valid primitive HTML element types that can be selected and edited */
export const PRIMITIVE_TYPES = [
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "button",
  "section",
  "header",
  "footer",
  "nav",
  "article",
  "main",
  "ul",
  "ol",
  "li",
  "label",
  "aside",
  "figure",
  "figcaption",
  "blockquote",
  "strong",
  "em",
  "img",
  "input",
  "form",
  "textarea",
  "select",
  "option",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

export type PrimitiveType = (typeof PRIMITIVE_TYPES)[number];

export function isPrimitiveType(type: string): type is PrimitiveType {
  return (PRIMITIVE_TYPES as readonly string[]).includes(type);
}

/** Collect all nodes from the tree in depth-first order (including nested) */
export function collectAllNodes(nodes: PageNode[]): PageNode[] {
  const result: PageNode[] = [];
  function walk(node: PageNode) {
    result.push(node);
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return result;
}
