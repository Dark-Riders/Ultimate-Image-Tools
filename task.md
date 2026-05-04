# Annotater Tab — Task List

## 1. State (`annotater-state.js`)
- [ ] Create `public/annotater/` directory
- [ ] Create `annotater-state.js` with `ant`-prefixed globals
- [ ] Implement `initAnnotaterDOM()` lazy init

## 2. Render (`annotater-render.js`)
- [ ] Checkerboard background pattern for transparent mode
- [ ] Solid background fill (white/black/custom)
- [ ] Draw product image at position + scale
- [ ] Draw all text items with font, size, color, bold/italic
- [ ] Draw selection handles (blue border + corner dots)
- [ ] Draw snap alignment guides

## 3. Interaction (`annotater-interact.js`)
- [ ] Hit detection (texts reverse z-order → image → null)
- [ ] Mouse drag: mousedown/mousemove/mouseup
- [ ] Touch drag: touchstart/touchmove/touchend
- [ ] Snap guides (center + edge, 8px threshold)
- [ ] Keyboard: `Delete` remove selected, `Ctrl+Z` undo

## 4. Controls (`annotater-controls.js`)
- [ ] Image upload (browse + drag & drop)
- [ ] Image scale slider (10–500%)
- [ ] Clear image button
- [ ] "+ Add Text" button
- [ ] Per-text controls: text input, font dropdown, size slider, color picker, bold/italic, delete
- [ ] Bidirectional selection (list ↔ canvas)
- [ ] Background dropdown (Transparent/White/Black/Custom) + color picker
- [ ] "Download PNG" export button
- [ ] Bootstrap: `DOMContentLoaded` → `initAnnotaterDOM()` → `initAnnotaterListeners()`

## 5. HTML (`index.html`)
- [ ] Add "Annotater" tab button in header
- [ ] Add `#tab-annotater` section with left panel + right canvas panel
- [ ] Add `<script>` tags for all 4 annotater files

## 6. Styles (`style.css`)
- [ ] Canvas container layout (match Creator's preview panel)
- [ ] Checkerboard CSS pattern
- [ ] Text list item styles
- [ ] Font picker dropdown
- [ ] Selection handle styles

## 7. BG Remover Integration
- [ ] Add "Send to Annotater" button in remover action bar
- [ ] Implement `antLoadImage()` global function
- [ ] Programmatic tab switch on send

## 8. Finalize
- [ ] Sync `docs/` with relative paths
- [ ] Verify all 4 tabs work (Applier, Creator, BG Remover, Annotater)
- [ ] Check no global scope collisions (`ant` prefix)
- [ ] Commit
