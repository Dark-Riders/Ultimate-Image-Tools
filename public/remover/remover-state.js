// ===== Background Remover — State & DOM Refs =====
// All shared state is declared with var/let so other scripts can access them.

console.log('[BG Remover] Module loading...');

// Library
var removeBackground;
var modelLoaded = false;
var processing = false;

// Core state
var images = []; // { file, name, originalUrl, resultBlob, resultUrl, status }
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

// ===== DOM Refs =====
var dropzone = document.getElementById('remover-dropzone');
var fileInput = document.getElementById('remover-file-input');
var browseLink = document.getElementById('remover-browse');
var imageList = document.getElementById('remover-image-list');
var countBadge = document.getElementById('remover-count');
var processBtn = document.getElementById('btn-remove-bg');
var progressWrap = document.getElementById('remover-progress-wrap');
var progressFill = document.getElementById('remover-progress-fill');
var statusText = document.getElementById('remover-status');
var downloadSection = document.getElementById('remover-download-section');
var downloadAllBtn = document.getElementById('btn-download-all');
var emptyState = document.getElementById('remover-empty-state');
var compareContainer = document.getElementById('remover-compare');
var beforeImg = document.getElementById('remover-before-img');
var afterImg = document.getElementById('remover-after-img');
var compareSlider = document.getElementById('remover-compare-slider');
var resultsContainer = document.getElementById('remover-results');
var previewContainer = document.getElementById('remover-preview-container');

// Shared editor canvas
var editorCanvas = document.getElementById('remover-editor-canvas');
var editorCtx = editorCanvas ? editorCanvas.getContext('2d', { willReadFrequently: true }) : null;
var brushCursor = document.getElementById('remover-brush-cursor');

// Mask toolbar
var maskToolbar = document.getElementById('remover-mask-toolbar');
var maskBtnRestore = document.getElementById('mask-btn-restore');
var maskBtnErase = document.getElementById('mask-btn-erase');
var maskBrushSlider = document.getElementById('mask-brush-size');
var maskBrushVal = document.getElementById('mask-brush-size-val');
var maskBtnUndo = document.getElementById('mask-btn-undo');
var maskBtnReset = document.getElementById('mask-btn-reset');
var maskBtnCancel = document.getElementById('mask-btn-cancel');
var maskBtnApply = document.getElementById('mask-btn-apply');
var selectionToolsGroup = document.getElementById('mask-selection-tools');
var maskBtnWand = document.getElementById('mask-btn-wand');
var maskBtnQuickSel = document.getElementById('mask-btn-quicksel');
var toleranceGroup = document.getElementById('mask-tolerance-group');
var toleranceSlider = document.getElementById('mask-tolerance');
var toleranceVal = document.getElementById('mask-tolerance-val');

// Action bar
var actionBar = document.getElementById('remover-action-bar');
var btnPreMask = document.getElementById('btn-pre-mask');
var btnEditMask = document.getElementById('btn-edit-mask');
var btnCompose = document.getElementById('btn-compose');
var btnDlSingle = document.getElementById('btn-dl-single');

// Compose toolbar
var composeToolbar = document.getElementById('remover-compose-toolbar');
var composeBgType = document.getElementById('compose-bg-type');
var composeBgColor = document.getElementById('compose-bg-color');
var composeScaleSlider = document.getElementById('compose-scale');
var composeScaleVal = document.getElementById('compose-scale-val');
var composeBtnReset = document.getElementById('compose-btn-reset');
var composeBtnApply = document.getElementById('compose-btn-apply');
var composeBtnExport = document.getElementById('compose-btn-export');
var composeBtnClose = document.getElementById('compose-btn-close');
