// ═══════════════════════════════════════════
// ===== PRE-MASK (manual object selection) ==
// ═══════════════════════════════════════════
// Paint to select objects, magic wand, quick select.

async function enterPreMask() {
    const img = removerImages[selectedIndex];
    if (!img) return;
    editorMode = 'premask';
    preMaskMode = 'keep';
    preMaskAction = 'keep';
    preMaskHistory = [];

    // Show canvas and reuse mask toolbar (same buttons)
    showUI({ canvas: true, maskToolbar: true, cursor: 'none' });
    maskBtnRestore.textContent = '🖌️ Keep';
    maskBtnRestore.title = 'Paint to keep (select object)';
    maskBtnErase.textContent = '🧹 Remove';
    maskBtnErase.title = 'Unpaint to remove from selection';
    maskBtnRestore.classList.add('active');
    maskBtnErase.classList.remove('active');
    maskBtnWand.classList.remove('active');
    maskBtnQuickSel.classList.remove('active');

    // Show selection tools & tolerance
    selectionToolsGroup.hidden = false;
    toleranceGroup.hidden = true; // Show when wand/quicksel selected

    // Load original
    preMaskOriginal = await loadImage(img.originalUrl);
    const w = preMaskOriginal.naturalWidth, h = preMaskOriginal.naturalHeight;

    editorCanvas.width = w;
    editorCanvas.height = h;

    // Store pixel data for color sampling (wand/quicksel)
    const tmpC = document.createElement('canvas'); tmpC.width = w; tmpC.height = h;
    const tmpCtx = tmpC.getContext('2d', { willReadFrequently: true });
    tmpCtx.drawImage(preMaskOriginal, 0, 0);
    preMaskPixelData = tmpCtx.getImageData(0, 0, w, h);

    // Pre-compute Sobel edge map for edge-aware quick select
    preMaskEdgeMap = computeEdgeMap(preMaskPixelData);

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

// ===== MAGIC WAND (flood fill by color similarity) =====
function magicWandAt(startX, startY) {
    if (!preMaskPixelData) return;
    const w = preMaskPixelData.width, h = preMaskPixelData.height;
    const px = preMaskPixelData.data;
    const sx = Math.round(startX), sy = Math.round(startY);
    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

    const idx0 = (sy * w + sx) * 4;
    const sr = px[idx0], sg = px[idx0 + 1], sb = px[idx0 + 2];
    const tol = preMaskTolerance; // direct 0-255 value, Photoshop-style

    const visited = new Uint8Array(w * h);
    const selected = new Uint8Array(w * h);
    const queue = [sx + sy * w];

    while (queue.length > 0) {
        const pos = queue.pop();
        if (visited[pos]) continue;
        visited[pos] = 1;
        const i = pos * 4;
        // Per-channel max comparison (Photoshop-style)
        const diff = Math.max(Math.abs(px[i] - sr), Math.abs(px[i+1] - sg), Math.abs(px[i+2] - sb));
        if (diff > tol) continue;
        selected[pos] = 1;
        const x = pos % w, y = (pos - x) / w;
        if (x > 0) queue.push(pos - 1);
        if (x < w - 1) queue.push(pos + 1);
        if (y > 0) queue.push(pos - w);
        if (y < h - 1) queue.push(pos + w);
    }

    // Apply selected pixels to mask
    pushPreMaskHistory();
    const maskData = preMaskCtx.getImageData(0, 0, w, h);
    const md = maskData.data;
    for (let i = 0; i < selected.length; i++) {
        if (selected[i]) {
            const j = i * 4;
            if (preMaskAction === 'keep') {
                md[j] = 255; md[j+1] = 255; md[j+2] = 255; md[j+3] = 255;
            } else {
                md[j] = 0; md[j+1] = 0; md[j+2] = 0; md[j+3] = 0;
            }
        }
    }
    preMaskCtx.putImageData(maskData, 0, 0);
    renderPreMask();
}

// ===== SOBEL EDGE DETECTION =====
function computeEdgeMap(imageData) {
    const w = imageData.width, h = imageData.height;
    const px = imageData.data;
    const gray = new Float32Array(w * h);
    // Convert to grayscale
    for (let i = 0; i < w * h; i++) {
        const j = i * 4;
        gray[i] = 0.299 * px[j] + 0.587 * px[j+1] + 0.114 * px[j+2];
    }
    // Sobel kernels
    const edges = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const tl = gray[(y-1)*w+(x-1)], tc = gray[(y-1)*w+x], tr = gray[(y-1)*w+(x+1)];
            const ml = gray[y*w+(x-1)],                          mr = gray[y*w+(x+1)];
            const bl = gray[(y+1)*w+(x-1)], bc = gray[(y+1)*w+x], br = gray[(y+1)*w+(x+1)];
            const gx = -tl + tr - 2*ml + 2*mr - bl + br;
            const gy = -tl - 2*tc - tr + bl + 2*bc + br;
            edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
        }
    }
    // Normalize to 0-255
    let maxE = 0;
    for (let i = 0; i < edges.length; i++) if (edges[i] > maxE) maxE = edges[i];
    if (maxE > 0) for (let i = 0; i < edges.length; i++) edges[i] = (edges[i] / maxE) * 255;
    return edges;
}

// ===== QUICK SELECT (edge-aware smart brush) =====
function quickSelectAt(cx, cy) {
    if (!preMaskPixelData || !preMaskEdgeMap) return;
    const w = preMaskPixelData.width, h = preMaskPixelData.height;
    const px = preMaskPixelData.data;
    const edges = preMaskEdgeMap;
    const brushR = maskBrushSize * (editorCanvas.width / editorCanvas.getBoundingClientRect().width);
    const growR = brushR * 3;
    const scx = Math.round(cx), scy = Math.round(cy);
    if (scx < 0 || scx >= w || scy < 0 || scy >= h) return;

    // Sample average color in brush area
    let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
    const bx0 = Math.max(0, Math.floor(cx - brushR)), by0 = Math.max(0, Math.floor(cy - brushR));
    const bx1 = Math.min(w, Math.ceil(cx + brushR)), by1 = Math.min(h, Math.ceil(cy + brushR));
    for (let y = by0; y < by1; y++) {
        for (let x = bx0; x < bx1; x++) {
            if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) > brushR) continue;
            const i = (y * w + x) * 4;
            sumR += px[i]; sumG += px[i+1]; sumB += px[i+2]; cnt++;
        }
    }
    if (cnt === 0) return;
    const ar = sumR / cnt, ag = sumG / cnt, ab = sumB / cnt;
    const tol = preMaskTolerance;
    // Edge threshold: edges above this strength block expansion
    const edgeThreshold = 80 + (255 - preMaskTolerance) * 0.5;

    // Region grow with edge awareness
    const visited = new Uint8Array(w * h);
    const selected = new Uint8Array(w * h);
    const queue = [];

    // Seed from brush center area
    for (let y = by0; y < by1; y++) {
        for (let x = bx0; x < bx1; x++) {
            if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) > brushR) continue;
            const pos = y * w + x;
            selected[pos] = 1; visited[pos] = 1; queue.push(pos);
        }
    }

    // Expand outward — stopped by edges AND color difference
    while (queue.length > 0) {
        const pos = queue.pop();
        const x = pos % w, y = (pos - x) / w;
        const neighbors = [];
        if (x > 0) neighbors.push(pos - 1);
        if (x < w - 1) neighbors.push(pos + 1);
        if (y > 0) neighbors.push(pos - w);
        if (y < h - 1) neighbors.push(pos + w);
        for (const npos of neighbors) {
            if (visited[npos]) continue;
            visited[npos] = 1;
            const nx = npos % w, ny = (npos - nx) / w;
            // Distance limit
            if (Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2) > growR) continue;
            // Edge barrier: stop at strong edges
            if (edges[npos] > edgeThreshold) continue;
            // Color similarity check
            const i = npos * 4;
            const diff = Math.max(Math.abs(px[i] - ar), Math.abs(px[i+1] - ag), Math.abs(px[i+2] - ab));
            if (diff <= tol) { selected[npos] = 1; queue.push(npos); }
        }
    }

    // Apply to mask
    const maskData = preMaskCtx.getImageData(0, 0, w, h);
    const md = maskData.data;
    for (let i = 0; i < selected.length; i++) {
        if (selected[i]) {
            const j = i * 4;
            if (preMaskAction === 'keep') {
                md[j] = 255; md[j+1] = 255; md[j+2] = 255; md[j+3] = 255;
            } else {
                md[j] = 0; md[j+1] = 0; md[j+2] = 0; md[j+3] = 0;
            }
        }
    }
    preMaskCtx.putImageData(maskData, 0, 0);
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
        const img = removerImages[selectedIndex];
        img.resultBlob = blob;
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        img.resultUrl = URL.createObjectURL(blob);
        img.status = 'done';
        exitPreMask();
        renderImageList();
        updateProcessBtn();
        downloadSection.hidden = false;
        renderResults();
        selectRemoverImage(selectedIndex);
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
    selectionToolsGroup.hidden = true;
    toleranceGroup.hidden = true;
    preMaskOriginal = null;
    preMaskCanvas = null;
    preMaskCtx = null;
    preMaskPixelData = null;
    preMaskEdgeMap = null;
}
