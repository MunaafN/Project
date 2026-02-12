"use client";

import React from "react";
import { EditorNav } from "@/components/editor/EditorNav";

export default function EditorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] overflow-hidden">
      <EditorNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
