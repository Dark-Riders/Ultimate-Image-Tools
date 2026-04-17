// ===== Shared Canvas Events =====
// Mouse, touch, and keyboard dispatchers for all editor modes.

// ===== Mouse Events =====
editorCanvas.addEventListener('mousedown', (e) => {
    if (editorMode === 'mask') { maskDrawing = true; pushMaskHistory(); paintMask(e); }
    else if (editorMode === 'premask') {
        const {x, y} = canvasCoords(e);
        if (preMaskMode === 'wand') {
            magicWandAt(x, y);
        } else if (preMaskMode === 'quicksel') {
            maskDrawing = true; pushPreMaskHistory(); quickSelectAt(x, y);
        } else {
            maskDrawing = true; pushPreMaskHistory(); paintPreMask(x, y);
        }
    }
    else if (editorMode === 'compose') composeMouseDown(e);
});
editorCanvas.addEventListener('mousemove', (e) => {
    if (editorMode === 'mask' || editorMode === 'premask') {
        if (preMaskMode !== 'wand') updateBrushCursor(e);
        else { brushCursor.hidden = true; editorCanvas.style.cursor = 'crosshair'; }
        if (maskDrawing) {
            if (editorMode === 'mask') paintMask(e);
            else if (preMaskMode === 'quicksel') { const {x, y} = canvasCoords(e); quickSelectAt(x, y); }
            else if (preMaskMode === 'keep' || preMaskMode === 'remove') { const {x, y} = canvasCoords(e); paintPreMask(x, y); }
        }
    }
    else if (editorMode === 'compose') composeMouseMove(e);
});
editorCanvas.addEventListener('mouseup', () => { maskDrawing = false; if (composeObj) composeObj.dragging = false; });
editorCanvas.addEventListener('mouseleave', () => { maskDrawing = false; brushCursor.hidden = true; });
editorCanvas.addEventListener('mouseenter', () => { if (editorMode === 'mask' || editorMode === 'premask') { if (preMaskMode !== 'wand') brushCursor.hidden = false; } });

// ===== Touch Events =====
editorCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (editorMode === 'mask') { maskDrawing = true; pushMaskHistory(); paintMaskTouch(e); }
    else if (editorMode === 'premask') {
        const {x, y} = canvasTouchCoords(e);
        if (preMaskMode === 'wand') { magicWandAt(x, y); }
        else if (preMaskMode === 'quicksel') { maskDrawing = true; pushPreMaskHistory(); quickSelectAt(x, y); }
        else { maskDrawing = true; pushPreMaskHistory(); paintPreMask(x, y); }
    }
    else if (editorMode === 'compose') composeTouchStart(e);
});
editorCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (editorMode === 'mask' && maskDrawing) paintMaskTouch(e);
    else if (editorMode === 'premask' && maskDrawing) {
        const {x, y} = canvasTouchCoords(e);
        if (preMaskMode === 'quicksel') quickSelectAt(x, y);
        else if (preMaskMode === 'keep' || preMaskMode === 'remove') paintPreMask(x, y);
    }
    else if (editorMode === 'compose') composeTouchMove(e);
});
editorCanvas.addEventListener('touchend', () => { maskDrawing = false; if (composeObj) composeObj.dragging = false; });

// ===== Keyboard (Ctrl+Z Undo) =====
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        if (editorMode === 'premask') {
            e.preventDefault();
            if (preMaskHistory.length > 1) { preMaskHistory.pop(); preMaskCtx.putImageData(preMaskHistory[preMaskHistory.length - 1], 0, 0); renderPreMask(); }
        } else if (editorMode === 'mask') {
            e.preventDefault();
            if (maskHistory.length > 1) { maskHistory.pop(); editorCtx.putImageData(maskHistory[maskHistory.length - 1], 0, 0); }
        }
    }
});
