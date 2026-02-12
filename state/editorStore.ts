import { create } from "zustand";
import type { PageDocument, PatchAction, PatchHistoryEntry } from "@/lib/schema";
import type { EditConstraints } from "@/lib/constraintValidator";
import { STARTER_PAGE } from "@/lib/schema";
import { applyActions } from "@/lib/patchEngine";
import { filterLockedActions } from "@/lib/lockEngine";
import { validateConstraints } from "@/lib/constraintValidator";
import { createHistoryEntry, restoreFromHistory } from "@/lib/diffEngine";
import { getDesignSystem, applyDesignSystemToNodes } from "@/lib/designSystems";

interface EditorState {
  /** The current page document */
  page: PageDocument;
  /** Currently selected node ID */
  selectedNodeId: string | null;
  /** IDs of locked (non-editable) nodes */
  lockedNodeIds: string[];
  /** Full undo history */
  history: PatchHistoryEntry[];
  /** Active edit constraints */
  constraints: EditConstraints;
  /** Whether an AI request is in progress */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
  /** Active design system ID */
  activeDesignSystemId: string;

  // — Actions —

  /** Select a node by ID */
  selectNode: (id: string | null) => void;

  /** Apply a set of patch actions from AI or user, with locking + constraint checks */
  applyPatch: (prompt: string, actions: PatchAction[]) => void;

  /** Undo the most recent patch (restores snapshot) */
  undoPatch: () => void;

  /** Undo a specific history entry by ID (restores that entry's snapshotBefore) */
  undoPatchById: (patchId: string) => void;

  /** Lock a node to prevent AI edits */
  lockNode: (id: string) => void;

  /** Unlock a previously locked node */
  unlockNode: (id: string) => void;

  /** Update the page theme */
  updateTheme: (themeChanges: Partial<PageDocument["theme"]>) => void;

  /** Apply a predefined design system by ID */
  applyDesignSystem: (designSystemId: string) => void;

  /** Update constraints */
  setConstraints: (constraints: Partial<EditConstraints>) => void;

  /** Set loading state */
  setLoading: (loading: boolean) => void;

  /** Set error message */
  setError: (error: string | null) => void;

  /** Replace the entire page (e.g. from an import), with history snapshot */
  setPage: (page: PageDocument, label?: string) => void;

  /** Reset to starter page */
  resetPage: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  page: STARTER_PAGE,
  selectedNodeId: null,
  lockedNodeIds: [],
  history: [],
  constraints: {
    allowTextChanges: true,
    allowStyleChanges: true,
    allowLayoutChanges: true,
  },
  isLoading: false,
  error: null,
  activeDesignSystemId: "base",

  selectNode: (id) => set({ selectedNodeId: id }),

  applyPatch: (prompt, actions) => {
    const state = get();

    // Step 1: filter locked nodes
    const unlocked = filterLockedActions(actions, state.lockedNodeIds);

    // Step 2: validate constraints
    const { allowed } = validateConstraints(unlocked, state.constraints);

    if (allowed.length === 0) {
      set({ error: "All actions were blocked by locks or constraints." });
      return;
    }

    // Step 3: create history entry (snapshot BEFORE applying)
    const historyEntry = createHistoryEntry(prompt, allowed, state.page);

    // Step 4: apply patch actions
    const newPage = applyActions(state.page, allowed);

    set({
      page: newPage,
      history: [...state.history, historyEntry],
      error: null,
    });
  },

  undoPatch: () => {
    const state = get();
    if (state.history.length === 0) return;

    const lastEntry = state.history[state.history.length - 1];
    const restoredPage = restoreFromHistory(lastEntry);

    set({
      page: restoredPage,
      history: state.history.slice(0, -1),
    });
  },

  undoPatchById: (patchId) => {
    const state = get();
    const entryIndex = state.history.findIndex((h) => h.id === patchId);
    if (entryIndex === -1) return;

    const entry = state.history[entryIndex];
    const restoredPage = restoreFromHistory(entry);

    set({
      page: restoredPage,
      history: state.history.slice(0, entryIndex),
    });
  },

  lockNode: (id) => {
    const state = get();
    if (state.lockedNodeIds.includes(id)) return;
    set({ lockedNodeIds: [...state.lockedNodeIds, id] });
  },

  unlockNode: (id) => {
    const state = get();
    set({ lockedNodeIds: state.lockedNodeIds.filter((nid) => nid !== id) });
  },

  updateTheme: (themeChanges) => {
    const state = get();
    const historyEntry = createHistoryEntry("Theme update", [
      { targetId: "__theme__", type: "UPDATE_THEME", changes: themeChanges },
    ], state.page);

    set({
      page: {
        ...state.page,
        theme: { ...state.page.theme, ...themeChanges },
      },
      history: [...state.history, historyEntry],
    });
  },

  applyDesignSystem: (designSystemId) => {
    const state = get();
    const preset = getDesignSystem(designSystemId);
    if (!preset) return;

    const historyEntry = createHistoryEntry(
      `Design system: ${preset.name}`,
      [{ targetId: "__theme__", type: "UPDATE_THEME", changes: preset.theme as unknown as Record<string, unknown> }],
      state.page
    );

    const updatedNodes = applyDesignSystemToNodes(state.page.nodes, preset);

    set({
      page: {
        theme: { ...preset.theme },
        nodes: updatedNodes,
      },
      activeDesignSystemId: designSystemId,
      history: [...state.history, historyEntry],
      error: null,
    });
  },

  setConstraints: (constraints) => {
    const state = get();
    set({ constraints: { ...state.constraints, ...constraints } });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setPage: (page, label) => {
    const state = get();
    const historyEntry = createHistoryEntry(
      label ?? "Imported page",
      [{ targetId: "__root__", type: "ADD_NODE", changes: {} }],
      state.page
    );
    set({
      page,
      selectedNodeId: null,
      lockedNodeIds: [],
      history: [...state.history, historyEntry],
      error: null,
    });
  },

  resetPage: () =>
    set({
      page: STARTER_PAGE,
      selectedNodeId: null,
      lockedNodeIds: [],
      history: [],
      error: null,
    }),
}));
