// ===== Background Remover — Toolbar Helpers =====
// Tool switching helper (event listeners are in remover-download.js).

function setPreMaskTool(mode) {
    preMaskMode = mode;
    maskBtnRestore.classList.toggle('active', mode === 'keep');
    maskBtnErase.classList.toggle('active', mode === 'remove');
    maskBtnWand.classList.toggle('active', mode === 'wand');
    maskBtnQuickSel.classList.toggle('active', mode === 'quicksel');
    toleranceGroup.hidden = (mode !== 'wand' && mode !== 'quicksel');
    if (mode === 'wand') {
        editorCanvas.style.cursor = 'crosshair'; brushCursor.hidden = true;
    } else {
        editorCanvas.style.cursor = 'none';
    }
}
