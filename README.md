# Ultimate Image Tools

A bulk watermark/border applier, creator toolkit, and AI background remover built with **Bun + TypeScript + Sharp**.

## Requirements

- [Bun](https://bun.sh/) v1.0+

## Setup

```bash
bun install
```

## CLI Usage

```bash
# Default: output goes to <source>/output (flat, no folder nesting)
bun run apply -- -i <images_folder> -w <watermark.png>

# Multiple watermarks (each gets its own output subfolder)
bun run apply -- -i <images_folder> -w <wm1.png> -w <wm2.png>

# Custom output: preserves source folder names as subfolders
bun run apply -- -i <folder1> -i <folder2> -w <wm.png> -o <output_path>
```

### Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--images` | `-i` | Source image folder(s), repeatable | *(required)* |
| `--watermark` | `-w` | Watermark PNG file(s), repeatable | *(required)* |
| `--output` | `-o` | Output folder (enables folder preservation) | `<source>/output` |

### Output Structure

```
# Default (no -o flag) → flat output next to source
brewog/output/
├── hafiliamall/
│   ├── 1.png
│   └── biru.png
└── border2/
    └── ...

# Custom -o → preserves source folder names
my-output/
├── hafiliamall/
│   └── brewog/
│       └── 1.png
└── border2/
    └── brewog/
        └── 1.png
```

### Supported Formats

Input: `.png`, `.jpg`, `.jpeg`, `.webp`
Output: `.png` (all converted to preserve watermark transparency)

## GUI Mode

```bash
bun run dev
```

Opens at **http://localhost:19683** (port = 3⁹).

### Applier Tab

- **Drag & drop** images and watermark PNGs
- **Add Folder** button — uploads entire folders with structure tracking
- **Live preview** — click any image + watermark to see the result
- **Process & Download** — bulk process all images, downloads `watermarked.zip`
- ZIP preserves folder structure: `<watermark>/<source_folder>/<image.png>`

### Creator Tab

Create custom watermark templates directly in the browser:

- **40 border styles**: Simple, Double, Angular, Corners, Layered, Bracket, Rounded, Inset, Wavy, Scalloped, Zigzag, Dotted, Filmstrip, Ticket, Chain, Cross Stitch, Arrow, Rope, Network, Geo Blocks, Bubbles, Mosaic, Floral, Pixel Art, Confetti, Woven, Circuit, Star Burst, Hearts, Leaves, Lightning, Waves 3D, Triangles, Spiral, DNA, Barcode, Gradient Fade, Honeycomb, Splatter, Ribbon
- **3 fill modes**: Solid color, Gradient (diagonal), Diagonal stripes
- **3 color controls**: Color 1, Color 2, Accent + 50 color palettes
- **Adjustable thickness**: 4–50px slider
- **12 badge presets**: Gratis Ongkir, Bayar Ditempat, Bisa COD, Special Discount, Harga Murah, Best Seller, Premium Quality, Promo, Ready Stock, Original 100%, Bonus Gift, Flash Sale
- **Custom badges**: Add blank badges with custom emoji, text, color, and position
- **Store name banner**: Optional branded text on the border
- **QR code**: Generate and place QR codes on the watermark
- **Diagonal text watermark**: Repeating text overlay with opacity, size, angle controls
- **Canvas presets**: 1:1, 3:4, 4:3, and custom dimensions
- **Templates**: Save/load/export/import template configurations
- **Undo/Redo**: Ctrl+Z / Ctrl+Y support
- **Export**: PNG, JPEG, or WebP with quality control

### BG Remover Tab

AI-powered background removal with manual editing tools:

- **AI Background Removal**: Uses `@imgly/background-removal` (loaded from esm.sh CDN)
- **Pre-Mask Mode**: Manual object selection before AI processing
  - **Keep/Remove brush**: Paint to select areas to keep or remove
  - **Magic Wand**: Click to select similar colors (flood-fill)
  - **Edge-Aware Quick Select**: Smart brush with Sobel edge detection — snaps to object boundaries
  - **Keep/Remove toggle**: Both Wand and Quick Select support adding to or erasing from selection
- **Post-Mask Editing**: Refine AI results with restore/erase brushes
- **Compose Mode**: Move, resize, and place cutout on custom backgrounds (transparent, white, black, custom color)
- **Batch Processing**: Upload multiple images, process all at once
- **Before/After Compare**: Slider comparison of original vs result
- **Keyboard Shortcuts**: `[ ]` brush size, `{ }` tolerance, `Ctrl+Z` undo

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (server/CLI), JavaScript (frontend)
- **Image Processing**: Sharp (libvips)
- **ZIP**: JSZip
- **GUI**: Vanilla HTML/CSS/JS + Bun HTTP server
- **Creator Architecture**: 10 modular files in `public/creator/` using `window.Creator` namespace
- **Remover Architecture**: 10 modular files in `public/remover/` using bare `var` globals with lazy DOM init
- **AI Model**: `@imgly/background-removal` via esm.sh CDN (~40MB, browser-cached)

