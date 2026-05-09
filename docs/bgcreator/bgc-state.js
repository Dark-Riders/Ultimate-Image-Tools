// ===== BG Creator — State & DOM Refs =====
// All shared state declared with var so other scripts can access them.

console.log('[BG Creator] State loading...');

// ===== Palettes =====
var bgcPalettes = [
    // Neutrals
    { name: 'Pure White',      base: '#ffffff', second: '#f5f5f5', third: '#ebebeb' },
    { name: 'Warm Ivory',      base: '#f5f0eb', second: '#e8e0d5', third: '#ddd5c8' },
    { name: 'Cool Mist',       base: '#eef0f2', second: '#dde1e5', third: '#ccd2d8' },
    { name: 'Warm Sand',       base: '#f2ede6', second: '#e5ddd3', third: '#d8cdc0' },
    { name: 'Soft Gray',       base: '#f0f0f0', second: '#e3e3e3', third: '#d6d6d6' },
    // Warm Tones
    { name: 'Soft Blush',      base: '#f7eeeb', second: '#edddd8', third: '#e3ccc4' },
    { name: 'Peach Glow',      base: '#faf0e6', second: '#f0dcc8', third: '#e6c8aa' },
    { name: 'Terracotta Mist', base: '#f2e8e0', second: '#e5d0c0', third: '#d8b8a0' },
    { name: 'Honey Cream',     base: '#f7f0e0', second: '#efe3c8', third: '#e7d6b0' },
    { name: 'Coral Light',     base: '#faeae6', second: '#f0d0c8', third: '#e6b6aa' },
    // Cool Tones
    { name: 'Ice Blue',        base: '#edf2f7', second: '#dae3ee', third: '#c7d4e5' },
    { name: 'Sage Linen',      base: '#edf0ec', second: '#dde3db', third: '#cdd6c9' },
    { name: 'Mint Fresh',      base: '#ecf5f0', second: '#d8eae0', third: '#c4dfd0' },
    { name: 'Slate Minimal',   base: '#f0f0f2', second: '#e2e2e6', third: '#d4d4da' },
    { name: 'Steel Blue',      base: '#ebeef2', second: '#d6dce5', third: '#c1cad8' },
    // Earth Tones
    { name: 'Clay Earth',      base: '#f0e8e0', second: '#dfd0c0', third: '#ceb8a0' },
    { name: 'Olive Mist',      base: '#eef0e6', second: '#dde0cc', third: '#ccd0b3' },
    { name: 'Mushroom',        base: '#eeebe8', second: '#ddd7d0', third: '#ccc3b8' },
    { name: 'Driftwood',       base: '#f0ebe5', second: '#e0d5c8', third: '#d0bfab' },
    { name: 'Cocoa Dust',      base: '#ece6e0', second: '#d8ccc0', third: '#c4b2a0' },
    // Fashion / Bold
    { name: 'Lilac Dream',     base: '#f0edf5', second: '#e0daea', third: '#d0c7df' },
    { name: 'Dusty Rose',      base: '#f2eaed', second: '#e5d4da', third: '#d8bec7' },
    { name: 'Powder Blue',     base: '#e8eff5', second: '#d0dfeb', third: '#b8cfe1' },
    { name: 'Champagne',       base: '#f5f0e8', second: '#ebe0d0', third: '#e1d0b8' },
    { name: 'Graphite',        base: '#e8e8ea', second: '#d0d0d4', third: '#b8b8be' },
];

// ===== Core State =====
var bgcMode = 'solid_texture';   // 'solid_texture' | 'gradient_texture' | 'pattern'
var bgcBase = '#f5f0eb';
var bgcSecond = '#e8e0d5';
var bgcThird = '#ddd5c8';
var bgcActivePalette = 1;        // index into bgcPalettes

var bgcTexture = 'paper_grain';  // texture type
var bgcTextureOpacity = 15;      // 0-100
var bgcTextureScale = 100;       // 50-200

var bgcPattern = 'polka_dot';    // pattern shape
var bgcPatternSeed = Math.floor(Math.random() * 100000);

var bgcGradientAngle = 180;      // 0-360 degrees

var bgcOutputSize = 1000;        // 800 | 1000 | 1200
var bgcProductImage = null;      // { el, name, w, h } or null

// ===== Canvas =====
var bgcCanvas = null;
var bgcCtx = null;
var bgcCanvasContainer = null;
var bgcRenderTimer = null;       // debounce timer

// ===== DOM Refs =====
var bgcModeSelect = null;
var bgcPaletteGrid = null;
var bgcBaseInput = null, bgcSecondInput = null, bgcThirdInput = null;
var bgcBaseColor = null, bgcSecondColor = null, bgcThirdColor = null;
var bgcThirdGroup = null;
var bgcTextureSelect = null;
var bgcOpacitySlider = null, bgcOpacityVal = null;
var bgcScaleSlider = null, bgcScaleVal = null;
var bgcPatternSection = null, bgcPatternSelect = null, bgcRegenerateBtn = null;
var bgcGradientSection = null, bgcAnglePicker = null, bgcAngleVal = null;
var bgcSizeSelect = null;
var bgcDownloadBtn = null, bgcApplyBtn = null;
var bgcDropzone = null, bgcFileInput = null, bgcBrowseLink = null;
var bgcImageInfo = null, bgcClearImageBtn = null;

function initBgcDOM() {
    bgcCanvas = document.getElementById('bgc-canvas');
    bgcCtx = bgcCanvas ? bgcCanvas.getContext('2d') : null;
    bgcCanvasContainer = document.getElementById('bgc-canvas-container');

    bgcModeSelect = document.getElementById('bgc-mode');
    bgcPaletteGrid = document.getElementById('bgc-palette-grid');
    bgcBaseInput = document.getElementById('bgc-base-hex');
    bgcSecondInput = document.getElementById('bgc-second-hex');
    bgcThirdInput = document.getElementById('bgc-third-hex');
    bgcBaseColor = document.getElementById('bgc-base-color');
    bgcSecondColor = document.getElementById('bgc-second-color');
    bgcThirdColor = document.getElementById('bgc-third-color');
    bgcThirdGroup = document.getElementById('bgc-third-group');

    bgcTextureSelect = document.getElementById('bgc-texture');
    bgcOpacitySlider = document.getElementById('bgc-tex-opacity');
    bgcOpacityVal = document.getElementById('bgc-tex-opacity-val');
    bgcScaleSlider = document.getElementById('bgc-tex-scale');
    bgcScaleVal = document.getElementById('bgc-tex-scale-val');

    bgcPatternSection = document.getElementById('bgc-pattern-section');
    bgcPatternSelect = document.getElementById('bgc-pattern');
    bgcRegenerateBtn = document.getElementById('bgc-regenerate');

    bgcGradientSection = document.getElementById('bgc-gradient-section');
    bgcAnglePicker = document.getElementById('bgc-angle-picker');
    bgcAngleVal = document.getElementById('bgc-angle-val');

    bgcSizeSelect = document.getElementById('bgc-size');
    bgcDownloadBtn = document.getElementById('bgc-download');
    bgcApplyBtn = document.getElementById('bgc-apply');

    bgcDropzone = document.getElementById('bgc-dropzone');
    bgcFileInput = document.getElementById('bgc-file-input');
    bgcBrowseLink = document.getElementById('bgc-browse-link');
    bgcImageInfo = document.getElementById('bgc-image-info');
    bgcClearImageBtn = document.getElementById('bgc-clear-image');

    console.log('[BG Creator] DOM refs initialized.', bgcCanvas ? '✅' : '❌ canvas missing');
}
