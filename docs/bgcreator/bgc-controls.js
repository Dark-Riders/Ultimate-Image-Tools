// ===== BG Creator — Controls & Listeners =====
// Event handlers, palette rendering, angle picker, image upload, and bootstrap.

// ===== Palette Grid Rendering =====
function bgcRenderPalettes() {
    if (!bgcPaletteGrid) return;
    bgcPaletteGrid.innerHTML = '';
    for (var i = 0; i < bgcPalettes.length; i++) {
        (function (idx) {
            var p = bgcPalettes[idx];
            var swatch = document.createElement('div');
            swatch.className = 'bgc-swatch' + (idx === bgcActivePalette ? ' active' : '');
            swatch.title = p.name;
            // Show gradient of the palette colors
            swatch.style.background = 'linear-gradient(135deg, ' + p.base + ' 0%, ' + p.second + ' 60%, ' + p.third + ' 100%)';
            swatch.addEventListener('click', function () {
                bgcActivePalette = idx;
                bgcBase = p.base;
                bgcSecond = p.second;
                bgcThird = p.third;
                bgcSyncColorInputs();
                bgcRenderPalettes();
                bgcDebouncedRender();
            });
            bgcPaletteGrid.appendChild(swatch);
        })(i);
    }
}

// Sync color inputs from state
function bgcSyncColorInputs() {
    if (bgcBaseInput) { bgcBaseInput.value = bgcBase; bgcBaseColor.value = bgcBase; }
    if (bgcSecondInput) { bgcSecondInput.value = bgcSecond; bgcSecondColor.value = bgcSecond; }
    if (bgcThirdInput) { bgcThirdInput.value = bgcThird; bgcThirdColor.value = bgcThird; }
}

// ===== Mode Switching =====
function bgcUpdateModeUI() {
    var showThird = bgcMode !== 'solid_texture';
    var showPattern = bgcMode === 'pattern';
    var showGradient = bgcMode === 'gradient_texture';

    if (bgcThirdGroup) bgcThirdGroup.hidden = !showThird;
    if (bgcPatternSection) bgcPatternSection.hidden = !showPattern;
    if (bgcGradientSection) bgcGradientSection.hidden = !showGradient;
}

// ===== 360° Angle Picker =====
function bgcUpdateAngleHandle(angle) {
    if (!bgcAnglePicker) return;
    var handle = bgcAnglePicker.querySelector('.bgc-angle-handle');
    if (!handle) return;
    var rad = (angle - 90) * Math.PI / 180;
    var radius = 20; // Half of picker size minus handle offset
    var hx = 28 + Math.cos(rad) * radius - 5; // center=28, handle=10px wide
    var hy = 28 + Math.sin(rad) * radius - 5;
    handle.style.left = hx + 'px';
    handle.style.top = hy + 'px';
    if (bgcAngleVal) bgcAngleVal.textContent = Math.round(angle) + '°';
}

function bgcAngleFromMouse(e, picker) {
    var rect = picker.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return Math.round(angle) % 360;
}

// ===== Download / Apply =====
async function bgcDownload() {
    // Render at full output size
    var exportCanvas = document.createElement('canvas');
    var size = bgcOutputSize;
    exportCanvas.width = size;
    exportCanvas.height = size;
    var ectx = exportCanvas.getContext('2d');

    // Base
    ectx.fillStyle = bgcBase;
    ectx.fillRect(0, 0, size, size);

    // Gradient
    if (bgcMode === 'gradient_texture') {
        var rad = (bgcGradientAngle - 90) * Math.PI / 180;
        var cx = size / 2, cy = size / 2;
        var len = size * 0.7;
        var grad = ectx.createLinearGradient(
            cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
            cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
        );
        grad.addColorStop(0, bgcBase);
        grad.addColorStop(0.5, bgcSecond);
        grad.addColorStop(1, bgcThird || bgcSecond);
        ectx.fillStyle = grad;
        ectx.fillRect(0, 0, size, size);
    }

    // Pattern
    if (bgcMode === 'pattern') {
        bgcDrawPattern(ectx, size, size, bgcPattern, bgcPatternSeed, {
            base: bgcBase, second: bgcSecond, third: bgcThird
        });
    }

    // Texture
    if (bgcTexture !== 'none' && bgcTextureOpacity > 0) {
        bgcGenerateTexture(ectx, size, size, bgcTexture, bgcTextureOpacity / 100, bgcTextureScale / 100);
    }

    // Download
    exportCanvas.toBlob(function (blob) {
        var link = document.createElement('a');
        link.download = 'bg_' + bgcMode + '_' + size + 'x' + size + '.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

async function bgcApplyToImage() {
    if (!bgcProductImage || !bgcProductImage.el) return;

    var exportCanvas = document.createElement('canvas');
    var size = bgcOutputSize;
    exportCanvas.width = size;
    exportCanvas.height = size;
    var ectx = exportCanvas.getContext('2d');

    // Same rendering as download
    ectx.fillStyle = bgcBase;
    ectx.fillRect(0, 0, size, size);

    if (bgcMode === 'gradient_texture') {
        var rad = (bgcGradientAngle - 90) * Math.PI / 180;
        var cx = size / 2, cy = size / 2, len = size * 0.7;
        var grad = ectx.createLinearGradient(
            cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
            cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
        );
        grad.addColorStop(0, bgcBase);
        grad.addColorStop(0.5, bgcSecond);
        grad.addColorStop(1, bgcThird || bgcSecond);
        ectx.fillStyle = grad;
        ectx.fillRect(0, 0, size, size);
    }

    if (bgcMode === 'pattern') {
        bgcDrawPattern(ectx, size, size, bgcPattern, bgcPatternSeed, {
            base: bgcBase, second: bgcSecond, third: bgcThird
        });
    }

    if (bgcTexture !== 'none' && bgcTextureOpacity > 0) {
        bgcGenerateTexture(ectx, size, size, bgcTexture, bgcTextureOpacity / 100, bgcTextureScale / 100);
    }

    // Composite product image
    var img = bgcProductImage.el;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var maxW = size * 0.8, maxH = size * 0.8;
    var scale = Math.min(maxW / iw, maxH / ih, 1);
    var dw = iw * scale, dh = ih * scale;
    var dx = (size - dw) / 2, dy = (size - dh) / 2;
    ectx.drawImage(img, dx, dy, dw, dh);

    exportCanvas.toBlob(function (blob) {
        var link = document.createElement('a');
        link.download = 'product_' + bgcProductImage.name.replace(/\.[^.]+$/, '') + '_' + size + 'x' + size + '.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

// ===== Image Upload =====
function bgcLoadProductImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            bgcProductImage = { el: img, name: file.name, w: img.naturalWidth, h: img.naturalHeight };
            bgcImageInfo.textContent = file.name + ' (' + img.naturalWidth + '×' + img.naturalHeight + ')';
            bgcClearImageBtn.hidden = false;
            bgcApplyBtn.disabled = false;
            bgcApplyBtn.style.opacity = '1';
            bgcRender();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== Init All Listeners =====
function initBgcListeners() {
    // Mode
    bgcModeSelect.addEventListener('change', function () {
        bgcMode = this.value;
        bgcUpdateModeUI();
        bgcDebouncedRender();
    });

    // Color inputs (hex text)
    bgcBaseInput.addEventListener('input', function () {
        if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
            bgcBase = this.value; bgcBaseColor.value = this.value; bgcDebouncedRender();
        }
    });
    bgcSecondInput.addEventListener('input', function () {
        if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
            bgcSecond = this.value; bgcSecondColor.value = this.value; bgcDebouncedRender();
        }
    });
    bgcThirdInput.addEventListener('input', function () {
        if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
            bgcThird = this.value; bgcThirdColor.value = this.value; bgcDebouncedRender();
        }
    });

    // Color pickers
    bgcBaseColor.addEventListener('input', function () {
        bgcBase = this.value; bgcBaseInput.value = this.value; bgcDebouncedRender();
    });
    bgcSecondColor.addEventListener('input', function () {
        bgcSecond = this.value; bgcSecondInput.value = this.value; bgcDebouncedRender();
    });
    bgcThirdColor.addEventListener('input', function () {
        bgcThird = this.value; bgcThirdInput.value = this.value; bgcDebouncedRender();
    });

    // Texture
    bgcTextureSelect.addEventListener('change', function () {
        bgcTexture = this.value; bgcDebouncedRender();
    });
    bgcOpacitySlider.addEventListener('input', function () {
        bgcTextureOpacity = parseInt(this.value);
        bgcOpacityVal.textContent = this.value + '%';
        bgcDebouncedRender();
    });
    bgcScaleSlider.addEventListener('input', function () {
        bgcTextureScale = parseInt(this.value);
        bgcScaleVal.textContent = this.value + '%';
        bgcDebouncedRender();
    });

    // Pattern
    bgcPatternSelect.addEventListener('change', function () {
        bgcPattern = this.value; bgcDebouncedRender();
    });
    bgcRegenerateBtn.addEventListener('click', function () {
        bgcPatternSeed = Math.floor(Math.random() * 100000);
        bgcRender();
    });

    // Gradient angle picker
    var angleDragging = false;
    bgcAnglePicker.addEventListener('mousedown', function (e) {
        angleDragging = true;
        bgcGradientAngle = bgcAngleFromMouse(e, bgcAnglePicker);
        bgcUpdateAngleHandle(bgcGradientAngle);
        bgcDebouncedRender();
    });
    document.addEventListener('mousemove', function (e) {
        if (!angleDragging) return;
        bgcGradientAngle = bgcAngleFromMouse(e, bgcAnglePicker);
        bgcUpdateAngleHandle(bgcGradientAngle);
        bgcDebouncedRender();
    });
    document.addEventListener('mouseup', function () { angleDragging = false; });

    // Touch support for angle picker
    bgcAnglePicker.addEventListener('touchstart', function (e) {
        e.preventDefault(); angleDragging = true;
        var t = e.touches[0];
        bgcGradientAngle = bgcAngleFromMouse(t, bgcAnglePicker);
        bgcUpdateAngleHandle(bgcGradientAngle);
        bgcDebouncedRender();
    });
    document.addEventListener('touchmove', function (e) {
        if (!angleDragging) return;
        var t = e.touches[0];
        bgcGradientAngle = bgcAngleFromMouse(t, bgcAnglePicker);
        bgcUpdateAngleHandle(bgcGradientAngle);
        bgcDebouncedRender();
    });
    document.addEventListener('touchend', function () { angleDragging = false; });

    // Output size
    bgcSizeSelect.addEventListener('change', function () {
        bgcOutputSize = parseInt(this.value);
    });

    // Download / Apply
    bgcDownloadBtn.addEventListener('click', bgcDownload);
    bgcApplyBtn.addEventListener('click', bgcApplyToImage);

    // Image upload
    bgcBrowseLink.addEventListener('click', function (e) { e.preventDefault(); bgcFileInput.click(); });
    bgcFileInput.addEventListener('change', function () {
        if (this.files.length > 0) bgcLoadProductImage(this.files[0]);
        this.value = '';
    });
    bgcDropzone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
    bgcDropzone.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
    bgcDropzone.addEventListener('drop', function (e) {
        e.preventDefault(); this.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) bgcLoadProductImage(e.dataTransfer.files[0]);
    });

    // Clear image
    bgcClearImageBtn.addEventListener('click', function () {
        bgcProductImage = null;
        bgcImageInfo.textContent = 'No product image';
        bgcClearImageBtn.hidden = true;
        bgcApplyBtn.disabled = true;
        bgcApplyBtn.style.opacity = '0.5';
        bgcRender();
    });

    console.log('[BG Creator] ✅ All listeners attached.');
}

// ===== Bootstrap =====
function initBgCreator() {
    initBgcDOM();
    bgcRenderPalettes();
    bgcSyncColorInputs();
    bgcUpdateModeUI();
    bgcUpdateAngleHandle(bgcGradientAngle);
    initBgcListeners();
    bgcRender();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBgCreator);
} else {
    initBgCreator();
}
