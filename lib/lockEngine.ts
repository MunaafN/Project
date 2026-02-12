import type { PatchAction } from "./schema";

/**
 * Filter out any patch actions that target locked nodes.
 * Returns only the actions that are allowed (i.e., not targeting locked node IDs).
 */
export function filterLockedActions(
  actions: PatchAction[],
  lockedNodeIds: string[]
): PatchAction[] {
  if (lockedNodeIds.length === 0) return actions;

  const lockedSet = new Set(lockedNodeIds);
  return actions.filter((action) => {
    // UPDATE_THEME has no specific target node, always allowed
    if (action.type === "UPDATE_THEME") return true;
    // ADD_NODE targets a parent — allow if the parent is not locked
    // (targetId "__root__" is never locked)
    if (action.type === "ADD_NODE") {
      return action.targetId === "__root__" || !lockedSet.has(action.targetId);
    }
    return !lockedSet.has(action.targetId);
  });
}

/**
 * Check if a specific node is locked.
 */
export function isNodeLocked(
  nodeId: string,
  lockedNodeIds: string[]
): boolean {
  return lockedNodeIds.includes(nodeId);
}
