// ===== Background Remover Module =====
// Uses @imgly/background-removal from esm.sh CDN
// Single canvas for mask editing + compose (move/resize)

console.log('[BG Remover] Module loading...');

let removeBackground;
let modelLoaded = false;
let processing = false;

// ===== State =====
const images = []; // { file, name, originalUrl, resultBlob, resultUrl, status }
let selectedIndex = -1;
let editorMode = 'preview'; // 'preview' | 'mask' | 'compose' | 'premask'

// Mask state
let maskMode = 'restore';
let maskBrushSize = 25;
let maskDrawing = false;
let maskHistory = [];
let maskOriginalData = null;
let maskResultData = null;

// Compose state
let composeObj = null;

// Pre-mask state
let preMaskOriginal = null;  // Image element of original
let preMaskCanvas = null;    // offscreen canvas for mask (white = keep)
let preMaskCtx = null;
let preMaskMode = 'keep';    // 'keep' | 'remove'
let preMaskHistory = [];

// ===== DOM Refs =====
const dropzone = document.getElementById('remover-dropzone');
const fileInput = document.getElementById('remover-file-input');
const browseLink = document.getElementById('remover-browse');
const imageList = document.getElementById('remover-image-list');
const countBadge = document.getElementById('remover-count');
const processBtn = document.getElementById('btn-remove-bg');
const progressWrap = document.getElementById('remover-progress-wrap');
const progressFill = document.getElementById('remover-progress-fill');
const statusText = document.getElementById('remover-status');
const downloadSection = document.getElementById('remover-download-section');
const downloadAllBtn = document.getElementById('btn-download-all');
const emptyState = document.getElementById('remover-empty-state');
const compareContainer = document.getElementById('remover-compare');
const beforeImg = document.getElementById('remover-before-img');
const afterImg = document.getElementById('remover-after-img');
const compareSlider = document.getElementById('remover-compare-slider');
const resultsContainer = document.getElementById('remover-results');
const previewContainer = document.getElementById('remover-preview-container');

// Shared editor canvas
const editorCanvas = document.getElementById('remover-editor-canvas');
const editorCtx = editorCanvas ? editorCanvas.getContext('2d', { willReadFrequently: true }) : null;
const brushCursor = document.getElementById('remover-brush-cursor');

// Mask toolbar
const maskToolbar = document.getElementById('remover-mask-toolbar');
const maskBtnRestore = document.getElementById('mask-btn-restore');
const maskBtnErase = document.getElementById('mask-btn-erase');
const maskBrushSlider = document.getElementById('mask-brush-size');
const maskBrushVal = document.getElementById('mask-brush-size-val');
const maskBtnUndo = document.getElementById('mask-btn-undo');
const maskBtnReset = document.getElementById('mask-btn-reset');
const maskBtnCancel = document.getElementById('mask-btn-cancel');
const maskBtnApply = document.getElementById('mask-btn-apply');

// Action bar
const actionBar = document.getElementById('remover-action-bar');
const btnPreMask = document.getElementById('btn-pre-mask');
const btnEditMask = document.getElementById('btn-edit-mask');
const btnCompose = document.getElementById('btn-compose');
const btnDlSingle = document.getElementById('btn-dl-single');

// Compose toolbar
const composeToolbar = document.getElementById('remover-compose-toolbar');
const composeBgType = document.getElementById('compose-bg-type');
const composeBgColor = document.getElementById('compose-bg-color');
const composeScaleSlider = document.getElementById('compose-scale');
const composeScaleVal = document.getElementById('compose-scale-val');
const composeBtnReset = document.getElementById('compose-btn-reset');
const composeBtnApply = document.getElementById('compose-btn-apply');
const composeBtnExport = document.getElementById('compose-btn-export');
const composeBtnClose = document.getElementById('compose-btn-close');

// ===== Load library =====
async function ensureModelLoaded() {
    if (removeBackground) return;
    statusText.textContent = '⏳ Downloading library from CDN...';
    progressWrap.hidden = false;
    progressFill.style.width = '10%';
    try {
        const module = await import('https://esm.sh/@imgly/background-removal@1.7.0');
        removeBackground = module.default || module.removeBackground;
        if (!removeBackground) throw new Error('No removeBackground found. Keys: ' + Object.keys(module));
        modelLoaded = true;
        progressFill.style.width = '100%';
        statusText.textContent = '✅ Model loaded!';
        setTimeout(() => { progressWrap.hidden = true; }, 1500);
    } catch (err) {
        console.error('[BG Remover] Load failed:', err);
        statusText.textContent = '❌ ' + (err.message || err);
        progressFill.style.width = '0%';
        throw err;
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ===== File Upload =====
browseLink.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
fileInput.addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    addFiles(Array.from(e.dataTransfer.files).filter(f => /\.(png|jpe?g|webp)$/i.test(f.name)));
});

function addFiles(fileList) {
    Array.from(fileList).forEach(file => {
        if (!/\.(png|jpe?g|webp)$/i.test(file.name)) return;
        images.push({ file, name: file.name, originalUrl: URL.createObjectURL(file), resultBlob: null, resultUrl: null, status: 'pending' });
    });
    renderImageList();
    updateProcessBtn();
}

// ===== Render Image List =====
function renderImageList() {
    imageList.innerHTML = '';
    countBadge.textContent = images.length;
    images.forEach((img, i) => {
        const row = document.createElement('div');
        row.className = 'remover-image-row' +
            (img.status === 'done' ? ' done' : '') +
            (img.status === 'processing' ? ' processing' : '') +
            (img.status === 'error' ? ' error' : '') +
            (i === selectedIndex ? ' active' : '');
        const icon = { done: '✅', processing: '⏳', error: '❌' }[img.status] || '⬜';
        row.innerHTML =
            '<img src="' + img.originalUrl + '" class="remover-thumb" alt="">' +
            '<div class="remover-image-info"><span class="remover-image-name">' + img.name + '</span>' +
            '<span class="remover-image-status">' + icon + ' ' + img.status + '</span></div>' +
            '<div class="remover-image-actions">' +
            (img.resultUrl ? '<button class="remover-dl-btn" title="Download">⬇</button>' : '') +
            '<button class="remover-rm-btn" title="Remove">✕</button></div>';
        row.addEventListener('click', (e) => {
            if (e.target.closest('.remover-rm-btn') || e.target.closest('.remover-dl-btn')) return;
            exitEditor(); selectImage(i);
        });
        const dlBtn = row.querySelector('.remover-dl-btn');
        if (dlBtn) dlBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadSingle(i); });
        row.querySelector('.remover-rm-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(img.originalUrl);
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            images.splice(i, 1);
            if (selectedIndex >= images.length) selectedIndex = images.length - 1;
            renderImageList(); updateProcessBtn();
            if (images.length === 0) { hidePreview(); } else if (selectedIndex >= 0) { exitEditor(); selectImage(selectedIndex); }
        });
        imageList.appendChild(row);
    });
}

// ===== Show/Hide Helpers =====
function showUI(opts) {
    compareContainer.hidden = !opts.compare;
    editorCanvas.hidden = !opts.canvas;
    maskToolbar.hidden = !opts.maskToolbar;
    composeToolbar.hidden = !opts.composeToolbar;
    actionBar.hidden = !opts.actionBar;
    // Hide empty state when any content is visible (use display to override CSS)
    emptyState.style.display = (opts.compare || opts.canvas) ? 'none' : '';
    // Hide brush cursor when not in mask mode
    if (!opts.maskToolbar) brushCursor.hidden = true;
    if (opts.canvas) {
        editorCanvas.style.cursor = opts.cursor || 'default';
    }
}

// Fit canvas to container maintaining aspect ratio
function fitCanvasToContainer() {
    const cw = previewContainer.clientWidth;
    const ch = previewContainer.clientHeight;
    if (!cw || !ch || !editorCanvas.width || !editorCanvas.height) return;
    const canvasRatio = editorCanvas.width / editorCanvas.height;
    const containerRatio = cw / ch;
    let dw, dh;
    if (canvasRatio > containerRatio) {
        dw = cw; dh = cw / canvasRatio;
    } else {
        dh = ch; dw = ch * canvasRatio;
    }
    editorCanvas.style.width = dw + 'px';
    editorCanvas.style.height = dh + 'px';
    editorCanvas.style.left = ((cw - dw) / 2) + 'px';
    editorCanvas.style.top = ((ch - dh) / 2) + 'px';
}

function selectImage(index) {
    selectedIndex = index;
    const img = images[index];
    if (!img) return;
    editorMode = 'preview';
    emptyState.style.display = 'none';
    showUI({ compare: true, actionBar: true });
    beforeImg.src = img.originalUrl;
    afterImg.src = img.resultUrl || img.originalUrl;
    compareSlider.style.left = '50%';
    compareContainer.querySelector('.remover-compare-after').style.clipPath = 'inset(0 0 0 50%)';
    // Show appropriate buttons based on status
    const isDone = img.status === 'done';
    btnPreMask.hidden = isDone;
    btnEditMask.hidden = !isDone;
    btnCompose.hidden = !isDone;
    btnDlSingle.hidden = !isDone;
    renderImageList();
}

function hidePreview() {
    editorMode = 'preview';
    emptyState.style.display = '';
    showUI({});
    resultsContainer.hidden = true;
    selectedIndex = -1;
}

function exitEditor() {
    editorMode = 'preview';
    showUI({});
    composeObj = null;
}

// ===== Comparison Slider =====
let sliderDragging = false;
compareSlider.addEventListener('mousedown', (e) => { sliderDragging = true; e.preventDefault(); });
compareSlider.addEventListener('touchstart', (e) => { sliderDragging = true; e.preventDefault(); });
document.addEventListener('mousemove', (e) => { if (sliderDragging) updateSlider(e.clientX); });
document.addEventListener('touchmove', (e) => { if (sliderDragging) updateSlider(e.touches[0].clientX); });
document.addEventListener('mouseup', () => sliderDragging = false);
document.addEventListener('touchend', () => sliderDragging = false);
function updateSlider(clientX) {
    const rect = previewContainer.getBoundingClientRect();
    let pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    compareSlider.style.left = pct + '%';
    compareContainer.querySelector('.remover-compare-after').style.clipPath = 'inset(0 0 0 ' + pct + '%)';
}

// ===== Process =====
processBtn.addEventListener('click', async () => {
    if (processing || images.length === 0) return;
    processing = true; processBtn.disabled = true;
    progressWrap.hidden = false; downloadSection.hidden = true;
    try { await ensureModelLoaded(); } catch { processing = false; processBtn.disabled = false; return; }
    const pending = images.filter(img => img.status !== 'done');
    const total = pending.length;
    for (let i = 0; i < pending.length; i++) {
        const img = pending[i];
        img.status = 'processing'; renderImageList();
        statusText.textContent = '🔄 Processing ' + (i + 1) + '/' + total + ': ' + img.name;
        progressFill.style.width = ((i / total) * 100) + '%';
        try {
            const blob = await removeBackground(img.file, {
                progress: (key, current, total) => {
                    if (key === 'compute:inference' && total > 0)
                        progressFill.style.width = (((i + current / total) / pending.length) * 100) + '%';
                }
            });
            img.resultBlob = blob;
            img.resultUrl = URL.createObjectURL(blob);
            img.status = 'done';
        } catch (err) { console.error('Process failed:', img.name, err); img.status = 'error'; }
        renderImageList();
    }
    progressFill.style.width = '100%';
    const doneCount = images.filter(i => i.status === 'done').length;
    statusText.textContent = '✅ Done! ' + doneCount + '/' + total + ' processed';
    processing = false; updateProcessBtn();
    if (doneCount > 0) { downloadSection.hidden = false; renderResults(); }
    const firstDone = images.findIndex(i => i.status === 'done');
    if (firstDone >= 0) selectImage(firstDone);
});

function renderResults() {
    resultsContainer.innerHTML = ''; resultsContainer.hidden = false;
    images.forEach((img, i) => {
        if (img.status !== 'done') return;
        const thumb = document.createElement('div');
        thumb.className = 'remover-result-thumb' + (i === selectedIndex ? ' active' : '');
        thumb.innerHTML = '<img src="' + img.resultUrl + '" alt=""><span>' + img.name.replace(/\.[^.]+$/, '') + '</span>';
        thumb.addEventListener('click', () => { exitEditor(); selectImage(i); });
        resultsContainer.appendChild(thumb);
    });
}

// ===== Action Bar =====
btnDlSingle.addEventListener('click', () => { if (selectedIndex >= 0) downloadSingle(selectedIndex); });
btnEditMask.addEventListener('click', () => { if (selectedIndex >= 0 && images[selectedIndex]?.status === 'done') enterMaskEditor(); });
btnCompose.addEventListener('click', () => { if (selectedIndex >= 0 && images[selectedIndex]?.status === 'done') enterCompose(); });
btnPreMask.addEventListener('click', () => { if (selectedIndex >= 0) enterPreMask(); });

// ═══════════════════════════════════════════
// ===== PRE-MASK (manual object selection) ==
// ═══════════════════════════════════════════

async function enterPreMask() {
    const img = images[selectedIndex];
    if (!img) return;
    editorMode = 'premask';
    preMaskMode = 'keep';
    preMaskHistory = [];

    // Show canvas and reuse mask toolbar (same buttons)
    showUI({ canvas: true, maskToolbar: true, cursor: 'none' });
    maskBtnRestore.textContent = '🖌️ Keep';
    maskBtnRestore.title = 'Paint to keep (select object)';
    maskBtnErase.textContent = '🧹 Remove';
    maskBtnErase.title = 'Unpaint to remove from selection';
    maskBtnRestore.classList.add('active');
    maskBtnErase.classList.remove('active');

    // Load original
    preMaskOriginal = await loadImage(img.originalUrl);
    const w = preMaskOriginal.naturalWidth, h = preMaskOriginal.naturalHeight;

    editorCanvas.width = w;
    editorCanvas.height = h;

    // Create mask canvas (empty = nothing selected)
    preMaskCanvas = document.createElement('canvas');
    preMaskCanvas.width = w; preMaskCanvas.height = h;
    preMaskCtx = preMaskCanvas.getContext('2d', { willReadFrequently: true });
    preMaskCtx.clearRect(0, 0, w, h);

    pushPreMaskHistory();
    renderPreMask();
    fitCanvasToContainer();
}

function pushPreMaskHistory() {
    const data = preMaskCtx.getImageData(0, 0, preMaskCanvas.width, preMaskCanvas.height);
    preMaskHistory.push(data);
    if (preMaskHistory.length > 30) preMaskHistory.shift();
}

function renderPreMask() {
    if (!preMaskOriginal) return;
    const w = editorCanvas.width, h = editorCanvas.height;
    editorCtx.clearRect(0, 0, w, h);

    // Draw original dimmed
    editorCtx.globalAlpha = 0.25;
    editorCtx.drawImage(preMaskOriginal, 0, 0);
    editorCtx.globalAlpha = 1.0;

    // Create masked version: original visible only where mask is white
    const mc = document.createElement('canvas');
    mc.width = w; mc.height = h;
    const mctx = mc.getContext('2d');
    mctx.drawImage(preMaskCanvas, 0, 0);          // white areas of mask
    mctx.globalCompositeOperation = 'source-in';
    mctx.drawImage(preMaskOriginal, 0, 0);         // clip original to mask

    // Draw bright masked areas on top
    editorCtx.drawImage(mc, 0, 0);
}

function paintPreMask(cx, cy) {
    const r = maskBrushSize * (editorCanvas.width / editorCanvas.getBoundingClientRect().width);
    if (preMaskMode === 'keep') {
        preMaskCtx.globalCompositeOperation = 'source-over';
        preMaskCtx.fillStyle = '#ffffff';
    } else {
        preMaskCtx.globalCompositeOperation = 'destination-out';
        preMaskCtx.fillStyle = '#ffffff';
    }
    preMaskCtx.beginPath();
    preMaskCtx.arc(cx, cy, r, 0, 2 * Math.PI);
    preMaskCtx.fill();
    preMaskCtx.globalCompositeOperation = 'source-over';
    renderPreMask();
}

function applyPreMask() {
    if (!preMaskOriginal || selectedIndex < 0) return;
    const w = editorCanvas.width, h = editorCanvas.height;

    // Create result: original clipped to mask
    const rc = document.createElement('canvas');
    rc.width = w; rc.height = h;
    const rctx = rc.getContext('2d');
    rctx.drawImage(preMaskCanvas, 0, 0);
    rctx.globalCompositeOperation = 'source-in';
    rctx.drawImage(preMaskOriginal, 0, 0);

    rc.toBlob((blob) => {
        const img = images[selectedIndex];
        img.resultBlob = blob;
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        img.resultUrl = URL.createObjectURL(blob);
        img.status = 'done';
        exitPreMask();
        renderImageList();
        updateProcessBtn();
        downloadSection.hidden = false;
        renderResults();
        selectImage(selectedIndex);
        statusText.textContent = '✅ Pre-mask applied! AI bypassed.';
        progressWrap.hidden = false;
        setTimeout(() => { progressWrap.hidden = true; }, 2000);
    }, 'image/png');
}

function exitPreMask() {
    // Restore toolbar labels
    maskBtnRestore.textContent = '🖌️ Restore';
    maskBtnRestore.title = 'Restore (paint back removed areas)';
    maskBtnErase.textContent = '🧹 Erase';
    maskBtnErase.title = 'Erase (remove leftover background)';
    preMaskOriginal = null;
    preMaskCanvas = null;
    preMaskCtx = null;
}

// ═══════════════════════════════════════════
// ===== MASK EDITOR (shared canvas) =====
// ═══════════════════════════════════════════

async function enterMaskEditor() {
    const img = images[selectedIndex];
    if (!img) return;
    editorMode = 'mask';
    showUI({ canvas: true, maskToolbar: true, cursor: 'none' });
    maskHistory = [];

    // Load current result as starting point
    const resImg = await loadImage(img.resultUrl);
    const w = resImg.naturalWidth, h = resImg.naturalHeight;

    editorCanvas.width = w;
    editorCanvas.height = h;
    editorCtx.clearRect(0, 0, w, h);
    editorCtx.drawImage(resImg, 0, 0);

    // Restore brush source = original photo (with background), resized to match result
    const origImg = await loadImage(img.originalUrl);
    const oc = document.createElement('canvas'); oc.width = w; oc.height = h;
    const octx = oc.getContext('2d', { willReadFrequently: true });
    octx.drawImage(origImg, 0, 0, w, h);
    maskOriginalData = octx.getImageData(0, 0, w, h); // "restore" paints from original photo

    // Reset source = current result snapshot
    const rc = document.createElement('canvas'); rc.width = w; rc.height = h;
    rc.getContext('2d').drawImage(resImg, 0, 0);
    maskResultData = rc.getContext('2d').getImageData(0, 0, w, h); // "reset" goes back to this

    pushMaskHistory();
    fitCanvasToContainer();
}

function pushMaskHistory() {
    maskHistory.push(editorCtx.getImageData(0, 0, editorCanvas.width, editorCanvas.height));
    if (maskHistory.length > 30) maskHistory.shift();
}

// ===== Shared Canvas Mouse/Touch =====
editorCanvas.addEventListener('mousedown', (e) => {
    if (editorMode === 'mask' || editorMode === 'premask') { maskDrawing = true; if (editorMode === 'mask') pushMaskHistory(); else pushPreMaskHistory(); }
    if (editorMode === 'mask') paintMask(e);
    else if (editorMode === 'premask') { const {x, y} = canvasCoords(e); paintPreMask(x, y); }
    else if (editorMode === 'compose') composeMouseDown(e);
});
editorCanvas.addEventListener('mousemove', (e) => {
    if (editorMode === 'mask' || editorMode === 'premask') {
        updateBrushCursor(e);
        if (maskDrawing) {
            if (editorMode === 'mask') paintMask(e);
            else { const {x, y} = canvasCoords(e); paintPreMask(x, y); }
        }
    }
    else if (editorMode === 'compose') composeMouseMove(e);
});
editorCanvas.addEventListener('mouseup', () => { maskDrawing = false; if (composeObj) composeObj.dragging = false; });
editorCanvas.addEventListener('mouseleave', () => { maskDrawing = false; brushCursor.hidden = true; });
editorCanvas.addEventListener('mouseenter', () => { if (editorMode === 'mask' || editorMode === 'premask') brushCursor.hidden = false; });

function updateBrushCursor(e) {
    const rect = previewContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Brush radius in canvas px = maskBrushSize * (canvasW / displayW)
    // That same radius on screen = maskBrushSize * (canvasW / displayW) * (displayW / canvasW) = maskBrushSize
    // So cursor diameter in CSS px = maskBrushSize * 2
    const size = maskBrushSize * 2;
    brushCursor.style.left = x + 'px';
    brushCursor.style.top = y + 'px';
    brushCursor.style.width = size + 'px';
    brushCursor.style.height = size + 'px';
    brushCursor.hidden = false;
    const isErase = (editorMode === 'mask' && maskMode === 'erase') || (editorMode === 'premask' && preMaskMode === 'remove');
    brushCursor.classList.toggle('erase', isErase);
}

editorCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (editorMode === 'mask' || editorMode === 'premask') { maskDrawing = true; if (editorMode === 'mask') pushMaskHistory(); else pushPreMaskHistory(); }
    if (editorMode === 'mask') paintMaskTouch(e);
    else if (editorMode === 'premask') { const {x, y} = canvasTouchCoords(e); paintPreMask(x, y); }
    else if (editorMode === 'compose') composeTouchStart(e);
});
editorCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (editorMode === 'mask' && maskDrawing) paintMaskTouch(e);
    else if (editorMode === 'premask' && maskDrawing) { const {x, y} = canvasTouchCoords(e); paintPreMask(x, y); }
    else if (editorMode === 'compose') composeTouchMove(e);
});
editorCanvas.addEventListener('touchend', () => { maskDrawing = false; if (composeObj) composeObj.dragging = false; });

function canvasCoords(e) {
    const rect = editorCanvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (editorCanvas.width / rect.width), y: (e.clientY - rect.top) * (editorCanvas.height / rect.height) };
}
function canvasTouchCoords(e) {
    const t = e.touches[0]; const rect = editorCanvas.getBoundingClientRect();
    return { x: (t.clientX - rect.left) * (editorCanvas.width / rect.width), y: (t.clientY - rect.top) * (editorCanvas.height / rect.height) };
}

// ===== Mask Painting =====
function paintMask(e) { const { x, y } = canvasCoords(e); applyBrush(x, y); }
function paintMaskTouch(e) { const { x, y } = canvasTouchCoords(e); applyBrush(x, y); }

function applyBrush(cx, cy) {
    const r = maskBrushSize * (editorCanvas.width / editorCanvas.getBoundingClientRect().width);
    const w = editorCanvas.width, h = editorCanvas.height;
    const data = editorCtx.getImageData(0, 0, w, h);
    const px = data.data, orig = maskOriginalData.data;
    const x0 = Math.max(0, Math.floor(cx - r)), y0 = Math.max(0, Math.floor(cy - r));
    const x1 = Math.min(w, Math.ceil(cx + r)), y1 = Math.min(h, Math.ceil(cy + r));
    for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist > r) continue;
            const s = Math.max(0, 1 - (dist / r) ** 2);
            const idx = (y * w + x) * 4;
            if (maskMode === 'restore') {
                px[idx] = Math.round(px[idx] + (orig[idx] - px[idx]) * s);
                px[idx+1] = Math.round(px[idx+1] + (orig[idx+1] - px[idx+1]) * s);
                px[idx+2] = Math.round(px[idx+2] + (orig[idx+2] - px[idx+2]) * s);
                px[idx+3] = Math.round(px[idx+3] + (orig[idx+3] - px[idx+3]) * s);
            } else {
                px[idx+3] = Math.round(px[idx+3] * (1 - s));
            }
        }
    }
    editorCtx.putImageData(data, 0, 0);
}

// Mask toolbar (shared by mask & premask modes)
maskBtnRestore.addEventListener('click', () => {
    if (editorMode === 'premask') preMaskMode = 'keep';
    else maskMode = 'restore';
    maskBtnRestore.classList.add('active'); maskBtnErase.classList.remove('active');
});
maskBtnErase.addEventListener('click', () => {
    if (editorMode === 'premask') preMaskMode = 'remove';
    else maskMode = 'erase';
    maskBtnErase.classList.add('active'); maskBtnRestore.classList.remove('active');
});
maskBrushSlider.addEventListener('input', () => { maskBrushSize = parseInt(maskBrushSlider.value); maskBrushVal.textContent = maskBrushSize; });
maskBtnUndo.addEventListener('click', () => {
    if (editorMode === 'premask') {
        if (preMaskHistory.length > 1) { preMaskHistory.pop(); preMaskCtx.putImageData(preMaskHistory[preMaskHistory.length - 1], 0, 0); renderPreMask(); }
    } else {
        if (maskHistory.length > 1) { maskHistory.pop(); editorCtx.putImageData(maskHistory[maskHistory.length - 1], 0, 0); }
    }
});
maskBtnReset.addEventListener('click', () => {
    if (editorMode === 'premask') {
        preMaskCtx.clearRect(0, 0, preMaskCanvas.width, preMaskCanvas.height);
        preMaskHistory = []; pushPreMaskHistory(); renderPreMask();
    } else if (maskResultData) {
        editorCtx.putImageData(maskResultData, 0, 0); maskHistory = []; pushMaskHistory();
    }
});
maskBtnCancel.addEventListener('click', () => {
    if (editorMode === 'premask') exitPreMask();
    exitEditor(); if (selectedIndex >= 0) selectImage(selectedIndex);
});
maskBtnApply.addEventListener('click', async () => {
    if (editorMode === 'premask') { applyPreMask(); return; }
    const blob = await new Promise(r => editorCanvas.toBlob(r, 'image/png'));
    const img = images[selectedIndex];
    if (img) {
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob);
        renderResults();
    }
    exitEditor(); if (selectedIndex >= 0) selectImage(selectedIndex);
});

// ═══════════════════════════════════════════
// ===== COMPOSE (shared canvas) =====
// ═══════════════════════════════════════════

async function enterCompose() {
    const img = images[selectedIndex];
    if (!img) return;
    editorMode = 'compose';
    showUI({ canvas: true, composeToolbar: true, cursor: 'grab' });

    const cutout = await loadImage(img.resultUrl);
    const origImg = await loadImage(img.originalUrl);

    editorCanvas.width = origImg.naturalWidth;
    editorCanvas.height = origImg.naturalHeight;

    composeObj = {
        img: cutout, x: 0, y: 0,
        w: cutout.naturalWidth, h: cutout.naturalHeight,
        scale: 1, dragging: false, offsetX: 0, offsetY: 0
    };
    composeScaleSlider.value = 100; composeScaleVal.textContent = '100%';
    composeBgType.value = 'transparent'; composeBgColor.hidden = true;
    renderCompose();
    fitCanvasToContainer();
}

function renderCompose() {
    if (!composeObj) return;
    const w = editorCanvas.width, h = editorCanvas.height;
    editorCtx.clearRect(0, 0, w, h);
    const bg = composeBgType.value;
    if (bg === 'white') { editorCtx.fillStyle = '#fff'; editorCtx.fillRect(0, 0, w, h); }
    else if (bg === 'black') { editorCtx.fillStyle = '#000'; editorCtx.fillRect(0, 0, w, h); }
    else if (bg === 'color') { editorCtx.fillStyle = composeBgColor.value; editorCtx.fillRect(0, 0, w, h); }
    const sw = composeObj.w * composeObj.scale, sh = composeObj.h * composeObj.scale;
    editorCtx.drawImage(composeObj.img, composeObj.x, composeObj.y, sw, sh);
    // Selection border
    editorCtx.strokeStyle = 'rgba(108, 92, 231, 0.8)';
    editorCtx.lineWidth = 2; editorCtx.setLineDash([6, 3]);
    editorCtx.strokeRect(composeObj.x, composeObj.y, sw, sh);
    editorCtx.setLineDash([]);
}

function renderComposeClean() {
    const w = editorCanvas.width, h = editorCanvas.height;
    editorCtx.clearRect(0, 0, w, h);
    const bg = composeBgType.value;
    if (bg === 'white') { editorCtx.fillStyle = '#fff'; editorCtx.fillRect(0, 0, w, h); }
    else if (bg === 'black') { editorCtx.fillStyle = '#000'; editorCtx.fillRect(0, 0, w, h); }
    else if (bg === 'color') { editorCtx.fillStyle = composeBgColor.value; editorCtx.fillRect(0, 0, w, h); }
    const sw = composeObj.w * composeObj.scale, sh = composeObj.h * composeObj.scale;
    editorCtx.drawImage(composeObj.img, composeObj.x, composeObj.y, sw, sh);
}

// Compose mouse handlers
function composeMouseDown(e) {
    if (!composeObj) return;
    const { x, y } = canvasCoords(e);
    const sw = composeObj.w * composeObj.scale, sh = composeObj.h * composeObj.scale;
    if (x >= composeObj.x && x <= composeObj.x + sw && y >= composeObj.y && y <= composeObj.y + sh) {
        composeObj.dragging = true; composeObj.offsetX = x - composeObj.x; composeObj.offsetY = y - composeObj.y;
        editorCanvas.style.cursor = 'grabbing';
    }
}
function composeMouseMove(e) {
    if (!composeObj || !composeObj.dragging) return;
    const { x, y } = canvasCoords(e);
    composeObj.x = x - composeObj.offsetX; composeObj.y = y - composeObj.offsetY;
    renderCompose();
}
function composeTouchStart(e) {
    if (!composeObj) return;
    const { x, y } = canvasTouchCoords(e);
    const sw = composeObj.w * composeObj.scale, sh = composeObj.h * composeObj.scale;
    if (x >= composeObj.x && x <= composeObj.x + sw && y >= composeObj.y && y <= composeObj.y + sh) {
        composeObj.dragging = true; composeObj.offsetX = x - composeObj.x; composeObj.offsetY = y - composeObj.y;
    }
}
function composeTouchMove(e) {
    if (!composeObj || !composeObj.dragging) return;
    const { x, y } = canvasTouchCoords(e);
    composeObj.x = x - composeObj.offsetX; composeObj.y = y - composeObj.offsetY;
    renderCompose();
}
document.addEventListener('mouseup', () => { if (composeObj) { composeObj.dragging = false; if (editorMode === 'compose') editorCanvas.style.cursor = 'grab'; } });

// Compose toolbar
composeBgType.addEventListener('change', () => { composeBgColor.hidden = composeBgType.value !== 'color'; renderCompose(); });
composeBgColor.addEventListener('input', () => renderCompose());
composeScaleSlider.addEventListener('input', () => {
    if (!composeObj) return;
    composeObj.scale = parseInt(composeScaleSlider.value) / 100;
    composeScaleVal.textContent = composeScaleSlider.value + '%';
    renderCompose();
});
composeBtnReset.addEventListener('click', () => {
    if (!composeObj) return;
    composeObj.x = 0; composeObj.y = 0; composeObj.scale = 1;
    composeScaleSlider.value = 100; composeScaleVal.textContent = '100%';
    renderCompose();
});
composeBtnApply.addEventListener('click', () => {
    if (!composeObj || selectedIndex < 0) return;
    renderComposeClean();
    editorCanvas.toBlob((blob) => {
        const img = images[selectedIndex];
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob);
        renderResults();
        renderCompose();
        statusText.textContent = '✅ Composed result applied!';
        progressWrap.hidden = false;
        setTimeout(() => { progressWrap.hidden = true; }, 2000);
    }, 'image/png');
});
composeBtnExport.addEventListener('click', () => {
    if (!composeObj) return;
    renderComposeClean();
    editorCanvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = (images[selectedIndex]?.name.replace(/\.[^.]+$/, '') || 'composed') + '_composed.png';
        link.href = URL.createObjectURL(blob);
        link.click(); URL.revokeObjectURL(link.href);
        renderCompose();
    }, 'image/png');
});
composeBtnClose.addEventListener('click', () => { exitEditor(); if (selectedIndex >= 0) selectImage(selectedIndex); });

// ===== Download =====
function downloadSingle(index) {
    const img = images[index];
    if (!img || !img.resultBlob) return;
    const link = document.createElement('a');
    link.download = img.name.replace(/\.[^.]+$/, '') + '_nobg.png';
    link.href = img.resultUrl; link.click();
}

downloadAllBtn.addEventListener('click', async () => {
    const done = images.filter(i => i.status === 'done');
    if (done.length === 0) return;
    if (done.length === 1) { downloadSingle(images.indexOf(done[0])); return; }
    statusText.textContent = '📦 Creating ZIP...'; progressWrap.hidden = false;
    try {
        const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
        const zip = new JSZip();
        done.forEach(img => zip.file(img.name.replace(/\.[^.]+$/, '') + '_nobg.png', img.resultBlob));
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = 'bg-removed-' + Date.now() + '.zip';
        link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href);
        statusText.textContent = '✅ ZIP downloaded!';
    } catch (err) { console.error('ZIP failed:', err); statusText.textContent = '❌ ZIP failed'; }
});

function updateProcessBtn() {
    processBtn.disabled = images.filter(i => i.status !== 'done').length === 0 || processing;
}

console.log('[BG Remover] ✅ Module fully loaded.');

// Ctrl+Z undo support for mask & premask editor
document.addEventListener('keydown', (e) => {
    if (editorMode !== 'mask' && editorMode !== 'premask') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (editorMode === 'premask') {
            if (preMaskHistory.length > 1) {
                preMaskHistory.pop();
                preMaskCtx.putImageData(preMaskHistory[preMaskHistory.length - 1], 0, 0);
                renderPreMask();
            }
        } else {
            if (maskHistory.length > 1) {
                maskHistory.pop();
                editorCtx.putImageData(maskHistory[maskHistory.length - 1], 0, 0);
            }
        }
    }
});
