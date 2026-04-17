// ===== Background Remover — State & DOM Refs =====
// All shared state is declared with var so other scripts can access them.
// DOM refs are initialized lazily via initRemoverDOM() called from remover-download.js.

console.log('[BG Remover] State v2 loading...');

// Library
var removeBackground;
var modelLoaded = false;
var processing = false;

// Core state — use 'removerImages' to avoid collision with window.images (browser built-in)
var removerImages = []; // { file, name, originalUrl, resultBlob, resultUrl, status }
var selectedIndex = -1;
var editorMode = 'preview'; // 'preview' | 'mask' | 'compose' | 'premask'

// Mask state
var maskMode = 'restore';
var maskBrushSize = 25;
var maskDrawing = false;
var maskHistory = [];
var maskOriginalData = null;
var maskResultData = null;

// Compose state
var composeObj = null;

// Pre-mask state
var preMaskOriginal = null;
var preMaskCanvas = null;
var preMaskCtx = null;
var preMaskMode = 'keep'; // 'keep' | 'remove' | 'wand' | 'quicksel'
var preMaskHistory = [];
var preMaskPixelData = null;
var preMaskTolerance = 32;

// ===== DOM Refs (assigned by initRemoverDOM) =====
var dropzone, fileInput, browseLink, imageList, countBadge;
var processBtn, progressWrap, progressFill, statusText;
var downloadSection, downloadAllBtn, emptyState;
var compareContainer, beforeImg, afterImg, compareSlider;
var resultsContainer, previewContainer;
var editorCanvas, editorCtx, brushCursor;
var maskToolbar, maskBtnRestore, maskBtnErase;
var maskBrushSlider, maskBrushVal;
var maskBtnUndo, maskBtnReset, maskBtnCancel, maskBtnApply;
var selectionToolsGroup, maskBtnWand, maskBtnQuickSel;
var toleranceGroup, toleranceSlider, toleranceVal;
var actionBar, btnPreMask, btnEditMask, btnCompose, btnDlSingle;
var composeToolbar, composeBgType, composeBgColor;
var composeScaleSlider, composeScaleVal;
var composeBtnReset, composeBtnApply, composeBtnExport, composeBtnClose;

function initRemoverDOM() {
    dropzone = document.getElementById('remover-dropzone');
    fileInput = document.getElementById('remover-file-input');
    browseLink = document.getElementById('remover-browse');
    imageList = document.getElementById('remover-image-list');
    countBadge = document.getElementById('remover-count');
    processBtn = document.getElementById('btn-remove-bg');
    progressWrap = document.getElementById('remover-progress-wrap');
    progressFill = document.getElementById('remover-progress-fill');
    statusText = document.getElementById('remover-status');
    downloadSection = document.getElementById('remover-download-section');
    downloadAllBtn = document.getElementById('btn-download-all');
    emptyState = document.getElementById('remover-empty-state');
    compareContainer = document.getElementById('remover-compare');
    beforeImg = document.getElementById('remover-before-img');
    afterImg = document.getElementById('remover-after-img');
    compareSlider = document.getElementById('remover-compare-slider');
    resultsContainer = document.getElementById('remover-results');
    previewContainer = document.getElementById('remover-preview-container');

    editorCanvas = document.getElementById('remover-editor-canvas');
    editorCtx = editorCanvas ? editorCanvas.getContext('2d', { willReadFrequently: true }) : null;
    brushCursor = document.getElementById('remover-brush-cursor');

    maskToolbar = document.getElementById('remover-mask-toolbar');
    maskBtnRestore = document.getElementById('mask-btn-restore');
    maskBtnErase = document.getElementById('mask-btn-erase');
    maskBrushSlider = document.getElementById('mask-brush-size');
    maskBrushVal = document.getElementById('mask-brush-size-val');
    maskBtnUndo = document.getElementById('mask-btn-undo');
    maskBtnReset = document.getElementById('mask-btn-reset');
    maskBtnCancel = document.getElementById('mask-btn-cancel');
    maskBtnApply = document.getElementById('mask-btn-apply');
    selectionToolsGroup = document.getElementById('mask-selection-tools');
    maskBtnWand = document.getElementById('mask-btn-wand');
    maskBtnQuickSel = document.getElementById('mask-btn-quicksel');
    toleranceGroup = document.getElementById('mask-tolerance-group');
    toleranceSlider = document.getElementById('mask-tolerance');
    toleranceVal = document.getElementById('mask-tolerance-val');

    actionBar = document.getElementById('remover-action-bar');
    btnPreMask = document.getElementById('btn-pre-mask');
    btnEditMask = document.getElementById('btn-edit-mask');
    btnCompose = document.getElementById('btn-compose');
    btnDlSingle = document.getElementById('btn-dl-single');

    composeToolbar = document.getElementById('remover-compose-toolbar');
    composeBgType = document.getElementById('compose-bg-type');
    composeBgColor = document.getElementById('compose-bg-color');
    composeScaleSlider = document.getElementById('compose-scale');
    composeScaleVal = document.getElementById('compose-scale-val');
    composeBtnReset = document.getElementById('compose-btn-reset');
    composeBtnApply = document.getElementById('compose-btn-apply');
    composeBtnExport = document.getElementById('compose-btn-export');
    composeBtnClose = document.getElementById('compose-btn-close');

    console.log('[BG Remover] DOM refs initialized.', browseLink ? '✅' : '❌ browseLink missing');
}
