"use client";

import React, { useCallback } from "react";
import { useEditorStore } from "@/state/editorStore";
import { getComponent } from "@/components/registry";
import type { PageNode } from "@/lib/schema";

/**
 * Elements that CANNOT be wrapped in a <div> due to strict HTML nesting rules.
 * This includes table internals, list items, select internals,
 * and phrasing/inline elements like <p>, <span>, <a>, headings, etc.
 */
const NO_DIV_WRAP_TYPES = new Set([
  "thead", "tbody", "tfoot", "tr", "td", "th",
  "caption", "colgroup", "col",
  "li",
  "option", "optgroup",
  "p", "span", "a", "button", "label",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "small", "b", "i", "u",
  "abbr", "cite", "code", "kbd", "mark", "q", "s", "sub", "sup", "time", "var",
]);

export function PreviewCanvas() {
  const { page } = useEditorStore();

  const renderNode = useCallback(
    (node: PageNode): React.ReactNode => {
      const Component = getComponent(node.type);
      if (!Component) return null;

      const renderedChildren = node.children.length
        ? node.children.map((child) => renderNode(child))
        : undefined;

      // For strict-nesting elements, render directly without a wrapper div
      if (NO_DIV_WRAP_TYPES.has(node.type)) {
        return (
          <Component
            key={node.id}
            props={node.props as Record<string, unknown>}
            style={node.style as React.CSSProperties}
            children={renderedChildren}
          />
        );
      }

      return (
        <div key={node.id}>
          <Component
            props={node.props as Record<string, unknown>}
            style={node.style as React.CSSProperties}
            children={renderedChildren}
          />
        </div>
      );
    },
    []
  );

  return (
    <div className="min-h-full">
      {page.nodes.map(renderNode)}
    </div>
  );
}
