// ===== Annotator — State & DOM Refs =====
// Global state for the Annotator tab. All vars use 'ant' prefix to avoid collisions.

// Canvas
var antCanvas = null;
var antCtx = null;
var antCanvasW = 1000;
var antCanvasH = 1000;

// Image state (current displayed image)
var antImage = null; // { el, name, x, y, w, h, baseW, baseH, scale }

// Batch image queue
var antImageQueue = [];        // [{ el, name, naturalW, naturalH, thumbUrl }]
var antCurrentImageIdx = -1;   // -1 = no image loaded
var antPerImageTexts = {};     // { [index]: [...textObjects] } — per-image overrides
var antEditMode = 'all';       // 'all' | 'single'

// Text objects (shared template)
var antTexts = []; // [{ text, x, y, fontSize, fontFamily, color, bold, italic }]

// Selection & drag
var antSelectedIndex = -1;
var antSelectedType = null; // 'image' | 'text' | null
var antDragTarget = null;
var antDragOffsetX = 0;
var antDragOffsetY = 0;
var antSnapGuides = [];
var antSNAP_THRESHOLD = 8;

// Background
var antBgType = 'transparent'; // 'transparent' | 'white' | 'black' | 'color'
var antBgColor = '#ffffff';

// Undo
var antHistory = [];

// Font list (shared with Creator via Google Fonts link in <head>)
var antFontList = [
    'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Oswald',
    'Bebas Neue', 'Anton', 'Permanent Marker', 'Bangers', 'Righteous',
    'Fredoka One', 'Luckiest Guy', 'Passion One', 'Russo One', 'Black Ops One',
    'Bungee', 'Lilita One', 'Fugaz One', 'Pacifico', 'Lobster',
    'Satisfy', 'Dancing Script', 'Caveat', 'Press Start 2P', 'Silkscreen',
    'Space Mono', 'Archivo Black',
];

// ===== DOM Refs (assigned by initAnnotatorDOM) =====
var antUploadInput = null;
var antDropzone = null;
var antBrowseLink = null;
var antImageInfo = null;
var antImageScaleSlider = null;
var antImageScaleVal = null;
var antClearImageBtn = null;
var antAddTextBtn = null;
var antTextList = null;
var antBgSelect = null;
var antBgColorPicker = null;
var antExportBtn = null;
var antCanvasContainer = null;
var antTplName = null;
var antTplList = null;
var antTplSaveBtn = null;
var antTplLoadBtn = null;
var antTplDeleteBtn = null;
var antTplExportBtn = null;
var antTplImportInput = null;
var antBatchNavBar = null;
var antBatchPrev = null;
var antBatchNext = null;
var antBatchCounter = null;
var antQueueList = null;
var antExportAllBtn = null;

function initAnnotatorDOM() {
    antCanvas = document.getElementById('annotator-canvas');
    if (!antCanvas) { console.warn('[Annotator] Canvas not found'); return; }
    antCtx = antCanvas.getContext('2d');
    antCanvas.width = antCanvasW;
    antCanvas.height = antCanvasH;

    antUploadInput = document.getElementById('ant-file-input');
    antDropzone = document.getElementById('ant-dropzone');
    antBrowseLink = document.getElementById('ant-browse-link');
    antImageInfo = document.getElementById('ant-image-info');
    antImageScaleSlider = document.getElementById('ant-image-scale');
    antImageScaleVal = document.getElementById('ant-image-scale-val');
    antClearImageBtn = document.getElementById('ant-clear-image');
    antAddTextBtn = document.getElementById('ant-add-text');
    antTextList = document.getElementById('ant-text-list');
    antBgSelect = document.getElementById('ant-bg-type');
    antBgColorPicker = document.getElementById('ant-bg-color');
    antExportBtn = document.getElementById('ant-export');
    antCanvasContainer = document.getElementById('ant-canvas-container');
    antTplName = document.getElementById('ant-tpl-name');
    antTplList = document.getElementById('ant-tpl-list');
    antTplSaveBtn = document.getElementById('ant-tpl-save');
    antTplLoadBtn = document.getElementById('ant-tpl-load');
    antTplDeleteBtn = document.getElementById('ant-tpl-delete');
    antTplExportBtn = document.getElementById('ant-tpl-export');
    antTplImportInput = document.getElementById('ant-tpl-import');
    antBatchNavBar = document.getElementById('ant-batch-nav');
    antBatchPrev = document.getElementById('ant-batch-prev');
    antBatchNext = document.getElementById('ant-batch-next');
    antBatchCounter = document.getElementById('ant-batch-counter');
    antQueueList = document.getElementById('ant-queue-list');
    antExportAllBtn = document.getElementById('ant-export-all');

    console.log('[Annotator] DOM refs initialized. ✅');
}

function antPushHistory() {
    // Save current text state for undo
    var snapshot = {
        texts: antTexts.map(t => ({ ...t })),
        image: antImage ? { ...antImage, el: antImage.el } : null,
    };
    antHistory.push(snapshot);
    if (antHistory.length > 30) antHistory.shift();
}

function antUndo() {
    if (antHistory.length <= 0) return;
    var snap = antHistory.pop();
    antTexts = snap.texts;
    antImage = snap.image;
    antSelectedIndex = -1;
    antSelectedType = null;
    antRenderTextList();
    antRender();
}
