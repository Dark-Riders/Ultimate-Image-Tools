# Annotater Tab — Text & Object Editor for Product Images

Add a 4th tab ("Annotater") that receives cleaned images from BG Remover or accepts direct uploads. Provides a canvas-based text + object editor for annotating product images with product names, prices, descriptions, etc.

## Decisions (Confirmed)

- **Tab name**: Annotater
- **Image source**: Both BG Remover ("Send to Annotater" button) and direct upload
- **Export**: PNG only — transparent background preserved
- **Text presets**: None — universal use
- **Multi-image**: One image per canvas (different products get different font sizes/positions)
- **Background**: Transparent by default (checkerboard preview), with option for white/black/custom color

## Proposed Changes

### Overview

```
Annotater Tab Architecture
├── public/annotater/
│   ├── annotater-state.js    — state, DOM refs, lazy init
│   ├── annotater-render.js   — canvas rendering (image + text objects)
│   ├── annotater-interact.js — drag/drop, hit detection, snap guides, keyboard
│   └── annotater-controls.js — DOM listeners, font picker, export, bootstrap
├── public/index.html         — new tab button + Annotater tab HTML
├── public/style.css          — Annotater-specific styles
└── public/remover/remover-download.js — "Send to Annotater" button
```

---

### Component 1: Annotater State (`annotater-state.js`)

#### [NEW] [annotater-state.js](file:///e:/Projects/simple-watermark-creator-applier/public/annotater/annotater-state.js)

Global state using `var` with `ant` prefix (avoiding collisions):

```js
var antCanvas, antCtx;           // Main canvas
var antImage = null;              // { el, x, y, w, h, baseW, baseH, scale }
var antTexts = [];                // [{ text, x, y, fontSize, fontFamily, color, bold, italic }]
var antSelectedIndex = -1;        // Currently selected text index
var antSelectedType = null;       // 'image' | 'text' | null
var antDragTarget = null;         // Active drag reference
var antSnapGuides = [];           // Snap alignment guides
var antHistory = [];              // Undo stack
var antCanvasW = 1000, antCanvasH = 1000;
var antBgType = 'transparent';    // 'transparent' | 'white' | 'black' | 'color'
var antBgColor = '#ffffff';
```

Lazy DOM init via `initAnnotaterDOM()` (same pattern as remover).

---

### Component 2: Annotater Render (`annotater-render.js`)

#### [NEW] [annotater-render.js](file:///e:/Projects/simple-watermark-creator-applier/public/annotater/annotater-render.js)

Rendering pipeline:
1. Clear canvas
2. Draw background: checkerboard pattern for transparent, solid fill for color options
3. Draw the product image at its position + scale
4. Draw all text items at their positions with font, size, color, bold/italic
5. Draw selection handles (blue border + corner dots) around the selected element
6. Draw snap alignment guides

---

### Component 3: Annotater Interaction (`annotater-interact.js`)

#### [NEW] [annotater-interact.js](file:///e:/Projects/simple-watermark-creator-applier/public/annotater/annotater-interact.js)

Reuses Creator's interaction pattern:
- **Hit detection**: Check text items (reverse z-order) → image → null
- **Drag**: mousedown → set drag target + offset, mousemove → update position, mouseup → release
- **Snap guides**: Center + edge snapping (8px threshold, matching Creator)
- **Keyboard**: `Delete` to remove selected text, `Ctrl+Z` undo
- **Touch events**: Same pattern for mobile

Each text and the image can be **freely moved** by dragging on canvas.

---

### Component 4: Annotater Controls (`annotater-controls.js`)

#### [NEW] [annotater-controls.js](file:///e:/Projects/simple-watermark-creator-applier/public/annotater/annotater-controls.js)

Left panel controls:

**Image section:**
- Upload button (drag & drop zone or browse)
- Current image name display
- Image scale slider (10–500%)
- "Clear Image" button

**Text section:**
- "+ Add Text" button → creates new text at canvas center
- Per-text controls (rendered dynamically as a list):
  - Text input field
  - Font family dropdown (reuses Creator's Google Fonts — Inter, Roboto, Poppins, Bebas Neue, etc.)
  - Font size slider (12–200px)
  - Color picker
  - Bold / Italic toggle buttons
  - Delete button (✕)
- Clicking a text in the list selects it on canvas (and vice versa — bidirectional)

**Background section:**
- Dropdown: Transparent / White / Black / Custom
- Color picker (shown when Custom selected)

**Export section:**
- "Download PNG" button

Bootstrap: `DOMContentLoaded` → `initAnnotaterDOM()` → `initAnnotaterListeners()`

---

### Component 5: HTML Changes

#### [MODIFY] [index.html](file:///e:/Projects/simple-watermark-creator-applier/public/index.html)

1. **Add tab button** (line ~34, after BG Remover):
   ```html
   <button class="tab-btn" data-tab="annotater">Annotater</button>
   ```

2. **Add Annotater tab content** (after BG Remover section, ~line 930):
   - Left panel: Image upload, text list, background picker, export button
   - Right panel: Canvas with checkerboard background preview

3. **Add script tags** (before tab-switching script):
   ```html
   <script src="/annotater/annotater-state.js"></script>
   <script src="/annotater/annotater-render.js"></script>
   <script src="/annotater/annotater-interact.js"></script>
   <script src="/annotater/annotater-controls.js"></script>
   ```

---

### Component 6: BG Remover Integration

#### [MODIFY] [remover-download.js](file:///e:/Projects/simple-watermark-creator-applier/public/remover/remover-download.js)

Add a "Send to Annotater" button next to the download button in the results/action bar. On click:
1. Takes the `resultBlob` from the selected image
2. Creates an `Image` element from the blob URL
3. Calls `antLoadImage(imageEl, imageName)` (global function exposed by annotater-controls.js)
4. Switches to the Annotater tab programmatically (clicks the tab button)

---

### Component 7: Styles

#### [MODIFY] [style.css](file:///e:/Projects/simple-watermark-creator-applier/public/style.css)

- Canvas container (same flex layout as Creator's preview panel)
- Checkerboard background pattern (CSS `background-image` with repeating gradient)
- Text list items (similar to Creator's badge/image list)
- Font picker dropdown styling
- Selection handle styling (blue border + corner dots on selected element)

---

## Verification Plan

### Automated Tests
1. Start dev server → navigate to Annotater tab → verify canvas renders with checkerboard
2. Upload image directly → verify it appears, can be dragged, can be resized via slider
3. Add text → verify it renders at center, can be dragged, font/size/color controls work
4. Add multiple texts → verify each has independent controls, selection highlights correctly
5. Change background to white → verify PNG export has white background
6. Download PNG with transparent background → verify transparency preserved
7. From BG Remover: process an image → click "Send to Annotater" → verify it loads in Annotater tab

### Manual Verification
- User tests drag-and-drop feel for both text and image
- User verifies font rendering quality at various sizes
- User verifies snap guides work properly
- User verifies export quality and transparency
