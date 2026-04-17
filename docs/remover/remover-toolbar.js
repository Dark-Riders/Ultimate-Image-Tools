// ===== Background Remover — Toolbar Helpers =====
// Tool switching helper (event listeners are in remover-download.js).

// preMaskAction tracks whether wand/quicksel adds or removes from mask
var preMaskAction = 'keep'; // 'keep' or 'remove'

function setPreMaskTool(mode) {
    preMaskMode = mode;

    // Update tool button active states
    maskBtnWand.classList.toggle('active', mode === 'wand');
    maskBtnQuickSel.classList.toggle('active', mode === 'quicksel');

    // Keep/Remove buttons are always available for all premask tools
    maskBtnRestore.classList.toggle('active', preMaskAction === 'keep');
    maskBtnErase.classList.toggle('active', preMaskAction === 'remove');

    // Show tolerance for wand/quicksel
    toleranceGroup.hidden = (mode !== 'wand' && mode !== 'quicksel');

    // Cursor: wand gets crosshair, quicksel gets brush cursor, keep/remove get brush cursor
    if (mode === 'wand') {
        editorCanvas.style.cursor = 'crosshair';
        brushCursor.hidden = true;
    } else {
        editorCanvas.style.cursor = 'none';
    }
}

function setPreMaskAction(action) {
    preMaskAction = action;
    maskBtnRestore.classList.toggle('active', action === 'keep');
    maskBtnErase.classList.toggle('active', action === 'remove');
}
