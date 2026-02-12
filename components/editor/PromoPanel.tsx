"use client";

import React from "react";
import { FEATURE_HIGHLIGHTS, AI_TIPS } from "./constants";
import { Star, Lightbulb } from "lucide-react";

export function PromoPanel() {
  return (
    <div className="shrink-0">
      {/* Features */}
      <div className="px-4 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400/90 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">What You Can Do</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2 border-b border-zinc-800/80">
        {FEATURE_HIGHLIGHTS.map((feature, i) => (
          <div
            key={i}
            className="text-xs text-zinc-500 flex items-start gap-2.5 leading-relaxed"
          >
            <span className="text-indigo-400/60 mt-0.5 shrink-0">•</span>
            <span className="min-w-0">{feature}</span>
          </div>
        ))}
      </div>

      {/* AI Tips */}
      <div className="px-4 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400/90 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">Quick Tips</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {AI_TIPS.map((tip, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 text-xs text-zinc-400 leading-relaxed hover:border-zinc-700/80 transition-colors"
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
