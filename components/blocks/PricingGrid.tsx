"use client";

import React from "react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
}

interface PricingGridProps {
  props: {
    heading?: string;
    subheading?: string;
    plans?: PricingPlan[];
  };
  style?: React.CSSProperties;
}

export default function PricingGrid({ props, style }: PricingGridProps) {
  const { heading, subheading, plans } = props;

  const defaultPlans: PricingPlan[] = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["3 projects", "Basic AI", "Community support"],
      ctaText: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      features: ["Unlimited projects", "Advanced AI", "Priority support"],
      ctaText: "Upgrade",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      features: ["Everything in Pro", "SSO", "SLA"],
      ctaText: "Contact Sales",
      highlighted: false,
    },
  ];

  const displayPlans = plans ?? defaultPlans;

  return (
    <section style={style}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {heading ?? "Pricing"}
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            {subheading ?? "Choose your plan"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-zinc-300">
                    <svg
                      className="w-4 h-4 mr-3 text-indigo-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
