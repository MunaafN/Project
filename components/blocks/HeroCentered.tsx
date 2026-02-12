"use client";

import React from "react";

interface HeroCenteredProps {
  props: {
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function HeroCentered({ props, style, children }: HeroCenteredProps) {
  const { heading, subheading, ctaText, ctaLink } = props;

  return (
    <section style={style} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative max-w-4xl mx-auto text-center">
        {children ? (
          children
        ) : (
          <>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              {heading ?? "Your Headline Here"}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {subheading ?? "Your subheading goes here"}
            </p>
            <a
              href={ctaLink ?? "#"}
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-colors"
            >
              {ctaText ?? "Get Started"}
            </a>
          </>
        )}
      </div>
    </section>
  );
}
