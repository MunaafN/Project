"use client";

import React from "react";

interface HeroSplitImageLeftProps {
  props: {
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
  };
  style?: React.CSSProperties;
}

export default function HeroSplitImageLeft({ props, style }: HeroSplitImageLeftProps) {
  const { heading, subheading, ctaText, ctaLink, imageUrl } = props;

  return (
    <section style={style} className="overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-zinc-500 text-sm">Image Placeholder</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {heading ?? "Split Hero Title"}
          </h1>
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
            {subheading ?? "A compelling subheading that explains your product."}
          </p>
          <a
            href={ctaLink ?? "#"}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-colors"
          >
            {ctaText ?? "Learn More"}
          </a>
        </div>
      </div>
    </section>
  );
}
