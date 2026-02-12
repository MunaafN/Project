"use client";

import React from "react";
import Link from "next/link";
import { useEditorStore } from "@/state/editorStore";
import { Pen, Palette, Clock, Zap, Layers, Sparkles } from "lucide-react";

const CARDS = [
  {
    href: "/editor",
    icon: Pen,
    title: "Editor",
    description: "Open the canvas to visually edit your website with AI. Select elements, tweak styles, and build pages.",
    gradient: "from-indigo-600/20 to-violet-600/20",
    iconBg: "bg-indigo-600",
  },
  {
    href: "/design",
    icon: Palette,
    title: "Design Systems",
    description: "Choose from preset design systems or create your own. Change fonts, colors, and styles globally.",
    gradient: "from-fuchsia-600/20 to-pink-600/20",
    iconBg: "bg-fuchsia-600",
  },
  {
    href: "/history",
    icon: Clock,
    title: "Edit History",
    description: "Review every AI edit you've made. Undo changes with one click and track your progress.",
    gradient: "from-amber-600/20 to-orange-600/20",
    iconBg: "bg-amber-600",
  },
] as const;

export default function DashboardPage() {
  const { page, history } = useEditorStore();

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">AI-Powered Website Editor</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome to AI Editor
          </h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Build and customize your website visually with the help of AI. No code required — just describe what you want and watch it happen.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 mb-14">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Layers className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="text-lg font-semibold text-white leading-none">{page.nodes.length}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Elements</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Clock className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="text-lg font-semibold text-white leading-none">{history.length}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Edits</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Zap className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="text-lg font-semibold text-white leading-none">{page.theme.font}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Font</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ href, icon: Icon, title, description, gradient, iconBg }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <div className="mt-14 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Choose a Design", desc: "Pick a preset design system that matches your brand." },
              { step: "2", title: "Edit with AI", desc: "Select elements and describe changes in plain English." },
              { step: "3", title: "Preview & Export", desc: "Preview your site and export when you're happy." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-zinc-400">{step}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-300 mb-0.5">{title}</p>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
