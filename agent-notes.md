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
- `public/index.html` — main HTML with **tab system** (Applier / Creator)
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
- `public/creator.js` — **legacy monolith** (kept as backup, not loaded)
- `public/remover.js` — BG Remover: ES module loading @imgly/background-removal from esm.sh CDN
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

## Gotchas
- Sharp's `composite()` requires the overlay to match the base image dimensions, so we resize the watermark first.
- Non-PNG inputs are converted to PNG on output to avoid JPEG artifacts destroying watermark transparency.
- Browser `webkitRelativePath` is used for folder structure tracking but doesn't expose the actual filesystem path.
- Canvas `fillText` with emojis may render differently across OS/browsers.

## Open Questions
- None currently.
