// ===== Background Remover — AI Processing =====
// Library loading and background removal processing.
// Supports local models (offline) with CDN fallback.

// Check if local models are available
async function checkLocalModels() {
    try {
        const resp = await fetch('/models/resources.json', { method: 'HEAD' });
        return resp.ok;
    } catch { return false; }
}

async function ensureModelLoaded() {
    if (removeBackground) return;
    progressWrap.hidden = false;
    progressFill.style.width = '5%';

    // Check for local models first
    const hasLocalModels = await checkLocalModels();
    if (hasLocalModels) {
        statusText.textContent = '⏳ Loading library (local models available)...';
    } else {
        statusText.textContent = '⏳ Loading library from CDN...';
    }
    progressFill.style.width = '10%';

    try {
        const module = await import('https://esm.sh/@imgly/background-removal@1.7.0');
        removeBackground = module.default || module.removeBackground;
        if (!removeBackground) throw new Error('No removeBackground found. Keys: ' + Object.keys(module));

        // Store config for local model path
        if (hasLocalModels) {
            window._bgRemoveConfig = {
                publicPath: '/models/',
                model: 'isnet_quint8',
            };
            console.log('[BG Remover] Using local models from /models/');
        } else {
            window._bgRemoveConfig = {};
            console.log('[BG Remover] Using CDN models (run `bun scripts/download-models.ts` for offline)');
        }

        modelLoaded = true;
        progressFill.style.width = '100%';
        statusText.textContent = hasLocalModels ? '✅ Model loaded (offline)!' : '✅ Model loaded (CDN)!';
        setTimeout(() => { progressWrap.hidden = true; }, 1500);
    } catch (err) {
        console.error('[BG Remover] Load failed:', err);
        statusText.textContent = '❌ ' + (err.message || err);
        progressFill.style.width = '0%';
        throw err;
    }
}

// Process all pending images (called from initRemoverListeners in remover-download.js)
async function processAllImages() {
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
            const config = Object.assign({}, window._bgRemoveConfig || {}, {
                progress: (key, current, total) => {
                    if (key === 'compute:inference' && total > 0)
                        progressFill.style.width = (((i + current / total) / pending.length) * 100) + '%';
                }
            });
            const blob = await removeBackground(img.file, config);
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
}
