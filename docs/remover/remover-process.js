// ===== Background Remover — AI Processing =====
// Library loading and background removal processing.

async function ensureModelLoaded() {
    if (removeBackground) return;
    statusText.textContent = '⏳ Downloading library from CDN...';
    progressWrap.hidden = false;
    progressFill.style.width = '10%';
    try {
        const module = await import('https://esm.sh/@imgly/background-removal@1.7.0');
        removeBackground = module.default || module.removeBackground;
        if (!removeBackground) throw new Error('No removeBackground found. Keys: ' + Object.keys(module));
        modelLoaded = true;
        progressFill.style.width = '100%';
        statusText.textContent = '✅ Model loaded!';
        setTimeout(() => { progressWrap.hidden = true; }, 1500);
    } catch (err) {
        console.error('[BG Remover] Load failed:', err);
        statusText.textContent = '❌ ' + (err.message || err);
        progressFill.style.width = '0%';
        throw err;
    }
}

// ===== Process =====
processBtn.addEventListener('click', async () => {
    if (processing || removerImages.length === 0) return;
    processing = true; processBtn.disabled = true;
    progressWrap.hidden = false; downloadSection.hidden = true;
    try { await ensureModelLoaded(); } catch { processing = false; processBtn.disabled = false; return; }
    const pending = removerImages.filter(img => img.status !== 'done');
    const total = pending.length;
    for (let i = 0; i < pending.length; i++) {
        const img = pending[i];
        img.status = 'processing'; renderImageList();
        statusText.textContent = '🔄 Processing ' + (i + 1) + '/' + total + ': ' + img.name;
        progressFill.style.width = ((i / total) * 100) + '%';
        try {
            const blob = await removeBackground(img.file, {
                progress: (key, current, total) => {
                    if (key === 'compute:inference' && total > 0)
                        progressFill.style.width = (((i + current / total) / pending.length) * 100) + '%';
                }
            });
            img.resultBlob = blob;
            img.resultUrl = URL.createObjectURL(blob);
            img.status = 'done';
        } catch (err) { console.error('Process failed:', img.name, err); img.status = 'error'; }
        renderImageList();
    }
    progressFill.style.width = '100%';
    const doneCount = removerImages.filter(i => i.status === 'done').length;
    statusText.textContent = '✅ Done! ' + doneCount + '/' + total + ' processed';
    processing = false; updateProcessBtn();
    if (doneCount > 0) { downloadSection.hidden = false; renderResults(); }
    const firstDone = removerImages.findIndex(i => i.status === 'done');
    if (firstDone >= 0) selectRemoverImage(firstDone);
});
