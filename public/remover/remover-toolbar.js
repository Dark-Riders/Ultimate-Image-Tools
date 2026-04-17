// ===== Background Remover — Toolbar Handlers =====
// Button event handlers for mask, pre-mask, and action bar toolbars.

// ===== Action Bar =====
btnDlSingle.addEventListener('click', () => { if (selectedIndex >= 0) downloadSingle(selectedIndex); });
btnEditMask.addEventListener('click', () => { if (selectedIndex >= 0 && images[selectedIndex]?.status === 'done') enterMaskEditor(); });
btnCompose.addEventListener('click', () => { if (selectedIndex >= 0 && images[selectedIndex]?.status === 'done') enterCompose(); });
btnPreMask.addEventListener('click', () => { if (selectedIndex >= 0) enterPreMask(); });

// ===== Mask Toolbar (shared by mask & premask modes) =====
function setPreMaskTool(mode) {
    preMaskMode = mode;
    maskBtnRestore.classList.toggle('active', mode === 'keep');
    maskBtnErase.classList.toggle('active', mode === 'remove');
    maskBtnWand.classList.toggle('active', mode === 'wand');
    maskBtnQuickSel.classList.toggle('active', mode === 'quicksel');
    toleranceGroup.hidden = (mode !== 'wand' && mode !== 'quicksel');
    // Cursor: wand=crosshair, others=brush circle
    if (mode === 'wand') {
        editorCanvas.style.cursor = 'crosshair'; brushCursor.hidden = true;
    } else {
        editorCanvas.style.cursor = 'none';
    }
}
maskBtnRestore.addEventListener('click', () => {
    if (editorMode === 'premask') setPreMaskTool('keep');
    else { maskMode = 'restore'; maskBtnRestore.classList.add('active'); maskBtnErase.classList.remove('active'); }
});
maskBtnErase.addEventListener('click', () => {
    if (editorMode === 'premask') setPreMaskTool('remove');
    else { maskMode = 'erase'; maskBtnErase.classList.add('active'); maskBtnRestore.classList.remove('active'); }
});
maskBtnWand.addEventListener('click', () => { if (editorMode === 'premask') setPreMaskTool('wand'); });
maskBtnQuickSel.addEventListener('click', () => { if (editorMode === 'premask') setPreMaskTool('quicksel'); });
toleranceSlider.addEventListener('input', () => { preMaskTolerance = parseInt(toleranceSlider.value); toleranceVal.textContent = preMaskTolerance; });
maskBrushSlider.addEventListener('input', () => { maskBrushSize = parseInt(maskBrushSlider.value); maskBrushVal.textContent = maskBrushSize; });
maskBtnUndo.addEventListener('click', () => {
    if (editorMode === 'premask') {
        if (preMaskHistory.length > 1) { preMaskHistory.pop(); preMaskCtx.putImageData(preMaskHistory[preMaskHistory.length - 1], 0, 0); renderPreMask(); }
    } else {
        if (maskHistory.length > 1) { maskHistory.pop(); editorCtx.putImageData(maskHistory[maskHistory.length - 1], 0, 0); }
    }
});
maskBtnReset.addEventListener('click', () => {
    if (editorMode === 'premask') {
        preMaskCtx.clearRect(0, 0, preMaskCanvas.width, preMaskCanvas.height);
        preMaskHistory = []; pushPreMaskHistory(); renderPreMask();
    } else if (maskResultData) {
        editorCtx.putImageData(maskResultData, 0, 0); maskHistory = []; pushMaskHistory();
    }
});
maskBtnCancel.addEventListener('click', () => {
    if (editorMode === 'premask') exitPreMask();
    exitEditor(); if (selectedIndex >= 0) selectImage(selectedIndex);
});
maskBtnApply.addEventListener('click', async () => {
    if (editorMode === 'premask') { applyPreMask(); return; }
    const blob = await new Promise(r => editorCanvas.toBlob(r, 'image/png'));
    const img = images[selectedIndex];
    if (img) {
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
        img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob);
        renderResults();
    }
    exitEditor(); if (selectedIndex >= 0) selectImage(selectedIndex);
});
