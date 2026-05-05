# Agent Notes

## Project Context
- Bulk watermark/border applier + creator toolkit using Bun + TypeScript + Sharp
- Designed for e-commerce product images — overlays decorative borders with badges (COD, discount, etc.)
- User sells on Shopee/TikTok (consistent with their other projects)

## Architecture

### CLI (`src/apply-watermark.ts`)
- Uses `parseArgs` for argument parsing, supports repeatable `-i` and `-w` flags
- **Smart output**: default = `<source>/output` (flat); custom `-o` = preserves folder structure
- Processes images sequentially per watermark × per image

### Server (`src/server.ts`)
- Bun HTTP server on port **19683** (3⁹ — user's deliberate choice)
- Static file serving from `public/`
- `/api/preview` — composites single image + watermark, returns PNG
- `/api/process` — bulk processes all images × watermarks, returns ZIP (using JSZip)
- Originally used `archiver` for ZIP, replaced with `jszip` for Bun stream compatibility

### Frontend
- `public/index.html` — main HTML with **4-tab system** (Applier / Creator / BG Remover / Annotator)
- `public/app.js` — applier logic: file uploads, drag & drop, folder uploads, preview, ZIP download
- `public/creator/` — watermark creator split into 10 modules via `window.Creator` namespace:
  - `creator-state.js` — global namespace, state object, undo/redo
  - `creator-data.js` — font list, 50 color palettes
  - `creator-utils.js` — roundRect, lightenColor, font builders, helpers
  - `creator-styles.js` — visual style effects, border fill, applyBorderEffects
  - `creator-borders-basic.js` — 12 basic borders (simple, double, wavy, etc.)
  - `creator-borders-decorative.js` — 11 decorative borders (filmstrip, chain, etc.)
  - `creator-borders-artistic.js` — 17 artistic borders (pixelArt, circuit, etc.)
  - `creator-render.js` — main render, badges, store name, QR, diagonal text
  - `creator-interaction.js` — canvas drag/drop, hit detection, keyboard, image upload
  - `creator-controls.js` — DOM refs, event listeners, templates, export
- `public/remover/` — BG Remover split into 10 modules using bare `var` globals (NOT namespaced like Creator):
  - `remover-state.js` — state vars, DOM ref declarations, `initRemoverDOM()` lazy init
  - `remover-utils.js` — showUI, selectRemoverImage, canvasCoords, updateBrushCursor
  - `remover-upload.js` — addFiles, renderImageList, compare slider helpers
  - `remover-process.js` — ensureModelLoaded, `processAllImages()` function (AI background removal)
  - `remover-premask.js` — pre-mask mode: brush paint, magic wand, edge-aware quick select (Sobel), keep/remove action. Accepts optional `aiResultUrl` to pre-fill mask from AI alpha channel.
  - `remover-mask.js` — post-AI mask editor (restore/erase brush)
  - `remover-compose.js` — compose mode: move/resize cutout on background
  - `remover-canvas.js` — placeholder (events consolidated into download.js)
  - `remover-toolbar.js` — setPreMaskTool, setPreMaskAction, preMaskAction state
  - `remover-download.js` — download, event listeners, keyboard shortcuts, bootstrap (DOMContentLoaded init)
- `public/annotator/` — Annotator tab split into 4 modules using bare `var` globals with `ant` prefix:
  - `annotator-state.js` — state vars, DOM refs, `initAnnotatorDOM()` lazy init, undo
  - `annotator-render.js` — canvas rendering: checkerboard bg, image, text objects, selection handles, snap guides
  - `annotator-interact.js` — drag/drop, hit detection, snap guides, keyboard, touch events
  - `annotator-controls.js` — image upload, text list CRUD, font picker, background selector, PNG export, bootstrap
- `public/remover.js` — **DELETED** (was the original 966-line monolith)
- `docs/` — mirror of `public/` with relative paths (`./`) for GitHub Pages deployment
- `public/style.css` — premium dark-mode theme, all component styles

## Key Decisions
- **Bun + Sharp over Python + Pillow**: User prefers Bun. Sharp uses libvips (faster).
- **Output as PNG**: All output is PNG regardless of input format, to preserve watermark transparency/quality.
- **Watermark scaling**: Stretched (`fit: "fill"`) to match source image dimensions exactly. Assumes watermark templates are designed as square borders.
- **GUI outputs ZIP**: Browser security prevents writing to source folder paths, so GUI produces downloadable ZIP instead of disk writes.
- **JSZip over Archiver**: `archiver` uses Node streams incompatible with Bun. `jszip` is fully in-memory.
- **Creator uses Canvas API**: Pure client-side rendering, no server needed. Export as transparent PNG.
- **12 badge presets**: Shopping-related presets (Indonesian e-commerce focused) — saves user from looking up emojis.
- **Creator modular split**: Refactored from one 2871-line file into 10 files using `window.Creator` global namespace (no bundler). Load order matters — `creator-state.js` first, `creator-controls.js` last.
- **BG Remover**: Uses `@imgly/background-removal` loaded from esm.sh CDN as ES module. Requires COOP/COEP headers on server for `SharedArrayBuffer`. Model (~40MB) auto-cached by browser after first load.
- **Annotator**: Canvas-based text + image editor. One image per canvas. PNG export with transparent background. Uses `ant` prefix for globals (same `var` + lazy init pattern as remover).
- **AI → Refine flow**: After AI processing, "Refine" button opens Pre-Mask with AI's alpha channel pre-filled as initial mask, enabling use of all selection tools (wand, quick select + Sobel, brush) to refine AI results. Pre-Mask also works standalone for offline use.

## Gotchas
- Sharp's `composite()` requires the overlay to match the base image dimensions, so we resize the watermark first.
- Non-PNG inputs are converted to PNG on output to avoid JPEG artifacts destroying watermark transparency.
- Browser `webkitRelativePath` is used for folder structure tracking but doesn't expose the actual filesystem path.
- Canvas `fillText` with emojis may render differently across OS/browsers.
- **CRITICAL: `var` vs `const` global scope collision.** `app.js` uses `const` for variables like `previewContainer`. If a remover script later does `var previewContainer`, it causes a **silent SyntaxError** that kills the entire script — no error appears in the console. Always prefix remover globals (e.g. `rmPreviewContainer`, `selectRemoverImage`, `removerImages`).
- **CRITICAL: `window.images` is a non-configurable browser built-in** (`document.images` alias). Using `var images` at global scope silently crashes the script. We renamed to `removerImages`.
- **CSS `display: flex` overrides `hidden` attribute.** If a CSS rule sets `display: flex`, the HTML `hidden` attribute is ignored. Use `:not([hidden]) { display: flex; }` pattern instead.
- **GitHub Pages relative paths.** `docs/index.html` must use `./` relative paths (not absolute `/`) because GitHub Pages serves from a subdirectory (`/Ultimate-Image-Tools/`).
- **Remover lazy DOM init.** All remover DOM refs are initialized lazily via `initRemoverDOM()` called from `remover-download.js` on DOMContentLoaded, to ensure the DOM is fully parsed.
- **Top-level addEventListener crash.** Never attach event listeners at file top level in remover/annotator modules — DOM refs are null before `initRemoverDOM()`. Wrap all listeners in `initRemoverListeners()`.
- **Emoji rendering.** Some emojis (e.g. 🪄) render as squares on certain platforms. Use Unicode symbols (◇, ⬡) instead for toolbar buttons.
- **Sobel edge map.** `preMaskEdgeMap` is pre-computed once in `enterPreMask()` and used by `quickSelectAt()`. Must be cleaned up in `exitPreMask()`. The edge threshold scales inversely with tolerance.
- **Keyboard shortcuts.** `[` `]` brush size ±5, `{` `}` tolerance ±5, `Ctrl+Z` undo. Only active in mask/premask editor mode.
- **Global prefix convention.** Creator uses `window.Creator` namespace. Remover uses bare `var` with implicit `rm`/`remover` prefix. Annotator uses bare `var` with `ant` prefix. Never overlap.

## Open Questions
- None currently.
