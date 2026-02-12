"use client";

import React from "react";
import type { PrimitiveType } from "@/lib/nodeUtils";

const VOID_ELEMENTS: readonly string[] = ["img", "input", "br", "hr"];

/** Props that are internal/custom and should NOT be forwarded to the DOM element */
const INTERNAL_PROPS = new Set(["text", "content", "children", "style"]);

interface PrimitiveElementProps {
  type: PrimitiveType | string;
  props: Record<string, unknown>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function PrimitiveElement({
  type,
  props,
  style,
  children,
}: PrimitiveElementProps) {
  const isVoid = VOID_ELEMENTS.includes(type);

  const safeProps: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!INTERNAL_PROPS.has(key)) {
      safeProps[key] = props[key];
    }
  }

  const mergedStyle = {
    ...(style ?? {}),
    ...((props.style as React.CSSProperties) ?? {}),
  };

  const textContent = (props.text ?? props.content ?? props.children) as
    | string
    | undefined;
  const content = children ?? textContent;

  return React.createElement(
    type,
    {
      ...safeProps,
      style: Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined,
    },
    isVoid ? undefined : content
  );
}
