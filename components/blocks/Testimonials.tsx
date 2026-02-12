"use client";

import React from "react";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

interface TestimonialsProps {
  props: {
    heading?: string;
    testimonials?: Testimonial[];
  };
  style?: React.CSSProperties;
}

export default function Testimonials({ props, style }: TestimonialsProps) {
  const { heading, testimonials } = props;

  const defaultTestimonials: Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Developer",
      avatar: "SC",
      quote: "Amazing tool for rapid prototyping.",
    },
    {
      name: "Marcus Johnson",
      role: "Founder",
      avatar: "MJ",
      quote: "Launched our site in under an hour.",
    },
    {
      name: "Elena Rodriguez",
      role: "Designer",
      avatar: "ER",
      quote: "Best iteration speed I've ever experienced.",
    },
  ];

  const displayTestimonials = testimonials ?? defaultTestimonials;

  return (
    <section style={style}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          {heading ?? "What people are saying"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-medium text-indigo-400">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-zinc-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
