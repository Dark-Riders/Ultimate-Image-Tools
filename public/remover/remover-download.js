// ===== Background Remover — Download & Init =====
// Single and batch (ZIP) download, process button state.
// Also handles DOM initialization (must be the LAST remover script loaded).

function downloadSingle(index) {
    const img = removerImages[index];
    if (!img || !img.resultBlob) return;
    const link = document.createElement('a');
    link.download = img.name.replace(/\.[^.]+$/, '') + '_nobg.png';
    link.href = img.resultUrl; link.click();
}

function updateProcessBtn() {
    processBtn.disabled = removerImages.filter(i => i.status !== 'done').length === 0 || processing;
}

// ===== Initialize everything after DOM is ready =====
function initRemoverListeners() {
    // Upload listeners
    browseLink.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); addFiles(e.dataTransfer.files); });

    // Compare slider
    compareSlider.addEventListener('mousedown', () => { window._sliderDrag = true; });
    document.addEventListener('mousemove', (e) => { if (window._sliderDrag) updateSlider(e.clientX); });
    document.addEventListener('mouseup', () => { window._sliderDrag = false; });
    compareSlider.addEventListener('touchstart', (e) => { window._sliderDrag = true; e.preventDefault(); });
    document.addEventListener('touchmove', (e) => { if (window._sliderDrag) updateSlider(e.touches[0].clientX); });
    document.addEventListener('touchend', () => { window._sliderDrag = false; });

    // Process button
    processBtn.addEventListener('click', async () => {
        if (processing) return;
        const pending = removerImages.filter(i => i.status !== 'done');
        if (pending.length === 0) return;
        processing = true; processBtn.disabled = true;
        progressWrap.hidden = false; downloadSection.hidden = true;
        let done = 0;
        for (const img of pending) {
            statusText.textContent = `⏳ Processing ${img.name}...`;
            progressFill.style.width = ((done / pending.length) * 100) + '%';
            try {
                await ensureModelLoaded();
                const blob = await removeBackground(img.file);
                img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob); img.status = 'done';
            } catch (err) { console.error('BG removal failed:', err); img.status = 'error'; }
            done++;
        }
        progressFill.style.width = '100%';
        statusText.textContent = '✅ All done!';
        processing = false; processBtn.disabled = true;
        renderResults();
        if (removerImages.some(i => i.status === 'done')) { downloadSection.hidden = false; }
    });

    // Download all
    downloadAllBtn.addEventListener('click', async () => {
        const done = removerImages.filter(i => i.status === 'done');
        if (done.length === 0) return;
        if (done.length === 1) { downloadSingle(removerImages.indexOf(done[0])); return; }
        statusText.textContent = '📦 Creating ZIP...'; progressWrap.hidden = false;
        try {
            const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
            const zip = new JSZip();
            done.forEach(img => zip.file(img.name.replace(/\.[^.]+$/, '') + '_nobg.png', img.resultBlob));
            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.download = 'bg-removed-' + Date.now() + '.zip';
            link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href);
            statusText.textContent = '✅ ZIP downloaded!';
        } catch (err) { console.error('ZIP failed:', err); statusText.textContent = '❌ ZIP failed'; }
    });

    // Action bar
    btnDlSingle.addEventListener('click', () => { if (selectedIndex >= 0) downloadSingle(selectedIndex); });
    btnEditMask.addEventListener('click', () => { if (selectedIndex >= 0 && removerImages[selectedIndex]?.status === 'done') enterMaskEditor(); });
    btnCompose.addEventListener('click', () => { if (selectedIndex >= 0 && removerImages[selectedIndex]?.status === 'done') enterCompose(); });
    btnPreMask.addEventListener('click', () => { if (selectedIndex >= 0) enterPreMask(); });

    // Mask toolbar
    maskBtnRestore.addEventListener('click', () => {
        if (editorMode === 'premask') {
            // If currently in wand/quicksel, just switch action to keep
            if (preMaskMode === 'wand' || preMaskMode === 'quicksel') {
                setPreMaskAction('keep');
            } else {
                setPreMaskTool('keep');
            }
        } else {
            maskMode = 'restore'; maskBtnRestore.classList.add('active'); maskBtnErase.classList.remove('active');
        }
    });
    maskBtnErase.addEventListener('click', () => {
        if (editorMode === 'premask') {
            if (preMaskMode === 'wand' || preMaskMode === 'quicksel') {
                setPreMaskAction('remove');
            } else {
                setPreMaskTool('remove');
            }
        } else {
            maskMode = 'erase'; maskBtnErase.classList.add('active'); maskBtnRestore.classList.remove('active');
        }
    });
    maskBtnWand.addEventListener('click', () => {
        if (editorMode === 'premask') setPreMaskTool(preMaskMode === 'wand' ? 'keep' : 'wand');
    });
    maskBtnQuickSel.addEventListener('click', () => {
        if (editorMode === 'premask') setPreMaskTool(preMaskMode === 'quicksel' ? 'keep' : 'quicksel');
    });
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
        exitEditor(); if (selectedIndex >= 0) selectRemoverImage(selectedIndex);
    });
    maskBtnApply.addEventListener('click', async () => {
        if (editorMode === 'premask') { applyPreMask(); return; }
        const blob = await new Promise(r => editorCanvas.toBlob(r, 'image/png'));
        const img = removerImages[selectedIndex];
        if (img) {
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob);
            renderResults();
        }
        exitEditor(); if (selectedIndex >= 0) selectRemoverImage(selectedIndex);
    });

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
            const img = removerImages[selectedIndex];
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            img.resultBlob = blob; img.resultUrl = URL.createObjectURL(blob);
            renderResults(); renderCompose();
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
            link.download = (removerImages[selectedIndex]?.name.replace(/\.[^.]+$/, '') || 'composed') + '_composed.png';
            link.href = URL.createObjectURL(blob);
            link.click(); URL.revokeObjectURL(link.href);
            renderCompose();
        }, 'image/png');
    });
    composeBtnClose.addEventListener('click', () => { exitEditor(); if (selectedIndex >= 0) selectRemoverImage(selectedIndex); });

    // Canvas events
    editorCanvas.addEventListener('mousedown', (e) => {
        if (editorMode === 'mask') { maskDrawing = true; pushMaskHistory(); paintMask(e); }
        else if (editorMode === 'premask') {
            const {x, y} = canvasCoords(e);
            if (preMaskMode === 'wand') { magicWandAt(x, y); }
            else if (preMaskMode === 'quicksel') { maskDrawing = true; pushPreMaskHistory(); quickSelectAt(x, y); }
            else { maskDrawing = true; pushPreMaskHistory(); paintPreMask(x, y); }
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

    // Touch events
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

    // Compose mouse up
    document.addEventListener('mouseup', () => { if (composeObj) { composeObj.dragging = false; if (editorMode === 'compose') editorCanvas.style.cursor = 'grab'; } });

    // Ctrl+Z undo
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            if (editorMode === 'premask') {
                e.preventDefault();
                if (preMaskHistory.length > 1) { preMaskHistory.pop(); preMaskCtx.putImageData(preMaskHistory[preMaskHistory.length - 1], 0, 0); renderPreMask(); }
            } else if (editorMode === 'mask') {
                e.preventDefault();
                if (maskHistory.length > 1) { maskHistory.pop(); editorCtx.putImageData(maskHistory[maskHistory.length - 1], 0, 0); }
            }
        }
    });

    console.log('[BG Remover] ✅ All listeners attached.');
}

// ===== Bootstrap =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initRemoverDOM(); initRemoverListeners(); showUI({}); });
} else {
    initRemoverDOM(); initRemoverListeners(); showUI({});
}
