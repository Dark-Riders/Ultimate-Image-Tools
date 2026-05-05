// ===== Annotator — Batch Mode =====
// Image queue navigation, queue UI rendering, per-image text management, batch ZIP export.

// ===== Navigation =====
function antNavigateTo(idx) {
    if (antImageQueue.length === 0) return;
    // Wrap around
    if (idx < 0) idx = antImageQueue.length - 1;
    if (idx >= antImageQueue.length) idx = 0;

    // Save current per-image texts if in 'single' mode
    if (antEditMode === 'single' && antCurrentImageIdx >= 0) {
        antPerImageTexts[antCurrentImageIdx] = antTexts.map(function (t) { return Object.assign({}, t); });
    }

    antCurrentImageIdx = idx;
    var entry = antImageQueue[idx];

    // Load image via existing antLoadImage
    antLoadImage(entry.el, entry.name);

    // Restore per-image texts or shared template
    if (antEditMode === 'single' && antPerImageTexts[idx]) {
        antTexts = antPerImageTexts[idx].map(function (t) { return Object.assign({}, t); });
    }
    // In 'all' mode, antTexts stays as-is (shared template)

    antSelectedIndex = -1;
    antSelectedType = null;
    antRenderTextList();
    antRender();
    antUpdateBatchUI();
}

// ===== Queue UI =====
function antUpdateBatchUI() {
    if (!antBatchNavBar || !antBatchCounter || !antQueueList) return;
    var len = antImageQueue.length;

    // Nav bar visibility
    antBatchNavBar.hidden = len <= 1;

    // Counter text
    antBatchCounter.textContent = len > 0 ? (antCurrentImageIdx + 1) + ' / ' + len : '0 / 0';

    // Export All button
    if (antExportAllBtn) antExportAllBtn.hidden = len <= 1;

    // Render queue thumbnails
    antQueueList.innerHTML = '';
    if (len <= 1) return; // Don't show strip for 0-1 images

    for (var i = 0; i < len; i++) {
        (function (idx) {
            var item = document.createElement('div');
            item.className = 'ant-queue-item' + (idx === antCurrentImageIdx ? ' active' : '');
            item.innerHTML =
                '<img src="' + antImageQueue[idx].thumbUrl + '" alt="' + antImageQueue[idx].name + '">' +
                '<button class="ant-queue-remove" title="Remove">\u00d7</button>';
            item.querySelector('.ant-queue-remove').addEventListener('click', function (e) {
                e.stopPropagation();
                antRemoveFromQueue(idx);
            });
            item.addEventListener('click', function () { antNavigateTo(idx); });
            antQueueList.appendChild(item);
        })(i);
    }
}

// ===== Remove from queue =====
function antRemoveFromQueue(idx) {
    if (idx < 0 || idx >= antImageQueue.length) return;

    // Revoke thumb URL
    if (antImageQueue[idx].thumbUrl) URL.revokeObjectURL(antImageQueue[idx].thumbUrl);

    antImageQueue.splice(idx, 1);

    // Re-index per-image texts
    var newPerImage = {};
    var keys = Object.keys(antPerImageTexts);
    for (var k = 0; k < keys.length; k++) {
        var oldIdx = parseInt(keys[k]);
        if (oldIdx === idx) continue;
        var newIdx = oldIdx > idx ? oldIdx - 1 : oldIdx;
        newPerImage[newIdx] = antPerImageTexts[keys[k]];
    }
    antPerImageTexts = newPerImage;

    // Navigate
    if (antImageQueue.length === 0) {
        antCurrentImageIdx = -1;
        antImage = null;
        antImageInfo.textContent = 'No image loaded';
        antClearImageBtn.hidden = true;
        antImageScaleSlider.value = 100;
        antImageScaleVal.textContent = '100%';
        antRender();
    } else {
        if (antCurrentImageIdx >= antImageQueue.length) antCurrentImageIdx = antImageQueue.length - 1;
        antNavigateTo(antCurrentImageIdx);
    }
    antUpdateBatchUI();
}

// ===== Get active texts for current image =====
function antGetActiveTexts() {
    if (antEditMode === 'single' && antCurrentImageIdx >= 0 && antPerImageTexts[antCurrentImageIdx]) {
        return antPerImageTexts[antCurrentImageIdx];
    }
    return antTexts;
}

// ===== Batch Export as ZIP =====
async function antExportAll() {
    if (antImageQueue.length === 0) return;

    // Save current per-image texts if in single mode
    if (antEditMode === 'single' && antCurrentImageIdx >= 0) {
        antPerImageTexts[antCurrentImageIdx] = antTexts.map(function (t) { return Object.assign({}, t); });
    }

    // Dynamically load JSZip
    var JSZipModule;
    try {
        JSZipModule = await import('https://esm.sh/jszip@3.10.1');
    } catch (err) {
        alert('Failed to load ZIP library: ' + err.message);
        return;
    }
    var JSZipClass = JSZipModule.default || JSZipModule;
    var zip = new JSZipClass();
    var count = antImageQueue.length;
    var done = 0;

    for (var i = 0; i < count; i++) {
        (function (idx) {
            var entry = antImageQueue[idx];
            var texts = (antEditMode === 'single' && antPerImageTexts[idx])
                ? antPerImageTexts[idx] : antTexts;

            // Create export canvas
            var exportCanvas = document.createElement('canvas');
            exportCanvas.width = antCanvasW;
            exportCanvas.height = antCanvasH;
            var ectx = exportCanvas.getContext('2d');

            // Background
            if (antBgType !== 'transparent') {
                var colors = { white: '#ffffff', black: '#000000', color: antBgColor };
                ectx.fillStyle = colors[antBgType] || '#ffffff';
                ectx.fillRect(0, 0, antCanvasW, antCanvasH);
            }

            // Image — center + scale to fit
            var el = entry.el;
            var maxDim = Math.min(antCanvasW, antCanvasH) * 0.8;
            var w = el.naturalWidth || el.width;
            var h = el.naturalHeight || el.height;
            var scale = Math.min(maxDim / w, maxDim / h, 1);
            var sw = w * scale, sh = h * scale;
            var ix = (antCanvasW - sw) / 2, iy = (antCanvasH - sh) / 2;
            ectx.drawImage(el, ix, iy, sw, sh);

            // Texts
            for (var j = 0; j < texts.length; j++) {
                var t = texts[j];
                var style = (t.italic ? 'italic ' : '') + (t.bold ? 'bold ' : '');
                ectx.font = style + t.fontSize + 'px "' + t.fontFamily + '", sans-serif';
                ectx.fillStyle = t.color;
                ectx.textBaseline = 'top';
                ectx.fillText(t.text || 'Text', t.x, t.y);
            }

            exportCanvas.toBlob(function (blob) {
                var fname = entry.name.replace(/\.[^.]+$/, '') + '_annotated.png';
                zip.file(fname, blob);
                done++;
                if (done === count) {
                    zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
                        var link = document.createElement('a');
                        link.download = 'annotated_batch.zip';
                        link.href = URL.createObjectURL(zipBlob);
                        link.click();
                        URL.revokeObjectURL(link.href);
                    });
                }
            }, 'image/png');
        })(i);
    }
}

// ===== Batch Listeners (called from initAnnotatorListeners) =====
function initAnnotatorBatchListeners() {
    // Prev / Next
    antBatchPrev.addEventListener('click', function () { antNavigateTo(antCurrentImageIdx - 1); });
    antBatchNext.addEventListener('click', function () { antNavigateTo(antCurrentImageIdx + 1); });

    // Edit mode radio
    var radios = document.querySelectorAll('input[name="ant-edit-mode"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function () {
            var newMode = this.value;
            // Switching to 'single' — copy shared texts to per-image if not set
            if (newMode === 'single' && antCurrentImageIdx >= 0 && !antPerImageTexts[antCurrentImageIdx]) {
                antPerImageTexts[antCurrentImageIdx] = antTexts.map(function (t) { return Object.assign({}, t); });
            }
            // Switching to 'all' — save current per-image, restore shared
            if (newMode === 'all' && antEditMode === 'single' && antCurrentImageIdx >= 0) {
                antPerImageTexts[antCurrentImageIdx] = antTexts.map(function (t) { return Object.assign({}, t); });
            }
            antEditMode = newMode;
            antRenderTextList();
            antRender();
        });
    }

    // Export All
    antExportAllBtn.addEventListener('click', antExportAll);
}
