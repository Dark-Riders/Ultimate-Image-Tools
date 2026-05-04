// ===== Annotater — Interaction (Drag, Hit Detection, Keyboard) =====
// Mouse and touch events for dragging text/image objects on canvas.

function antCanvasToLogical(e) {
    var rect = antCanvas.getBoundingClientRect();
    var scaleX = antCanvasW / rect.width;
    var scaleY = antCanvasH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

function antCanvasTouchToLogical(e) {
    var touch = e.touches[0];
    var rect = antCanvas.getBoundingClientRect();
    var scaleX = antCanvasW / rect.width;
    var scaleY = antCanvasH / rect.height;
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
}

// ===== Hit detection (reverse z-order: texts top-most first, then image) =====
function antGetHitTarget(mx, my) {
    // Check texts (reverse order = top-most first)
    for (var i = antTexts.length - 1; i >= 0; i--) {
        var bounds = antMeasureText(antTexts[i]);
        if (mx >= bounds.x && mx <= bounds.x + bounds.w && my >= bounds.y && my <= bounds.y + bounds.h) {
            return { type: 'text', index: i, obj: antTexts[i] };
        }
    }
    // Check image
    if (antImage && antImage.el) {
        if (mx >= antImage.x && mx <= antImage.x + antImage.w && my >= antImage.y && my <= antImage.y + antImage.h) {
            return { type: 'image', index: -1, obj: antImage };
        }
    }
    return null;
}

// ===== Snap logic =====
function antApplySnap(nx, ny, ew, eh) {
    antSnapGuides = [];
    var cx = nx + ew / 2, cy = ny + eh / 2;
    var midX = antCanvasW / 2, midY = antCanvasH / 2;
    var t = antSNAP_THRESHOLD;

    // Center snap
    if (Math.abs(cx - midX) < t) { nx = midX - ew / 2; antSnapGuides.push({ axis: 'v', pos: midX }); }
    if (Math.abs(cy - midY) < t) { ny = midY - eh / 2; antSnapGuides.push({ axis: 'h', pos: midY }); }
    // Edge snap
    if (Math.abs(nx) < t) { nx = 0; antSnapGuides.push({ axis: 'v', pos: 0 }); }
    if (Math.abs(nx + ew - antCanvasW) < t) { nx = antCanvasW - ew; antSnapGuides.push({ axis: 'v', pos: antCanvasW }); }
    if (Math.abs(ny) < t) { ny = 0; antSnapGuides.push({ axis: 'h', pos: 0 }); }
    if (Math.abs(ny + eh - antCanvasH) < t) { ny = antCanvasH - eh; antSnapGuides.push({ axis: 'h', pos: antCanvasH }); }

    return { x: nx, y: ny };
}

// ===== Mouse events =====
function antInitMouseEvents() {
    antCanvas.addEventListener('mousedown', function (e) {
        var pos = antCanvasToLogical(e);
        var hit = antGetHitTarget(pos.x, pos.y);
        if (hit) {
            antPushHistory();
            antDragTarget = hit;
            antSelectedType = hit.type;
            antSelectedIndex = hit.index;
            antDragOffsetX = pos.x - hit.obj.x;
            antDragOffsetY = pos.y - hit.obj.y;
            antCanvas.style.cursor = 'grabbing';
            e.preventDefault();
            // Sync list selection
            antHighlightTextInList(hit.type === 'text' ? hit.index : -1);
        } else {
            antSelectedType = null;
            antSelectedIndex = -1;
            antHighlightTextInList(-1);
        }
        antRender();
    });

    antCanvas.addEventListener('mousemove', function (e) {
        var pos = antCanvasToLogical(e);
        if (antDragTarget) {
            var nx = pos.x - antDragOffsetX;
            var ny = pos.y - antDragOffsetY;
            // Get element dimensions for snap
            var ew = 0, eh = 0;
            if (antDragTarget.type === 'text') {
                var bounds = antMeasureText(antTexts[antDragTarget.index]);
                ew = bounds.w; eh = bounds.h;
            } else if (antDragTarget.type === 'image') {
                ew = antImage.w; eh = antImage.h;
            }
            var snapped = antApplySnap(nx, ny, ew, eh);
            if (antDragTarget.type === 'text') {
                antTexts[antDragTarget.index].x = snapped.x;
                antTexts[antDragTarget.index].y = snapped.y;
            } else if (antDragTarget.type === 'image') {
                antImage.x = snapped.x;
                antImage.y = snapped.y;
            }
            antRender();
        } else {
            antCanvas.style.cursor = antGetHitTarget(pos.x, pos.y) ? 'grab' : 'default';
        }
    });

    antCanvas.addEventListener('mouseup', function () {
        if (antDragTarget) {
            antDragTarget = null;
            antSnapGuides = [];
            antCanvas.style.cursor = 'grab';
            antRender();
        }
    });

    antCanvas.addEventListener('mouseleave', function () {
        if (antDragTarget) { antDragTarget = null; antSnapGuides = []; antCanvas.style.cursor = 'default'; antRender(); }
    });
}

// ===== Touch events =====
function antInitTouchEvents() {
    antCanvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        var pos = antCanvasTouchToLogical(e);
        var hit = antGetHitTarget(pos.x, pos.y);
        if (hit) {
            antPushHistory();
            antDragTarget = hit;
            antSelectedType = hit.type;
            antSelectedIndex = hit.index;
            antDragOffsetX = pos.x - hit.obj.x;
            antDragOffsetY = pos.y - hit.obj.y;
            antHighlightTextInList(hit.type === 'text' ? hit.index : -1);
        } else {
            antSelectedType = null; antSelectedIndex = -1;
            antHighlightTextInList(-1);
        }
        antRender();
    });

    antCanvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (!antDragTarget) return;
        var pos = antCanvasTouchToLogical(e);
        var nx = pos.x - antDragOffsetX, ny = pos.y - antDragOffsetY;
        var ew = 0, eh = 0;
        if (antDragTarget.type === 'text') {
            var bounds = antMeasureText(antTexts[antDragTarget.index]);
            ew = bounds.w; eh = bounds.h;
        } else if (antDragTarget.type === 'image') {
            ew = antImage.w; eh = antImage.h;
        }
        var snapped = antApplySnap(nx, ny, ew, eh);
        if (antDragTarget.type === 'text') {
            antTexts[antDragTarget.index].x = snapped.x;
            antTexts[antDragTarget.index].y = snapped.y;
        } else if (antDragTarget.type === 'image') {
            antImage.x = snapped.x; antImage.y = snapped.y;
        }
        antRender();
    });

    antCanvas.addEventListener('touchend', function () {
        antDragTarget = null; antSnapGuides = []; antRender();
    });
}

// ===== Keyboard =====
function antInitKeyboard() {
    document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        // Only act when Annotater tab is visible
        if (!antCanvas || !antCanvas.offsetParent) return;

        // Ctrl+Z undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            antUndo();
            return;
        }
        // Delete selected
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (antSelectedType === 'text' && antSelectedIndex >= 0) {
                antPushHistory();
                antTexts.splice(antSelectedIndex, 1);
                antSelectedType = null; antSelectedIndex = -1;
                antRenderTextList();
                antRender();
                e.preventDefault();
            }
        }
    });
}

// Highlight a text item in the sidebar list
function antHighlightTextInList(index) {
    if (!antTextList) return;
    var items = antTextList.querySelectorAll('.ant-text-item');
    items.forEach(function (el, i) {
        el.classList.toggle('selected', i === index);
    });
}
