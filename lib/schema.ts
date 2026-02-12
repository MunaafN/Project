/** Core JSON schema types for the page document */

export interface PageNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  style: Record<string, string>;
  children: PageNode[];
  locked?: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  font: string;
  radius: string;
  spacing: string;

  /* ── Extended design tokens (optional, v0-style) ── */
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  muted?: string;
  mutedForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  sidebar?: string;
  sidebarForeground?: string;

  /* Typography */
  fontSans?: string;
  fontSerif?: string;
  fontMono?: string;

  /* Shadow */
  shadowX?: string;
  shadowY?: string;
  shadowBlur?: string;
  shadowSpread?: string;
  shadowColor?: string;
}

export interface PageDocument {
  theme: ThemeConfig;
  nodes: PageNode[];
}

export interface PatchAction {
  targetId: string;
  type:
    | "UPDATE_PROPS"
    | "UPDATE_STYLE"
    | "UPDATE_TEXT"
    | "SWAP_COMPONENT"
    | "REPLACE_SECTION"
    | "UPDATE_THEME"
    | "ADD_NODE"
    | "REMOVE_NODE";
  changes: Record<string, unknown>;
}

export interface PatchHistoryEntry {
  id: string;
  prompt: string;
  actions: PatchAction[];
  snapshotBefore: PageDocument;
  timestamp: number;
}

/** Starter page — empty canvas, ready for user to build from scratch via AI */
export const STARTER_PAGE: PageDocument = {
  theme: {
    primaryColor: "#6366f1",
    font: "Inter",
    radius: "0.5rem",
    spacing: "1rem",
  },
  nodes: [],
};
