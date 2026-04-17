// ===== COMPOSE (shared canvas) =====
// Move, resize, and export cutout on background.
// Event listeners are in remover-download.js.

async function enterCompose() {
    const img = removerImages[selectedIndex];
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
