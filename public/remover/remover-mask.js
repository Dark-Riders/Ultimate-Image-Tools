// ═══════════════════════════════════════════
// ===== MASK EDITOR (shared canvas) =====
// ═══════════════════════════════════════════
// Post-process mask editing: restore/erase brush on AI results.

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
