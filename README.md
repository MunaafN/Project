# AI Editor

An AI-powered website editor built with Next.js. Pages are stored as a JSON schema and edited through structured patch actions — the AI never rewrites raw JSX or entire files. Instead, every change is a deterministic, undoable operation applied to a JSON document tree.

## What It Does

- **JSON-Schema Driven Rendering** — The page is a tree of typed nodes (`HeroCentered`, `PricingGrid`, `Testimonials`, etc.). Each node has an ID, props, style, and children. A component registry maps node types to React components that render them on a live canvas.

- **AI Patch Actions** — When you type a prompt, the AI returns structured actions like `UPDATE_PROPS`, `UPDATE_STYLE`, `UPDATE_TEXT`, `SWAP_COMPONENT`, `REPLACE_SECTION`, or `UPDATE_THEME`. These are applied deterministically to the JSON tree — no generated JSX ever reaches the page.

- **Click-to-Select** — Click any section on the canvas to select it. The prompt bar then targets that specific node. The left sidebar shows the full layer tree, the selected node's props, style, and type.

- **Locking** — Lock any node to prevent the AI from modifying it. Locked nodes are filtered out before patch actions are applied.

- **Constraints** — Toggle text, style, or layout constraints on/off. If style changes are disabled, the AI's `UPDATE_STYLE` and `UPDATE_THEME` actions are rejected before they reach the page.

- **Undo History** — Every prompt creates a snapshot of the page before changes are applied. You can undo any edit (or jump back to any point in history) with a single click. The right sidebar shows the full history with action summaries.

- **Section Regeneration** — A dedicated API endpoint regenerates an entire section with fresh AI-written content via a `REPLACE_SECTION` action.

- **Text Rewriting** — Another endpoint rewrites text in different modes (professional, casual, concise, expand, creative) via `UPDATE_TEXT` actions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, TailwindCSS, shadcn/ui primitives |
| State | Zustand |
| AI | OpenAI Chat Completions API (JSON mode) |
| Icons | Lucide React |

## Project Structure

```
app/
  page.tsx                          ← Single-page editor UI
  layout.tsx                        ← Root layout (dark theme)
  api/
    ai-edit/route.ts                ← General AI edit endpoint
    ai-regenerate/route.ts          ← Section regeneration endpoint
    ai-rewrite-text/route.ts        ← Text rewriting endpoint

components/
  blocks/
    HeroCentered.tsx                ← Centered hero section
    HeroSplitImageLeft.tsx          ← Split hero with image on left
    PricingGrid.tsx                 ← Three-column pricing cards
    Testimonials.tsx                ← Testimonial cards grid
  registry.ts                       ← Maps type names → React components
  ui/                               ← shadcn/ui primitives (Button, Badge, etc.)

lib/
  schema.ts                         ← PageNode, PageDocument, PatchAction types + starter data
  patchEngine.ts                    ← Applies patch actions to the JSON tree
  diffEngine.ts                     ← Creates history entries, computes diffs, restores snapshots
  lockEngine.ts                     ← Filters actions targeting locked nodes
  constraintValidator.ts            ← Filters actions based on text/style/layout constraints
  openaiClient.ts                   ← OpenAI client wrapper (JSON mode)
  utils.ts                          ← Tailwind cn() utility

state/
  editorStore.ts                    ← Zustand store (page, selection, locks, history, constraints)
```

## Prerequisites

- **Node.js** 18.17 or later
- **npm** (comes with Node.js)
- An **OpenAI API key** (for AI editing features)

## Clone and Run

1. **Clone the repository**

```bash
git clone https://github.com/MohdSajidJafri/WorkStuff.git
cd WorkStuff
```

2. **Install dependencies**

```bash
npm install
```

3. **Create the environment file**

Create a file named `.env.local` in the project root and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

4. **Start the development server**

```bash
npm run dev
```

5. **Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000). The editor loads with a starter page containing a hero section, pricing grid, and testimonials. Click any section to select it, then use the prompt bar at the bottom to make AI-powered edits.

## Production Build

```bash
npm run build
npm start
```

This creates an optimized production build and serves it on port 3000.
