// ===== BG Creator — Canvas Rendering =====
// Client-side live preview using canvas. Draws base, gradient, textures, patterns, and product image.

function bgcRender() {
    if (!bgcCanvas || !bgcCtx) return;
    var w = bgcCanvas.width, h = bgcCanvas.height;
    bgcCtx.clearRect(0, 0, w, h);

    // 1. Base color
    bgcCtx.fillStyle = bgcBase;
    bgcCtx.fillRect(0, 0, w, h);

    // 2. Gradient (gradient_texture mode)
    if (bgcMode === 'gradient_texture') {
        bgcDrawGradient(bgcCtx, w, h);
    }

    // 3. Pattern (pattern mode)
    if (bgcMode === 'pattern') {
        bgcDrawPattern(bgcCtx, w, h, bgcPattern, bgcPatternSeed, {
            base: bgcBase, second: bgcSecond, third: bgcThird
        });
    }

    // 4. Texture overlay (all modes)
    if (bgcTexture !== 'none' && bgcTextureOpacity > 0) {
        bgcGenerateTexture(bgcCtx, w, h, bgcTexture, bgcTextureOpacity / 100, bgcTextureScale / 100);
    }

    // 5. Product image (if uploaded)
    if (bgcProductImage && bgcProductImage.el) {
        bgcDrawProduct(bgcCtx, w, h);
    }

    // 6. Fit canvas to container
    bgcFitCanvas();
}

function bgcDrawGradient(ctx, w, h) {
    var rad = (bgcGradientAngle - 90) * Math.PI / 180;
    var cx = w / 2, cy = h / 2;
    var len = Math.max(w, h) * 0.7;
    var x0 = cx - Math.cos(rad) * len;
    var y0 = cy - Math.sin(rad) * len;
    var x1 = cx + Math.cos(rad) * len;
    var y1 = cy + Math.sin(rad) * len;

    var grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, bgcBase);
    grad.addColorStop(0.5, bgcSecond);
    if (bgcThird && bgcMode === 'gradient_texture') {
        grad.addColorStop(1, bgcThird);
    } else {
        grad.addColorStop(1, bgcSecond);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

function bgcDrawProduct(ctx, w, h) {
    var img = bgcProductImage.el;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    // Fit product to 80% of canvas, maintain aspect ratio
    var maxW = w * 0.8, maxH = h * 0.8;
    var scale = Math.min(maxW / iw, maxH / ih, 1);
    var dw = iw * scale, dh = ih * scale;
    var dx = (w - dw) / 2, dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
}

function bgcFitCanvas() {
    if (!bgcCanvas || !bgcCanvasContainer) return;
    var cw = bgcCanvasContainer.clientWidth - 24;
    var ch = bgcCanvasContainer.clientHeight - 24;
    var scale = Math.min(cw / bgcCanvas.width, ch / bgcCanvas.height, 1);
    bgcCanvas.style.width = (bgcCanvas.width * scale) + 'px';
    bgcCanvas.style.height = (bgcCanvas.height * scale) + 'px';
}

// Debounced render — call this from controls
function bgcDebouncedRender() {
    if (bgcRenderTimer) clearTimeout(bgcRenderTimer);
    bgcRenderTimer = setTimeout(bgcRender, 50);
}

// Hex to RGBA helper
function bgcHexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
