// ===== Background Remover — Utilities =====
// Shared helper functions used across all remover modules.

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
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

function canvasCoords(e) {
    const rect = editorCanvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (editorCanvas.width / rect.width), y: (e.clientY - rect.top) * (editorCanvas.height / rect.height) };
}

function canvasTouchCoords(e) {
    const t = e.touches[0]; const rect = editorCanvas.getBoundingClientRect();
    return { x: (t.clientX - rect.left) * (editorCanvas.width / rect.width), y: (t.clientY - rect.top) * (editorCanvas.height / rect.height) };
}

function updateBrushCursor(e) {
    const rect = previewContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = maskBrushSize * 2;
    brushCursor.style.left = x + 'px';
    brushCursor.style.top = y + 'px';
    brushCursor.style.width = size + 'px';
    brushCursor.style.height = size + 'px';
    brushCursor.hidden = false;
    const isErase = (editorMode === 'mask' && maskMode === 'erase') || (editorMode === 'premask' && preMaskMode === 'remove');
    brushCursor.classList.toggle('erase', isErase);
}
