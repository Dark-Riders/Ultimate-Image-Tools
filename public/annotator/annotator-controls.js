// ===== Annotator — Controls & Bootstrap =====
// DOM listeners, text list rendering, font picker, image upload, export, init.

// ===== Image loading (used by both upload and BG Remover "Send to Annotator") =====
function antLoadImage(imgEl, name) {
    var maxDim = Math.min(antCanvasW, antCanvasH) * 0.8;
    var w = imgEl.naturalWidth || imgEl.width;
    var h = imgEl.naturalHeight || imgEl.height;
    var scale = Math.min(maxDim / w, maxDim / h, 1);
    var sw = w * scale, sh = h * scale;
    antImage = {
        el: imgEl, name: name || 'image.png',
        x: (antCanvasW - sw) / 2, y: (antCanvasH - sh) / 2,
        w: sw, h: sh, baseW: sw, baseH: sh, scale: 100
    };
    // Update UI
    if (antImageInfo) antImageInfo.textContent = antImage.name;
    if (antImageScaleSlider) { antImageScaleSlider.value = 100; antImageScaleVal.textContent = '100%'; }
    if (antClearImageBtn) antClearImageBtn.hidden = false;
    antCanvasW = Math.max(antCanvasW, w);
    antCanvasH = Math.max(antCanvasH, h);
    antCanvas.width = antCanvasW;
    antCanvas.height = antCanvasH;
    // Recenter image after canvas resize
    antImage.x = (antCanvasW - sw) / 2;
    antImage.y = (antCanvasH - sh) / 2;
    antFitCanvas();
    antRender();
}

// ===== Text list rendering =====
function antRenderTextList() {
    if (!antTextList) return;
    antTextList.innerHTML = '';
    antTexts.forEach(function (t, i) {
        var item = document.createElement('div');
        item.className = 'ant-text-item' + (antSelectedType === 'text' && antSelectedIndex === i ? ' selected' : '');
        item.innerHTML =
            '<div class="ant-text-row">' +
                '<input type="text" class="ant-text-input" value="' + (t.text || '').replace(/"/g, '&quot;') + '" placeholder="Enter text...">' +
                '<button class="ant-text-del" title="Remove">✕</button>' +
            '</div>' +
            '<div class="ant-text-row">' +
                '<select class="ant-font-select">' + antFontList.map(function (f) {
                    return '<option value="' + f + '"' + (t.fontFamily === f ? ' selected' : '') + '>' + f + '</option>';
                }).join('') + '</select>' +
            '</div>' +
            '<div class="ant-text-row">' +
                '<label class="ant-label">Size</label>' +
                '<input type="range" class="ant-size-slider" min="12" max="200" value="' + t.fontSize + '">' +
                '<span class="ant-size-val">' + t.fontSize + 'px</span>' +
            '</div>' +
            '<div class="ant-text-row">' +
                '<input type="color" class="ant-color-picker" value="' + t.color + '">' +
                '<button class="ant-bold-btn' + (t.bold ? ' active' : '') + '">B</button>' +
                '<button class="ant-italic-btn' + (t.italic ? ' active' : '') + '">I</button>' +
            '</div>';

        // Text input
        item.querySelector('.ant-text-input').addEventListener('input', function (e) {
            antTexts[i].text = e.target.value;
            antRender();
        });
        // Delete
        item.querySelector('.ant-text-del').addEventListener('click', function (e) {
            e.stopPropagation();
            antPushHistory();
            antTexts.splice(i, 1);
            if (antSelectedIndex === i) { antSelectedIndex = -1; antSelectedType = null; }
            antRenderTextList(); antRender();
        });
        // Font — listen to both 'input' (arrow key navigation) and 'change' (click/Enter)
        var fontSelect = item.querySelector('.ant-font-select');
        function antUpdateFont(e) {
            antTexts[i].fontFamily = e.target.value;
            antRender();
        }
        fontSelect.addEventListener('input', antUpdateFont);
        fontSelect.addEventListener('change', antUpdateFont);
        // Size
        item.querySelector('.ant-size-slider').addEventListener('input', function (e) {
            antTexts[i].fontSize = parseInt(e.target.value);
            item.querySelector('.ant-size-val').textContent = e.target.value + 'px';
            antRender();
        });
        // Color
        item.querySelector('.ant-color-picker').addEventListener('input', function (e) {
            antTexts[i].color = e.target.value;
            antRender();
        });
        // Bold
        item.querySelector('.ant-bold-btn').addEventListener('click', function () {
            antTexts[i].bold = !antTexts[i].bold;
            this.classList.toggle('active', antTexts[i].bold);
            antRender();
        });
        // Italic
        item.querySelector('.ant-italic-btn').addEventListener('click', function () {
            antTexts[i].italic = !antTexts[i].italic;
            this.classList.toggle('active', antTexts[i].italic);
            antRender();
        });
        // Click to select
        item.addEventListener('click', function (e) {
            if (e.target.closest('.ant-text-del')) return;
            antSelectedType = 'text';
            antSelectedIndex = i;
            antHighlightTextInList(i);
            antRender();
        });

        antTextList.appendChild(item);
    });
}

// ===== Init listeners =====
function initAnnotatorListeners() {
    if (!antCanvas) return;

    // Image upload
    antBrowseLink.addEventListener('click', function (e) { e.preventDefault(); antUploadInput.click(); });
    antUploadInput.addEventListener('change', function () {
        var file = antUploadInput.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        var img = new Image();
        img.onload = function () { antLoadImage(img, file.name); };
        img.src = URL.createObjectURL(file);
        antUploadInput.value = '';
    });
    antDropzone.addEventListener('dragover', function (e) { e.preventDefault(); antDropzone.classList.add('drag-over'); });
    antDropzone.addEventListener('dragleave', function () { antDropzone.classList.remove('drag-over'); });
    antDropzone.addEventListener('drop', function (e) {
        e.preventDefault(); antDropzone.classList.remove('drag-over');
        var file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        var img = new Image();
        img.onload = function () { antLoadImage(img, file.name); };
        img.src = URL.createObjectURL(file);
    });

    // Image scale
    antImageScaleSlider.addEventListener('input', function () {
        if (!antImage) return;
        var s = parseInt(antImageScaleSlider.value);
        antImage.scale = s;
        antImage.w = antImage.baseW * s / 100;
        antImage.h = antImage.baseH * s / 100;
        antImageScaleVal.textContent = s + '%';
        antRender();
    });

    // Clear image
    antClearImageBtn.addEventListener('click', function () {
        antPushHistory();
        antImage = null;
        antImageInfo.textContent = 'No image loaded';
        antClearImageBtn.hidden = true;
        antImageScaleSlider.value = 100;
        antImageScaleVal.textContent = '100%';
        antRender();
    });

    // Add text
    antAddTextBtn.addEventListener('click', function () {
        antPushHistory();
        antTexts.push({
            text: 'New Text',
            x: antCanvasW / 2 - 50,
            y: antCanvasH / 2 - 15,
            fontSize: 36,
            fontFamily: 'Inter',
            color: '#000000',
            bold: false,
            italic: false
        });
        antSelectedType = 'text';
        antSelectedIndex = antTexts.length - 1;
        antRenderTextList();
        antRender();
    });

    // Background
    antBgSelect.addEventListener('change', function () {
        antBgType = antBgSelect.value;
        antBgColorPicker.hidden = antBgType !== 'color';
        antRender();
    });
    antBgColorPicker.addEventListener('input', function () {
        antBgColor = antBgColorPicker.value;
        antRender();
    });

    // Export PNG
    antExportBtn.addEventListener('click', function () {
        // Deselect to hide handles for clean export
        var prevType = antSelectedType, prevIdx = antSelectedIndex;
        antSelectedType = null; antSelectedIndex = -1; antSnapGuides = [];
        antRender();

        // For transparent bg, don't draw checkerboard — render clean
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
        // Image
        if (antImage && antImage.el) {
            ectx.drawImage(antImage.el, antImage.x, antImage.y, antImage.w, antImage.h);
        }
        // Texts
        for (var i = 0; i < antTexts.length; i++) {
            var t = antTexts[i];
            var style = (t.italic ? 'italic ' : '') + (t.bold ? 'bold ' : '');
            ectx.font = style + t.fontSize + 'px "' + t.fontFamily + '", sans-serif';
            ectx.fillStyle = t.color;
            ectx.textBaseline = 'top';
            ectx.fillText(t.text || 'Text', t.x, t.y);
        }

        exportCanvas.toBlob(function (blob) {
            var link = document.createElement('a');
            link.download = (antImage ? antImage.name.replace(/\.[^.]+$/, '') : 'annotated') + '_annotated.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/png');

        // Restore selection
        antSelectedType = prevType; antSelectedIndex = prevIdx;
        antRender();
    });

    // Template system (from annotator-templates.js)
    initAnnotatorTemplateListeners();

    // Init interaction events
    antInitMouseEvents();
    antInitTouchEvents();
    antInitKeyboard();

    // Fit canvas on resize
    window.addEventListener('resize', antFitCanvas);
    antFitCanvas();

    // Restore last template & populate dropdown
    antRefreshTplDropdown();
    antRestoreLastTemplate();

    console.log('[Annotator] ✅ All listeners attached.');
}

// ===== Bootstrap =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAnnotatorDOM(); initAnnotatorListeners(); });
} else {
    initAnnotatorDOM(); initAnnotatorListeners();
}
