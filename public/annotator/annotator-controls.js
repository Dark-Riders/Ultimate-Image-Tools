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

    // Image upload (multi-file, adds to queue)
    antBrowseLink.addEventListener('click', function (e) { e.preventDefault(); antUploadInput.click(); });
    antUploadInput.addEventListener('change', function () {
        var files = antUploadInput.files;
        if (!files || files.length === 0) return;
        var startIdx = antImageQueue.length;
        var loaded = 0;
        for (var f = 0; f < files.length; f++) {
            (function (file) {
                if (!file.type.startsWith('image/')) return;
                var img = new Image();
                img.onload = function () {
                    antImageQueue.push({
                        el: img, name: file.name,
                        naturalW: img.naturalWidth, naturalH: img.naturalHeight,
                        thumbUrl: URL.createObjectURL(file)
                    });
                    loaded++;
                    // Navigate to first new image if nothing was loaded before
                    if (loaded === 1 && startIdx === 0) antNavigateTo(0);
                    antUpdateBatchUI();
                };
                img.src = URL.createObjectURL(file);
            })(files[f]);
        }
        antUploadInput.value = '';
    });
    antDropzone.addEventListener('dragover', function (e) { e.preventDefault(); antDropzone.classList.add('drag-over'); });
    antDropzone.addEventListener('dragleave', function () { antDropzone.classList.remove('drag-over'); });
    antDropzone.addEventListener('drop', function (e) {
        e.preventDefault(); antDropzone.classList.remove('drag-over');
        var files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        var startIdx = antImageQueue.length;
        var loaded = 0;
        for (var f = 0; f < files.length; f++) {
            (function (file) {
                if (!file.type.startsWith('image/')) return;
                var img = new Image();
                img.onload = function () {
                    antImageQueue.push({
                        el: img, name: file.name,
                        naturalW: img.naturalWidth, naturalH: img.naturalHeight,
                        thumbUrl: URL.createObjectURL(file)
                    });
                    loaded++;
                    if (loaded === 1 && startIdx === 0) antNavigateTo(0);
                    antUpdateBatchUI();
                };
                img.src = URL.createObjectURL(file);
            })(files[f]);
        }
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

    // Clear image (removes current from queue)
    antClearImageBtn.addEventListener('click', function () {
        if (antCurrentImageIdx >= 0 && antImageQueue.length > 0) {
            antRemoveFromQueue(antCurrentImageIdx);
        } else {
            antPushHistory();
            antImage = null;
            antImageInfo.textContent = 'No image loaded';
            antClearImageBtn.hidden = true;
            antImageScaleSlider.value = 100;
            antImageScaleVal.textContent = '100%';
            antRender();
        }
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
        // Image with effects
        if (antImage && antImage.el) {
            ectx.save();
            if (antFxShadow) {
                var rad = (antFxShadowAngle - 90) * Math.PI / 180;
                ectx.shadowOffsetX = Math.cos(rad) * antFxShadowDist;
                ectx.shadowOffsetY = Math.sin(rad) * antFxShadowDist;
                ectx.shadowBlur = antFxShadowBlur;
                ectx.shadowColor = 'rgba(0,0,0,' + (antFxShadowOpacity / 100) + ')';
            }
            ectx.drawImage(antImage.el, antImage.x, antImage.y, antImage.w, antImage.h);
            ectx.restore();
            if (antFxGlow) {
                ectx.save();
                ectx.globalCompositeOperation = 'destination-over';
                var gr = parseInt(antFxGlowColor.slice(1, 3), 16);
                var gg = parseInt(antFxGlowColor.slice(3, 5), 16);
                var gb = parseInt(antFxGlowColor.slice(5, 7), 16);
                ectx.shadowColor = 'rgba(' + gr + ',' + gg + ',' + gb + ',' + (antFxGlowOpacity / 100) + ')';
                ectx.shadowBlur = antFxGlowBlur;
                ectx.drawImage(antImage.el, antImage.x, antImage.y, antImage.w, antImage.h);
                ectx.restore();
            }
        }
        // Texts with effects
        for (var i = 0; i < antTexts.length; i++) {
            var t = antTexts[i];
            var style = (t.italic ? 'italic ' : '') + (t.bold ? 'bold ' : '');
            ectx.save();
            ectx.font = style + t.fontSize + 'px "' + t.fontFamily + '", sans-serif';
            ectx.fillStyle = t.color;
            ectx.textBaseline = 'top';
            if (antFxTextShadow) {
                ectx.shadowOffsetX = 0;
                ectx.shadowOffsetY = antFxTShadowY;
                ectx.shadowBlur = antFxTShadowBlur;
                ectx.shadowColor = antFxTShadowColor;
            }
            ectx.fillText(t.text || 'Text', t.x, t.y);
            ectx.restore();
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

    // ===== Effects Listeners =====
    antInitEffectsListeners();

    // Template system (from annotator-templates.js)
    initAnnotatorTemplateListeners();

    // Batch mode (from annotator-batch.js)
    initAnnotatorBatchListeners();

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
    antUpdateBatchUI();

    console.log('[Annotator] ✅ All listeners attached.');
}

// ===== Effects System Listeners =====
function antInitEffectsListeners() {
    if (!antFxShadowChk) return; // Effects DOM not present

    // Helper: update sibling value display for sliders
    function updateSliderVal(slider) {
        var valSpan = slider.parentElement.querySelector('.bgc-slider-val');
        if (valSpan) {
            var suffix = slider.id.includes('opacity') ? '%' : '';
            valSpan.textContent = slider.value + suffix;
        }
    }

    // Drop Shadow
    antFxShadowChk.addEventListener('change', function () {
        antFxShadow = this.checked;
        antFxShadowControls.hidden = !this.checked;
        antRender();
    });
    antFxShadowDistSlider.addEventListener('input', function () {
        antFxShadowDist = parseInt(this.value); updateSliderVal(this); antRender();
    });
    antFxShadowBlurSlider.addEventListener('input', function () {
        antFxShadowBlur = parseInt(this.value); updateSliderVal(this); antRender();
    });
    antFxShadowOpacitySlider.addEventListener('input', function () {
        antFxShadowOpacity = parseInt(this.value); updateSliderVal(this); antRender();
    });

    // Shadow angle picker (reuse BG Creator angle picker pattern)
    if (antFxShadowAnglePicker) {
        var shadowAngleDragging = false;

        function antFxShadowAngleFromMouse(e) {
            var rect = antFxShadowAnglePicker.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX || e.pageX) - cx;
            var dy = (e.clientY || e.pageY) - cy;
            var angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            if (angle < 0) angle += 360;
            return Math.round(angle) % 360;
        }

        function antFxUpdateShadowHandle() {
            var handle = antFxShadowAnglePicker.querySelector('.bgc-angle-handle');
            if (!handle) return;
            var rad = (antFxShadowAngle - 90) * Math.PI / 180;
            var r = 12; // radius for 40px picker
            var hx = 20 + Math.cos(rad) * r - 4;
            var hy = 20 + Math.sin(rad) * r - 4;
            handle.style.left = hx + 'px';
            handle.style.top = hy + 'px';
            if (antFxShadowAngleVal) antFxShadowAngleVal.textContent = Math.round(antFxShadowAngle) + '°';
        }

        antFxShadowAnglePicker.addEventListener('mousedown', function (e) {
            shadowAngleDragging = true;
            antFxShadowAngle = antFxShadowAngleFromMouse(e);
            antFxUpdateShadowHandle(); antRender();
        });
        document.addEventListener('mousemove', function (e) {
            if (!shadowAngleDragging) return;
            antFxShadowAngle = antFxShadowAngleFromMouse(e);
            antFxUpdateShadowHandle(); antRender();
        });
        document.addEventListener('mouseup', function () { shadowAngleDragging = false; });

        // Touch
        antFxShadowAnglePicker.addEventListener('touchstart', function (e) {
            e.preventDefault(); shadowAngleDragging = true;
            antFxShadowAngle = antFxShadowAngleFromMouse(e.touches[0]);
            antFxUpdateShadowHandle(); antRender();
        });
        document.addEventListener('touchmove', function (e) {
            if (!shadowAngleDragging) return;
            antFxShadowAngle = antFxShadowAngleFromMouse(e.touches[0]);
            antFxUpdateShadowHandle(); antRender();
        });
        document.addEventListener('touchend', function () { shadowAngleDragging = false; });

        // Set initial handle position
        antFxUpdateShadowHandle();
    }

    // Outer Glow
    antFxGlowChk.addEventListener('change', function () {
        antFxGlow = this.checked;
        antFxGlowControls.hidden = !this.checked;
        antRender();
    });
    antFxGlowBlurSlider.addEventListener('input', function () {
        antFxGlowBlur = parseInt(this.value); updateSliderVal(this); antRender();
    });
    antFxGlowColorPicker.addEventListener('input', function () {
        antFxGlowColor = this.value; antRender();
    });
    antFxGlowOpacitySlider.addEventListener('input', function () {
        antFxGlowOpacity = parseInt(this.value); updateSliderVal(this); antRender();
    });

    // Text Shadow
    antFxTShadowChk.addEventListener('change', function () {
        antFxTextShadow = this.checked;
        antFxTShadowControls.hidden = !this.checked;
        antRender();
    });
    antFxTShadowYSlider.addEventListener('input', function () {
        antFxTShadowY = parseInt(this.value); updateSliderVal(this); antRender();
    });
    antFxTShadowBlurSlider.addEventListener('input', function () {
        antFxTShadowBlur = parseInt(this.value); updateSliderVal(this); antRender();
    });
    antFxTShadowColorPicker.addEventListener('input', function () {
        antFxTShadowColor = this.value; antRender();
    });

    console.log('[Annotator] Effects listeners attached. ✅');
}

// ===== Bootstrap =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAnnotatorDOM(); initAnnotatorListeners(); });
} else {
    initAnnotatorDOM(); initAnnotatorListeners();
}
