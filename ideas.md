# 💡 Ideas & Considerations

Things I'm considering but haven't committed to implementing yet.

---

## Creator Enhancements
- [x] **Save/Load Templates** — Save full setup (border, badges, colors, images, positions) as named templates. Quick-load for consistent branding across products.
- [x] **Opacity Control per Custom Image** — Slider to adjust transparency of each uploaded image (useful for logo overlays that shouldn't block the product).
- [x] Undo/redo for creator edits (`Ctrl+Z` / `Ctrl+Y`)
- [—] **Image Layer Order** — *(skipped — not needed, no overlapping elements)* Drag to reorder which images/badges render on top of others (z-index control).
- [x] **Badge Shape Options** — Pill, circle, ribbon/banner, hexagon shapes instead of just rounded rectangles.
- [x] **Snap to Grid / Alignment Guides** — When dragging elements, show alignment guides (center, edges) for precise positioning.
- [x] **QR Code Badge** — Generate a QR code linking to your shop URL and place it on the watermark.
- [x] **Diagonal Text Watermark** — Add custom transparent text across the image at an angle (e.g. "ORIGINAL", shop name), semi-transparent so it doesn't obstruct the product.
- [ ] **Canvas Size Presets** — 1:1 (1000×1000), 3:4 (750×1000), 4:3 (1000×750) + custom size by pixel, scaling based on ratio.
- [ ] **Duplicate Badge** — Click to clone an existing badge with all its settings.
- [ ] **Lock Aspect Ratio on Image Resize** — Hold Shift while dragging custom images to maintain aspect ratio.
- [ ] **Text Along Path** — Curved/arched text for the store name (e.g., text curving along the top edge).
- [ ] **Store Name Background** — Background color, shape (rounded rect, pill, none), and no-background option for the store name text.
- [ ] **Gradient Text Fill** — For diagonal text or store name, fill with a gradient instead of solid color.

## Applier Enhancements
- [x] Image resizing before watermark (e.g., resize all to 1000×1000 before applying)
- [—] Batch rename output files — *(skipped — easy to do externally)*
- [—] Watermark opacity slider — *(skipped — Creator already handles opacity)*
- [—] Watermark positioning (not just full overlay — allow corner placement, tiling) — *(skipped — Creator handles positioning)*
- [—] Progress bar for large batches in GUI — *(skipped — already has a basic progress bar)*
- [ ] **Preview Grid** — Show 2×2 or 3×3 grid preview of multiple processed images at once in the Applier.

## General
- [—] PWA support (offline-capable) — *(skipped — runs locally via bun)*
- [—] Keyboard shortcuts for common actions — *(skipped — key ones already done: Ctrl+Z/Y, Delete)*
- [x] File size optimization on export (compress PNGs)
- [—] Multi-language support (EN/ID) — *(skipped — personal tool)*
- [ ] **Dark Mode Toggle** — Toggle between neo-brutalism light theme and dark mode variant. Swap CSS variables.

---

*Add ideas freely. Move to `progress.log` once you start implementing.*
