// ===== COMPOSE (shared canvas) =====
// ═══════════════════════════════════════════
// Move, resize, and export cutout on background.

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
