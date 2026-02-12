import type { PageDocument, PatchAction, PatchHistoryEntry } from "./schema";

let diffCounter = 0;

/**
 * Generate a unique ID for a history entry.
 */
function generateHistoryId(): string {
  diffCounter += 1;
  return `hist_${Date.now()}_${diffCounter}`;
}

/**
 * Compute a shallow diff between two values, returning changed keys.
 */
export function computeShallowDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeVal = JSON.stringify(before[key]);
    const afterVal = JSON.stringify(after[key]);
    if (beforeVal !== afterVal) {
      diff[key] = { from: before[key], to: after[key] };
    }
  }

  return diff;
}

/**
 * Create a PatchHistoryEntry that stores the snapshot before changes,
 * along with the prompt and actions, so undo can restore the exact previous state.
 */
export function createHistoryEntry(
  prompt: string,
  actions: PatchAction[],
  snapshotBefore: PageDocument
): PatchHistoryEntry {
  return {
    id: generateHistoryId(),
    prompt,
    actions,
    snapshotBefore: JSON.parse(JSON.stringify(snapshotBefore)),
    timestamp: Date.now(),
  };
}

/**
 * Restore the page to the state before a specific history entry was applied.
 */
export function restoreFromHistory(entry: PatchHistoryEntry): PageDocument {
  return JSON.parse(JSON.stringify(entry.snapshotBefore));
}

/**
 * Compute a human-readable summary of actions for display in the diff viewer.
 */
export function summarizeActions(
  actions: PatchAction[]
): { targetId: string; type: string; summary: string }[] {
  return actions.map((action) => {
    let summary = "";

    switch (action.type) {
      case "UPDATE_PROPS":
        summary = `Updated props: ${Object.keys(action.changes).join(", ")}`;
        break;
      case "UPDATE_STYLE":
        summary = `Updated style: ${Object.keys(action.changes).join(", ")}`;
        break;
      case "UPDATE_TEXT":
        summary = `Changed text: ${Object.keys(action.changes).join(", ")}`;
        break;
      case "SWAP_COMPONENT":
        summary = `Swapped to: ${action.changes.newType ?? "unknown"}`;
        break;
      case "REPLACE_SECTION":
        summary = `Replaced entire section`;
        break;
      case "UPDATE_THEME":
        summary = `Theme updated: ${Object.keys(action.changes).join(", ")}`;
        break;
      case "ADD_NODE": {
        const newNode = action.changes.node as { type?: string; id?: string } | undefined;
        summary = `Added ${newNode?.type ?? "node"}: ${newNode?.id ?? "unknown"}`;
        break;
      }
      case "REMOVE_NODE":
        summary = `Removed node`;
        break;
      default:
        summary = `Unknown action`;
    }

    return {
      targetId: action.targetId,
      type: action.type,
      summary,
    };
  });
}
