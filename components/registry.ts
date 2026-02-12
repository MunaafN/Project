import React, { type ComponentType } from "react";
import HeroCentered from "./blocks/HeroCentered";
import HeroSplitImageLeft from "./blocks/HeroSplitImageLeft";
import PricingGrid from "./blocks/PricingGrid";
import Testimonials from "./blocks/Testimonials";
import PrimitiveElement from "./blocks/PrimitiveElement";
import { PRIMITIVE_TYPES } from "@/lib/nodeUtils";

export interface BlockComponentProps {
  props: Record<string, unknown>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const BLOCK_REGISTRY: Record<string, ComponentType<BlockComponentProps>> = {
  HeroCentered: HeroCentered as ComponentType<BlockComponentProps>,
  HeroSplitImageLeft: HeroSplitImageLeft as ComponentType<BlockComponentProps>,
  PricingGrid: PricingGrid as ComponentType<BlockComponentProps>,
  Testimonials: Testimonials as ComponentType<BlockComponentProps>,
};

/** Wrapper that renders a primitive element by type */
function createPrimitiveComponent(
  elementType: string
): ComponentType<BlockComponentProps> {
  const Primitive = PrimitiveElement;
  return (props) =>
    React.createElement(Primitive, {
      type: elementType,
      props: props.props,
      style: props.style,
      children: props.children,
    });
}

const COMPONENT_REGISTRY: Record<string, ComponentType<BlockComponentProps>> = {
  ...BLOCK_REGISTRY,
  ...Object.fromEntries(
    PRIMITIVE_TYPES.map((t) => [t, createPrimitiveComponent(t)])
  ),
};

/**
 * Look up a component by type name. Returns undefined if not found.
 */
export function getComponent(type: string): ComponentType<BlockComponentProps> | undefined {
  return COMPONENT_REGISTRY[type];
}

/**
 * Get all registered component type names.
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(COMPONENT_REGISTRY);
}

export default COMPONENT_REGISTRY;
