import type { PageNode } from "@/lib/schema";

/** Recursively find a node by ID within a PageNode tree */
export function findNodeRecursive(nodes: PageNode[], id: string): PageNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeRecursive(node.children, id);
    if (found) return found;
  }
  return undefined;
}
