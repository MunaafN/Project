import type { PatchAction } from "./schema";

export interface EditConstraints {
  allowTextChanges: boolean;
  allowStyleChanges: boolean;
  allowLayoutChanges: boolean;
}

const DEFAULT_CONSTRAINTS: EditConstraints = {
  allowTextChanges: true,
  allowStyleChanges: true,
  allowLayoutChanges: true,
};

/**
 * Map action types to the constraint they require.
 */
const ACTION_CONSTRAINT_MAP: Record<string, keyof EditConstraints | null> = {
  UPDATE_PROPS: "allowLayoutChanges",
  UPDATE_STYLE: "allowStyleChanges",
  UPDATE_TEXT: "allowTextChanges",
  SWAP_COMPONENT: "allowLayoutChanges",
  REPLACE_SECTION: "allowLayoutChanges",
  UPDATE_THEME: "allowStyleChanges",
  ADD_NODE: "allowLayoutChanges",
  REMOVE_NODE: "allowLayoutChanges",
};

/**
 * Filter patch actions based on active constraints.
 * Returns only the actions that satisfy the constraint requirements.
 */
export function validateConstraints(
  actions: PatchAction[],
  constraints: Partial<EditConstraints> = {}
): { allowed: PatchAction[]; rejected: PatchAction[] } {
  const merged: EditConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  const allowed: PatchAction[] = [];
  const rejected: PatchAction[] = [];

  for (const action of actions) {
    const requiredConstraint = ACTION_CONSTRAINT_MAP[action.type];

    if (requiredConstraint === null || requiredConstraint === undefined) {
      allowed.push(action);
      continue;
    }

    if (merged[requiredConstraint]) {
      allowed.push(action);
    } else {
      rejected.push(action);
    }
  }

  return { allowed, rejected };
}
