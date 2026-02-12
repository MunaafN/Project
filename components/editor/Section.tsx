"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        {icon}
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest flex-1">
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-0.5">{children}</div>}
    </div>
  );
}
