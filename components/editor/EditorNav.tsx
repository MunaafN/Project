"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEditorStore } from "@/state/editorStore";
import { Zap, Pen, Palette, Clock, Upload, Rocket } from "lucide-react";

const NAV_LINKS = [
  { href: "/editor", label: "Editor", icon: Pen },
  { href: "/design", label: "Design", icon: Palette },
  { href: "/history", label: "History", icon: Clock },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/deploy", label: "Deploy", icon: Rocket },
] as const;

export function EditorNav() {
  const pathname = usePathname();
  const { page } = useEditorStore();

  return (
    <header className="h-12 border-b border-zinc-800/80 flex items-center justify-between px-5 shrink-0 bg-zinc-950/80 backdrop-blur-xl">
      {/* Left: logo + project name */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            AI Editor
          </span>
        </Link>
        <div className="w-px h-5 bg-zinc-800" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-500 font-medium">My Project</span>
        </div>
      </div>

      {/* Center: navigation links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "text-white bg-white/[0.08]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right: stats */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-zinc-600 font-medium">
          {page.nodes.length} nodes
        </span>
      </div>
    </header>
  );
}
