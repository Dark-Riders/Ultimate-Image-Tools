# Annotater Tab — Task List

## 1. State (`annotater-state.js`)
- [x] Create `public/annotater/` directory
- [x] Create `annotater-state.js` with `ant`-prefixed globals
- [x] Implement `initAnnotaterDOM()` lazy init

## 2. Render (`annotater-render.js`)
- [x] Checkerboard background pattern for transparent mode
- [x] Solid background fill (white/black/custom)
- [x] Draw product image at position + scale
- [x] Draw all text items with font, size, color, bold/italic
- [x] Draw selection handles (blue border + corner dots)
- [x] Draw snap alignment guides

## 3. Interaction (`annotater-interact.js`)
- [x] Hit detection (texts reverse z-order → image → null)
- [x] Mouse drag: mousedown/mousemove/mouseup
- [x] Touch drag: touchstart/touchmove/touchend
- [x] Snap guides (center + edge, 8px threshold)
- [x] Keyboard: `Delete` remove selected, `Ctrl+Z` undo

## 4. Controls (`annotater-controls.js`)
- [x] Image upload (browse + drag & drop)
- [x] Image scale slider (10–500%)
- [x] Clear image button
- [x] "+ Add Text" button
- [x] Per-text controls: text input, font dropdown, size slider, color picker, bold/italic, delete
- [x] Bidirectional selection (list ↔ canvas)
- [x] Background dropdown (Transparent/White/Black/Custom) + color picker
- [x] "Download PNG" export button
- [x] Bootstrap: `DOMContentLoaded` → `initAnnotaterDOM()` → `initAnnotaterListeners()`

## 5. HTML (`index.html`)
- [/] Add "Annotater" tab button in header
- [/] Add `#tab-annotater` section with left panel + right canvas panel
- [/] Add `<script>` tags for all 4 annotater files

## 6. Styles (`style.css`)
- [/] Canvas container layout (match Creator's preview panel)
- [/] Checkerboard CSS pattern
- [/] Text list item styles
- [/] Font picker dropdown
- [/] Selection handle styles

## 7. BG Remover Integration
- [ ] Add "Send to Annotater" button in remover action bar
- [ ] Implement `antLoadImage()` global function
- [ ] Programmatic tab switch on send

## 8. Finalize
- [ ] Sync `docs/` with relative paths
- [ ] Verify all 4 tabs work (Applier, Creator, BG Remover, Annotater)
- [ ] Check no global scope collisions (`ant` prefix)
- [ ] Commit
