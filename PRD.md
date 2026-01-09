# Project Requirements Document (PRD): EnHub Web

**Status**: Draft
**Version**: 1.0
**Role**: Single-Page Application (Client-Side Logic)

## 1. Project Overview
*   **App Name**: EnHub Web
*   **One-Liner**: A privacy-focused web tool that uses AI to extract English text from images, formats it into a styled HTML reader, and archives it directly to a personal GitHub repository.
*   **Target Audience**: Personal users needing a quick workflow to digitize and archive paper/image-based English articles.

## 2. App Flow & User Stories
### Key User Flows
1.  **Configuration (First Run)**:
    *   User enters **OpenRouter API Key**.
    *   User enters **GitHub Personal Access Token**.
    *   User enters **GitHub Repository Name** (e.g., `username/repo`).
    *   *System saves these to Browser LocalStorage.*
2.  **Image Processing**:
    *   User uploads multiple images (Drag & Drop).
    *   System sends images to OpenRouter (Vision Model) with a strict System Prompt.
    *   AI returns a complete, styled HTML string.
3.  **Preview & Edit**:
    *   Screen shows a Split View: **Code Editor** (Left) vs. **Live Preview** (Right).
    *   User corrects typos or tweaks CSS in the Code Editor.
    *   Preview updates in real-time.
4.  **Archiving**:
    *   User inputs **Year** (e.g., "2012") and **Article ID** (e.g., "text1").
    *   User clicks "Upload to GitHub".
    *   System commits the file to `en2/{Year}/{ArticleID}.html`.
    *   Success message displayed with a link to the GitHub file.

### Edge Cases
*   **API Failures**: Handle OpenRouter timeouts or 429 errors gracefully.
*   **Token Expiry**: Prompt user if GitHub token is invalid.
*   **Duplicate Files**: Warn user if `text1.html` already exists in that folder (optional check via GitHub API).

## 3. Tech Stack & Constants
*   **Framework**: Next.js 14 (App Router) + TypeScript
*   **Styling**: Tailwind CSS
*   **UI Library**: Shadcn/UI (Radix Primitives) + Lucide React (Icons)
*   **State Management**: Zustand (for global settings & image list)
*   **AI Integration**: `openai` SDK (configured for OpenRouter base URL)
*   **GitHub Integration**: `octokit` (rest.js)
*   **Editor**: `@monaco-editor/react` (for syntax highlighting in edit mode)

### Environment Variables / Constants
(Since this is client-side, keys are input by user, but we need defaults)
*   `NEXT_PUBLIC_APP_URL`: Localhost or deployment URL.
*   **AI Model**: `google/gemini-2.0-flash-exp:free` or `gpt-4o` (User selectable or hardcoded default).

## 4. Design System & UI/UX
*   **Color Palette**:
    *   Primary: Slate-900 (Dark technical feel)
    *   Accent: Emerald-600 (Success/Go)
    *   Background: White / Slate-50
*   **Typography**: Inter (Sans) for UI; Merriweather (Serif) for the Article Preview.
*   **Layout**:
    *   **Header**: Logo + Settings (Gear Icon).
    *   **Main**: Three-stage stepper (Upload -> Edit -> Save).

## 5. Data Model (LocalStorage)
We do not have a backend DB. We use `localStorage` key: `enhub-config`.

```typescript
interface AppConfig {
  openRouterKey: string;
  githubToken: string;
  repoOwner: string;
  repoName: string;
  defaultModel: string;
}

interface ArticleMetadata {
  year: string;     // e.g., "2012"
  fileId: string;   // e.g., "text1"
}
```

## 6. API Interface (Client-Side Services)
Since this is a Client-Side App, "Routes" are actually Service Functions.

*   `services/ai.ts`:
    *   `generateHtmlFromImages(images: string[], prompt: string, apiKey: string)`
*   `services/github.ts`:
    *   `uploadFileToRepo(content: string, path: string, token: string, repo: string)`

## 7. Project File Structure
```
src/
├── app/
│   ├── layout.tsx       # Providers (Toaster, etc.)
│   ├── page.tsx         # Main single-page app wrapper
│   └── globals.css
├── components/
│   ├── ui/              # Shadcn Components (Button, Input, Card...)
│   ├── config-dialog.tsx # Settings Modal
│   ├── image-uploader.tsx
│   ├── editor-preview.tsx # Split pane: Monaco + Iframe/Div
│   └── upload-form.tsx   # Year/ID inputs + Commit button
├── lib/
│   ├── store.ts         # Zustand store (Config + App State)
│   ├── ai-service.ts    # OpenRouter calls
│   ├── github-service.ts # Octokit calls
│   └── prompts.ts       # The specific system prompt defined by user
└── types/
    └── index.ts
```

## 8. AI Context & Coding Standards
**COPY THIS SECTION INTO TRAE CONTEXT:**

```text
Project Rules & Context:
1. Tech Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Zustand.
2. UI Components: ALWAYS import from `@/components/ui`. If a component is missing, assume it needs to be installed via `npx shadcn@latest add [name]`.
3. Client-Side Only: Do NOT use Server Actions or API Routes for the core logic. All API calls (OpenRouter, GitHub) must happen in the browser using the user's provided keys.
4. Icons: Use `lucide-react`.
5. Error Handling: Use `sonner` or `toast` for user feedback. Never fail silently.
6. The AI Prompt Logic:
   - When calling AI, use the exact prompt instructions provided by the user: "Keep English content as is", "Green background", "Large font", "Browser margins".
   - Join multiple images into a sequential narrative.
```

## 9. Atomic Implementation Roadmap

### Phase 1: Foundation & UI Shell
*   **Step 1: Scaffolding**: Initialize Next.js 14 project, setup Tailwind, install `shadcn-ui`, `lucide-react`, `zustand`, `clsx`, `tailwind-merge`.
*   **Step 2: Component Library**: Install essential Shadcn components (`button`, `input`, `label`, `card`, `dialog`, `toast`, `textarea`, `resizable` or `separator`).
*   **Step 3: State Management**: Create `useAppStore` in `lib/store.ts` to manage settings (keys) and wizard steps (currentStep).
*   **Step 4: Settings Dialog**: Create a modal that forces user to input API keys if they are missing from LocalStorage.

### Phase 2: Core Features (Upload & AI)
*   **Step 5: Image Uploader**: Create a drag-and-drop zone that reads files as base64 strings and stores them in state.
*   **Step 6: AI Service**: Implement `lib/ai-service.ts`. Use the user's specific prompt requirements. Connect to OpenRouter.
*   **Step 7: The "Prompt"**: Create `lib/prompts.ts` exporting the exact system message string requested by the user.

### Phase 3: Editor & Preview
*   **Step 8: Editor Layout**: Create a split-screen view. Left: Monaco Editor (or Textarea) for raw HTML. Right: Live rendered HTML preview.
*   **Step 9: Integration**: Connect the AI output to this editor.

### Phase 4: GitHub Integration
*   **Step 10: GitHub Service**: Implement `lib/github-service.ts` using `octokit`. Needs `createOrUpdateFileContents` functionality.
*   **Step 11: Final Form**: Create the inputs for "Year" and "Article ID" and the "Upload" button.

### Phase 5: Polish
*   **Step 12: Main Page Assembly**: Stitch all components into `app/page.tsx` with a clean step-by-step UI.
*   **Step 13: Testing**: Verify the full flow from Image -> AI -> Edit -> GitHub.
