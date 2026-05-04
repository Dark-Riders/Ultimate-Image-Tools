// ===== Annotater — Canvas Rendering =====
// Draws background, image, text objects, selection handles, and snap guides.

function antRender() {
    if (!antCanvas || !antCtx) return;
    var w = antCanvasW, h = antCanvasH;
    antCtx.clearRect(0, 0, w, h);

    // 1. Background
    if (antBgType === 'transparent') {
        antDrawCheckerboard(w, h);
    } else {
        var colors = { white: '#ffffff', black: '#000000', color: antBgColor };
        antCtx.fillStyle = colors[antBgType] || '#ffffff';
        antCtx.fillRect(0, 0, w, h);
    }

    // 2. Draw image
    if (antImage && antImage.el) {
        antCtx.drawImage(antImage.el, antImage.x, antImage.y, antImage.w, antImage.h);
    }

    // 3. Draw text objects
    for (var i = 0; i < antTexts.length; i++) {
        var t = antTexts[i];
        var style = (t.italic ? 'italic ' : '') + (t.bold ? 'bold ' : '');
        antCtx.font = style + t.fontSize + 'px "' + t.fontFamily + '", sans-serif';
        antCtx.fillStyle = t.color;
        antCtx.textBaseline = 'top';
        antCtx.fillText(t.text || 'Text', t.x, t.y);
    }

    // 4. Selection handles
    if (antSelectedType === 'image' && antImage) {
        antDrawSelection(antImage.x, antImage.y, antImage.w, antImage.h);
    } else if (antSelectedType === 'text' && antSelectedIndex >= 0 && antSelectedIndex < antTexts.length) {
        var t = antTexts[antSelectedIndex];
        var bounds = antMeasureText(t);
        antDrawSelection(bounds.x, bounds.y, bounds.w, bounds.h);
    }

    // 5. Snap guides
    antCtx.save();
    antCtx.strokeStyle = '#00aaff';
    antCtx.lineWidth = 1;
    antCtx.setLineDash([4, 4]);
    for (var i = 0; i < antSnapGuides.length; i++) {
        var g = antSnapGuides[i];
        antCtx.beginPath();
        if (g.axis === 'v') { antCtx.moveTo(g.pos, 0); antCtx.lineTo(g.pos, h); }
        else { antCtx.moveTo(0, g.pos); antCtx.lineTo(w, g.pos); }
        antCtx.stroke();
    }
    antCtx.restore();
}

function antDrawCheckerboard(w, h) {
    var size = 16;
    for (var y = 0; y < h; y += size) {
        for (var x = 0; x < w; x += size) {
            antCtx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#e0e0e0' : '#ffffff';
            antCtx.fillRect(x, y, size, size);
        }
    }
}

function antDrawSelection(x, y, w, h) {
    antCtx.save();
    antCtx.strokeStyle = '#2196F3';
    antCtx.lineWidth = 2;
    antCtx.setLineDash([6, 3]);
    antCtx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    antCtx.setLineDash([]);
    // Corner dots
    var corners = [[x - 2, y - 2], [x + w + 2, y - 2], [x - 2, y + h + 2], [x + w + 2, y + h + 2]];
    antCtx.fillStyle = '#2196F3';
    for (var i = 0; i < corners.length; i++) {
        antCtx.beginPath();
        antCtx.arc(corners[i][0], corners[i][1], 4, 0, Math.PI * 2);
        antCtx.fill();
    }
    antCtx.restore();
}

function antMeasureText(t) {
    var style = (t.italic ? 'italic ' : '') + (t.bold ? 'bold ' : '');
    antCtx.font = style + t.fontSize + 'px "' + t.fontFamily + '", sans-serif';
    antCtx.textBaseline = 'top';
    var metrics = antCtx.measureText(t.text || 'Text');
    var textW = metrics.width;
    var textH = t.fontSize * 1.2;
    return { x: t.x, y: t.y, w: textW, h: textH };
}

function antFitCanvas() {
    if (!antCanvas || !antCanvasContainer) return;
    var containerW = antCanvasContainer.clientWidth - 32;
    var containerH = antCanvasContainer.clientHeight - 32;
    var scale = Math.min(containerW / antCanvasW, containerH / antCanvasH, 1);
    antCanvas.style.width = (antCanvasW * scale) + 'px';
    antCanvas.style.height = (antCanvasH * scale) + 'px';
}
