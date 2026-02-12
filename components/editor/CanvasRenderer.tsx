"use client";

import React, { useCallback } from "react";
import { useEditorStore } from "@/state/editorStore";
import { getComponent } from "@/components/registry";
import type { PageNode } from "@/lib/schema";
import { Sparkles } from "lucide-react";

/**
 * Elements that CANNOT be wrapped in a <div> due to strict HTML nesting rules.
 * This includes:
 * - Table internals: their parents only allow specific children
 * - Phrasing (inline) elements: <p>, <span>, <a>, headings, etc. cannot contain <div>
 * - List items, select options
 */
const NO_DIV_WRAP_TYPES = new Set([
  // Table internals
  "thead", "tbody", "tfoot", "tr", "td", "th",
  "caption", "colgroup", "col",
  // List items
  "li",
  // Select internals
  "option", "optgroup",
  // Phrasing / inline elements that cannot contain <div>
  "p", "span", "a", "button", "label",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "small", "b", "i", "u",
  "abbr", "cite", "code", "kbd", "mark", "q", "s", "sub", "sup", "time", "var",
]);

export function CanvasRenderer() {
  const { page, selectedNodeId, selectNode } = useEditorStore();

  const renderNode = useCallback(
    (node: PageNode): React.ReactNode => {
      const Component = getComponent(node.type);
      if (!Component) {
        return (
          <div
            key={node.id}
            className="p-4 border border-dashed border-zinc-700 rounded text-sm text-zinc-500"
          >
            Unknown component: {node.type}
          </div>
        );
      }

      const isSelected = selectedNodeId === node.id;
      const renderedChildren = node.children.length
        ? node.children.map((child) => renderNode(child))
        : undefined;

      // For elements with strict HTML nesting rules, render WITHOUT a wrapper div.
      // Selection is indicated via outline styles injected directly into the element's props.
      if (NO_DIV_WRAP_TYPES.has(node.type)) {
        const selectionStyle: React.CSSProperties = isSelected
          ? { outline: "2px solid rgba(99, 102, 241, 0.6)", outlineOffset: "-2px", cursor: "pointer" }
          : { cursor: "pointer" };

        const mergedStyle = {
          ...(node.style as React.CSSProperties),
          ...selectionStyle,
        };

        return (
          <Component
            key={node.id}
            props={{
              ...node.props,
              onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectNode(node.id); },
            }}
            style={mergedStyle}
            children={renderedChildren}
          />
        );
      }

      // Standard elements: wrap in a div with full selection UI
      const inner = (
        <Component
          props={node.props as Record<string, unknown>}
          style={node.style as React.CSSProperties}
          children={renderedChildren}
        />
      );

      return (
        <div
          key={node.id}
          className={`relative group cursor-pointer transition-all duration-150 ${
            isSelected
              ? "ring-2 ring-indigo-500/60 ring-offset-2 ring-offset-[#09090b] rounded-sm"
              : "hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-[#09090b] rounded-sm"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            selectNode(node.id);
          }}
        >
          {isSelected && (
            <div className="absolute -top-3 left-2 z-10 bg-indigo-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-lg shadow-indigo-500/20">
              {node.type}
            </div>
          )}
          {!isSelected && (
            <div className="absolute -top-3 left-2 z-10 bg-zinc-800 text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-700/50">
              {node.type}
            </div>
          )}
          {inner}
        </div>
      );
    },
    [selectedNodeId, selectNode]
  );

  // Empty state when no nodes exist
  if (page.nodes.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center" onClick={() => selectNode(null)}>
        <div className="text-center max-w-md px-6 py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Your canvas is empty</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-1">
            Use the prompt bar below to start building. Try something like:
          </p>
          <div className="mt-4 space-y-2">
            {[
              "Build a login page",
              "Create a landing page with a hero section",
              "Make a pricing page with 3 tiers",
              "Build a contact form",
            ].map((suggestion) => (
              <div
                key={suggestion}
                className="text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2"
              >
                &ldquo;{suggestion}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pt-4" onClick={() => selectNode(null)}>
      {page.nodes.map(renderNode)}
    </div>
  );
}
