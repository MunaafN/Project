import type { PageDocument, PageNode, PatchAction } from "./schema";

/**
 * Deep-clone a page document to avoid mutation.
 */
function clonePage(page: PageDocument): PageDocument {
  return JSON.parse(JSON.stringify(page));
}

/**
 * Recursively find and update a node by ID within the node tree.
 * Returns true if the node was found and updated.
 */
function updateNodeInTree(
  nodes: PageNode[],
  targetId: string,
  updater: (node: PageNode) => PageNode
): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      nodes[i] = updater(nodes[i]);
      return true;
    }
    if (nodes[i].children.length > 0) {
      const found = updateNodeInTree(nodes[i].children, targetId, updater);
      if (found) return true;
    }
  }
  return false;
}

/**
 * Apply UPDATE_PROPS action: merges changes into node.props
 */
function applyUpdateProps(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  updateNodeInTree(result.nodes, action.targetId, (node) => ({
    ...node,
    props: { ...node.props, ...action.changes },
  }));
  return result;
}

/**
 * Apply UPDATE_STYLE action: merges changes into node.style
 */
function applyUpdateStyle(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  updateNodeInTree(result.nodes, action.targetId, (node) => ({
    ...node,
    style: { ...node.style, ...(action.changes as Record<string, string>) },
  }));
  return result;
}

/**
 * Apply UPDATE_TEXT action: updates a specific text prop
 */
function applyUpdateText(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  updateNodeInTree(result.nodes, action.targetId, (node) => ({
    ...node,
    props: { ...node.props, ...action.changes },
  }));
  return result;
}

/**
 * Apply SWAP_COMPONENT action: changes node type, optionally merges new props
 */
function applySwapComponent(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  updateNodeInTree(result.nodes, action.targetId, (node) => ({
    ...node,
    type: (action.changes.newType as string) ?? node.type,
    props: {
      ...node.props,
      ...((action.changes.props as Record<string, unknown>) ?? {}),
    },
  }));
  return result;
}

/**
 * Apply REPLACE_SECTION action: replaces entire node with new node data
 */
function applyReplaceSection(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  const replacement = action.changes.node as PageNode | undefined;
  if (!replacement) return result;

  updateNodeInTree(result.nodes, action.targetId, () => ({
    ...replacement,
    id: action.targetId,
  }));
  return result;
}

/**
 * Apply UPDATE_THEME action: merges changes into page theme
 */
function applyUpdateTheme(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  result.theme = { ...result.theme, ...(action.changes as Partial<typeof result.theme>) };
  return result;
}

/**
 * Recursively find a parent node that contains a child with the given ID.
 * Returns the parent's children array and the index of the child, or null.
 */
function findParentArray(
  nodes: PageNode[],
  childId: string
): { array: PageNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === childId) {
      return { array: nodes, index: i };
    }
    if (nodes[i].children.length > 0) {
      const found = findParentArray(nodes[i].children, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively find a node by ID in the tree.
 */
function findNodeById(nodes: PageNode[], id: string): PageNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Apply ADD_NODE action: inserts a new node into the page tree.
 *
 * targetId semantics:
 *   - "__root__" → append to the top-level page.nodes array
 *   - Any existing node ID → append as a child of that node
 *
 * changes.node    — the full PageNode to insert (required)
 * changes.position — optional: "first", "last" (default), or a numeric index
 * changes.afterId  — optional: insert after the sibling with this ID
 * changes.beforeId — optional: insert before the sibling with this ID
 */
function applyAddNode(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);
  const newNode = action.changes.node as PageNode | undefined;
  if (!newNode) return result;

  // Ensure the new node has the required shape
  const safeNode: PageNode = {
    id: newNode.id ?? `node-${Date.now()}`,
    type: newNode.type ?? "div",
    props: newNode.props ?? {},
    style: newNode.style ?? {},
    children: newNode.children ?? [],
    locked: false,
  };

  // Determine the target array to insert into
  let targetArray: PageNode[];
  if (action.targetId === "__root__") {
    targetArray = result.nodes;
  } else {
    const parent = findNodeById(result.nodes, action.targetId);
    if (!parent) {
      // If the parent doesn't exist, fall back to root
      targetArray = result.nodes;
    } else {
      targetArray = parent.children;
    }
  }

  // Determine insertion position
  const position = action.changes.position as string | number | undefined;
  const afterId = action.changes.afterId as string | undefined;
  const beforeId = action.changes.beforeId as string | undefined;

  if (afterId) {
    const idx = targetArray.findIndex((n) => n.id === afterId);
    if (idx !== -1) {
      targetArray.splice(idx + 1, 0, safeNode);
      return result;
    }
  }

  if (beforeId) {
    const idx = targetArray.findIndex((n) => n.id === beforeId);
    if (idx !== -1) {
      targetArray.splice(idx, 0, safeNode);
      return result;
    }
  }

  if (position === "first") {
    targetArray.unshift(safeNode);
  } else if (typeof position === "number") {
    targetArray.splice(position, 0, safeNode);
  } else {
    // Default: append at the end
    targetArray.push(safeNode);
  }

  return result;
}

/**
 * Apply REMOVE_NODE action: removes a node by targetId from the tree.
 */
function applyRemoveNode(page: PageDocument, action: PatchAction): PageDocument {
  const result = clonePage(page);

  // Try to find and remove from the tree
  const location = findParentArray(result.nodes, action.targetId);
  if (location) {
    location.array.splice(location.index, 1);
  }

  return result;
}

/**
 * Dispatches a single patch action to the appropriate handler.
 */
function applySingleAction(page: PageDocument, action: PatchAction): PageDocument {
  switch (action.type) {
    case "UPDATE_PROPS":
      return applyUpdateProps(page, action);
    case "UPDATE_STYLE":
      return applyUpdateStyle(page, action);
    case "UPDATE_TEXT":
      return applyUpdateText(page, action);
    case "SWAP_COMPONENT":
      return applySwapComponent(page, action);
    case "REPLACE_SECTION":
      return applyReplaceSection(page, action);
    case "UPDATE_THEME":
      return applyUpdateTheme(page, action);
    case "ADD_NODE":
      return applyAddNode(page, action);
    case "REMOVE_NODE":
      return applyRemoveNode(page, action);
    default:
      console.warn(`Unknown patch action type: ${action.type}`);
      return page;
  }
}

/**
 * Apply an array of patch actions to a page document, returning the new state.
 * Actions are applied in order. This is a pure function — the original page is not mutated.
 */
export function applyActions(
  page: PageDocument,
  actions: PatchAction[]
): PageDocument {
  return actions.reduce(
    (currentPage, action) => applySingleAction(currentPage, action),
    page
  );
}
