// ===== Creator Controls: All DOM event listeners & initialization =====
(function (C) {
    var canvas = C.canvas;
    var SIZE = C.SIZE;
    var state = C.state;

    // ===== DOM Refs =====
    var color1Input = document.getElementById('cr-color1');
    var color2Input = document.getElementById('cr-color2');
    var accentInput = document.getElementById('cr-accent');
    var thicknessInput = document.getElementById('cr-thickness');
    var thicknessVal = document.getElementById('cr-thickness-val');
    var storeNameInput = document.getElementById('cr-store-name');
    var visualStyleSelect = document.getElementById('cr-visual-style');
    var btnExport = document.getElementById('btn-export');
    var btnAddBadge = document.getElementById('btn-add-badge');
    var badgeListEl = document.getElementById('badge-list');
    var badgePresetsEl = document.getElementById('badge-presets');

    // Typography DOM
    var badgeFontSelect = document.getElementById('cr-badge-font');
    var badgeBoldBtn = document.getElementById('cr-badge-bold');
    var badgeItalicBtn = document.getElementById('cr-badge-italic');
    var badgeSizeInput = document.getElementById('cr-badge-size');
    var badgeSizeVal = document.getElementById('cr-badge-size-val');
    var storeFontSelect = document.getElementById('cr-store-font');
    var storeBoldBtn = document.getElementById('cr-store-bold');
    var storeItalicBtn = document.getElementById('cr-store-italic');
    var storeSizeInput = document.getElementById('cr-store-size');
    var storeSizeVal = document.getElementById('cr-store-size-val');
    var diagFontSelect = document.getElementById('cr-diag-font');
    var diagBoldBtn = document.getElementById('cr-diag-bold');
    var diagItalicBtn = document.getElementById('cr-diag-italic');

    // ===== Populate Font Selects =====
    function populateFontSelects() {
        [badgeFontSelect, storeFontSelect, diagFontSelect].forEach(function (sel) {
            sel.innerHTML = '';
            C.FONT_LIST.forEach(function (f) {
                var opt = document.createElement('option');
                opt.value = f;
                opt.textContent = f;
                opt.style.fontFamily = "'" + f + "', sans-serif";
                sel.appendChild(opt);
            });
        });
        badgeFontSelect.value = state.badgeFont;
        storeFontSelect.value = state.storeFont;
        diagFontSelect.value = state.diagFont || 'Inter';
    }
    populateFontSelects();

    // ===== syncUIFromState =====
    C.syncUIFromState = function () {
        color1Input.value = state.color1;
        color2Input.value = state.color2;
        accentInput.value = state.accent;
        thicknessInput.value = state.thickness;
        thicknessVal.textContent = state.thickness;
        storeNameInput.value = state.storeName;
        var cpEl = document.getElementById('cr-canvas-preset');
        if (cpEl) cpEl.value = state.canvasPreset || '1:1';
        var cwEl = document.getElementById('cr-canvas-w');
        if (cwEl) cwEl.value = state.canvasW || 1000;
        var chEl = document.getElementById('cr-canvas-h');
        if (chEl) chEl.value = state.canvasH || 1000;
        var ccWrap = document.getElementById('cr-canvas-custom');
        if (ccWrap) ccWrap.style.display = (state.canvasPreset === 'custom') ? 'flex' : 'none';
        var sbgEl = document.getElementById('cr-store-bg');
        if (sbgEl) sbgEl.checked = state.storeBg !== false;
        var sbgcEl = document.getElementById('cr-store-bg-color');
        if (sbgcEl) sbgcEl.value = state.storeBgColor || state.accent;
        var sbgsEl = document.getElementById('cr-store-bg-shape');
        if (sbgsEl) sbgsEl.value = state.storeBgShape || 'rounded';
        var shapeEl = document.getElementById('cr-badge-shape');
        if (shapeEl) shapeEl.value = state.badgeShape || 'rounded';
        var qrEl = document.getElementById('cr-qr-url');
        if (qrEl) qrEl.value = state.qrUrl || '';
        var qrSzEl = document.getElementById('cr-qr-size');
        if (qrSzEl) { qrSzEl.value = state.qrSize; document.getElementById('cr-qr-size-val').textContent = state.qrSize; }
        var qrFgEl = document.getElementById('cr-qr-fg');
        if (qrFgEl) qrFgEl.value = state.qrFg;
        var qrBgEl = document.getElementById('cr-qr-bg');
        if (qrBgEl) qrBgEl.value = state.qrBg;
        var dtEl = document.getElementById('cr-diag-text');
        if (dtEl) dtEl.value = state.diagText || '';
        var doEl = document.getElementById('cr-diag-opacity');
        if (doEl) { doEl.value = state.diagOpacity; document.getElementById('cr-diag-opacity-val').textContent = state.diagOpacity; }
        var dsEl = document.getElementById('cr-diag-size');
        if (dsEl) { dsEl.value = state.diagSize; document.getElementById('cr-diag-size-val').textContent = state.diagSize; }
        var daEl = document.getElementById('cr-diag-angle');
        if (daEl) daEl.value = state.diagAngle;
        var dcEl = document.getElementById('cr-diag-color');
        if (dcEl) dcEl.value = state.diagColor;
        var dfEl = document.getElementById('cr-diag-fill');
        if (dfEl) dfEl.checked = state.diagFill !== false;
        var dolEl = document.getElementById('cr-diag-outline');
        if (dolEl) { dolEl.value = state.diagOutline || 0; var v = document.getElementById('cr-diag-outline-val'); if (v) v.textContent = state.diagOutline || 0; }
        var docEl = document.getElementById('cr-diag-outline-color');
        if (docEl) docEl.value = state.diagOutlineColor || '#000000';
        var dosEl = document.getElementById('cr-diag-outline-size');
        if (dosEl) { dosEl.value = state.diagOutlineSize || 32; var v = document.getElementById('cr-diag-outline-size-val'); if (v) v.textContent = state.diagOutlineSize || 32; }
        if (diagFontSelect) diagFontSelect.value = state.diagFont || 'Inter';
        if (diagBoldBtn) diagBoldBtn.classList.toggle('active', state.diagBold !== false);
        if (diagItalicBtn) diagItalicBtn.classList.toggle('active', !!state.diagItalic);
        var dspEl = document.getElementById('cr-diag-spacing');
        if (dspEl) { dspEl.value = state.diagSpacing || 5; var v = document.getElementById('cr-diag-spacing-val'); if (v) v.textContent = state.diagSpacing || 5; }
        C.renderBadgeControls();
        C.renderImageList();
    };

    // ===== Canvas size preset =====
    var canvasPresetSelect = document.getElementById('cr-canvas-preset');
    var canvasCustomWrap = document.getElementById('cr-canvas-custom');
    var canvasWInput = document.getElementById('cr-canvas-w');
    var canvasHInput = document.getElementById('cr-canvas-h');
    var CANVAS_PRESETS = { '1:1': [1000, 1000], '3:4': [750, 1000], '4:3': [1000, 750] };

    canvasPresetSelect.addEventListener('change', function () {
        var v = canvasPresetSelect.value;
        if (v === 'custom') { canvasCustomWrap.style.display = 'flex'; state.canvasPreset = 'custom'; }
        else {
            canvasCustomWrap.style.display = 'none'; state.canvasPreset = v;
            var wh = CANVAS_PRESETS[v]; state.canvasW = wh[0]; state.canvasH = wh[1];
            canvasWInput.value = wh[0]; canvasHInput.value = wh[1];
        }
        C.render();
    });
    canvasWInput.addEventListener('change', function () {
        state.canvasW = Math.max(100, Math.min(4000, parseInt(canvasWInput.value) || 1000));
        canvasWInput.value = state.canvasW; C.render();
    });
    canvasHInput.addEventListener('change', function () {
        state.canvasH = Math.max(100, Math.min(4000, parseInt(canvasHInput.value) || 1000));
        canvasHInput.value = state.canvasH; C.render();
    });

    // ===== Visual style =====
    visualStyleSelect.addEventListener('change', function (e) { state.visualStyle = e.target.value; C.render(); });

    // ===== Border style =====
    var noBorderBtn = document.getElementById('btn-no-border');
    noBorderBtn.addEventListener('click', function () {
        document.querySelectorAll('#border-style-grid .style-card').forEach(function (b) { b.classList.remove('active'); });
        noBorderBtn.style.background = 'var(--accent)'; noBorderBtn.style.color = 'white'; noBorderBtn.style.borderColor = 'var(--border)';
        state.style = 'none'; C.render();
    });
    document.querySelectorAll('#border-style-grid .style-card').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#border-style-grid .style-card').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            noBorderBtn.style.background = 'var(--bg-secondary)'; noBorderBtn.style.color = 'var(--text-secondary)';
            state.style = btn.dataset.style; C.render();
        });
    });

    // ===== Fill mode =====
    document.querySelectorAll('.fill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.fill-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active'); state.fillMode = btn.dataset.fill; C.render();
        });
    });

    // ===== Colors =====
    var paletteSelect = document.getElementById('cr-palette');
    color1Input.addEventListener('input', function (e) { state.color1 = e.target.value; paletteSelect.value = ''; C.render(); });
    color2Input.addEventListener('input', function (e) { state.color2 = e.target.value; paletteSelect.value = ''; C.render(); });
    accentInput.addEventListener('input', function (e) { state.accent = e.target.value; paletteSelect.value = ''; C.render(); });

    // ===== Color Palette =====
    C.COLOR_PALETTES.forEach(function (p, i) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = '■ ' + p.name;
        opt.style.cssText = 'color:' + p.c1 + ';background:linear-gradient(90deg,' + p.c1 + ' 33%,' + p.c2 + ' 33%,' + p.c2 + ' 66%,' + p.ac + ' 66%)';
        paletteSelect.appendChild(opt);
    });
    paletteSelect.addEventListener('change', function (e) {
        if (e.target.value === '') return;
        var p = C.COLOR_PALETTES[parseInt(e.target.value)];
        state.color1 = p.c1; state.color2 = p.c2; state.accent = p.ac;
        color1Input.value = p.c1; color2Input.value = p.c2; accentInput.value = p.ac;
        C.render();
    });

    // ===== Thickness =====
    thicknessInput.addEventListener('input', function (e) {
        state.thickness = parseInt(e.target.value); thicknessVal.textContent = state.thickness; C.render();
    });

    // ===== Store name =====
    storeNameInput.addEventListener('input', function (e) { state.storeName = e.target.value; C.render(); });
    var storeBgCheck = document.getElementById('cr-store-bg');
    var storeBgColorInput = document.getElementById('cr-store-bg-color');
    var storeBgShapeSelect = document.getElementById('cr-store-bg-shape');
    if (storeBgCheck) storeBgCheck.addEventListener('change', function () { state.storeBg = storeBgCheck.checked; C.render(); });
    if (storeBgColorInput) storeBgColorInput.addEventListener('input', function (e) { state.storeBgColor = e.target.value; C.render(); });
    if (storeBgShapeSelect) storeBgShapeSelect.addEventListener('change', function (e) { state.storeBgShape = e.target.value; C.render(); });

    // ===== Badge typography =====
    badgeFontSelect.addEventListener('change', function (e) { state.badgeFont = e.target.value; C.render(); });
    badgeSizeInput.addEventListener('input', function (e) { state.badgeSize = parseInt(e.target.value); badgeSizeVal.textContent = state.badgeSize; C.render(); });
    badgeBoldBtn.addEventListener('click', function () { state.badgeBold = !state.badgeBold; badgeBoldBtn.classList.toggle('active', state.badgeBold); C.render(); });
    badgeItalicBtn.addEventListener('click', function () { state.badgeItalic = !state.badgeItalic; badgeItalicBtn.classList.toggle('active', state.badgeItalic); C.render(); });

    // ===== Store name typography =====
    storeFontSelect.addEventListener('change', function (e) { state.storeFont = e.target.value; C.render(); });
    storeSizeInput.addEventListener('input', function (e) { state.storeSize = parseInt(e.target.value); storeSizeVal.textContent = state.storeSize; C.render(); });
    storeBoldBtn.addEventListener('click', function () { state.storeBold = !state.storeBold; storeBoldBtn.classList.toggle('active', state.storeBold); C.render(); });
    storeItalicBtn.addEventListener('click', function () { state.storeItalic = !state.storeItalic; storeItalicBtn.classList.toggle('active', state.storeItalic); C.render(); });

    // ===== Export =====
    var exportFormatSelect = document.getElementById('cr-export-format');
    var exportQualityInput = document.getElementById('cr-export-quality');
    var exportQualityVal = document.getElementById('cr-export-quality-val');
    var qualityWrap = document.getElementById('cr-quality-wrap');

    exportFormatSelect.addEventListener('change', function () {
        var fmt = exportFormatSelect.value;
        if (fmt === 'png') { qualityWrap.hidden = true; }
        else { qualityWrap.hidden = false; qualityWrap.style.display = 'flex'; }
    });
    exportQualityInput.addEventListener('input', function () { exportQualityVal.textContent = exportQualityInput.value + '%'; });

    btnExport.addEventListener('click', function () {
        var fmt = exportFormatSelect.value;
        var quality = parseInt(exportQualityInput.value) / 100;
        var mimeTypes = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
        var exts = { png: '.png', jpeg: '.jpg', webp: '.webp' };
        var mime = mimeTypes[fmt], ext = exts[fmt];
        var link = document.createElement('a');
        var baseName = state.storeName ? state.storeName.toLowerCase().replace(/\s+/g, '_') + '_watermark' : 'watermark';
        link.download = baseName + ext;

        var ew = state.canvasW, eh = state.canvasH;
        var ratio = ew / eh;
        var srcX, srcY, srcW, srcH;
        if (ratio >= 1) { srcW = SIZE; srcH = SIZE / ratio; srcX = 0; srcY = (SIZE - srcH) / 2; }
        else { srcH = SIZE; srcW = SIZE * ratio; srcX = (SIZE - srcW) / 2; srcY = 0; }
        var expCanvas = document.createElement('canvas');
        expCanvas.width = ew; expCanvas.height = eh;
        var expCtx = expCanvas.getContext('2d');
        expCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, ew, eh);
        link.href = fmt === 'png' ? expCanvas.toDataURL(mime) : expCanvas.toDataURL(mime, quality);
        link.click();
    });

    // ===== Badge Management =====
    btnAddBadge.addEventListener('click', function () {
        state.badges.push({ emoji: '', text: '', color: '#d62828', x: 10, y: SIZE - 50 });
        C.renderBadgeControls(); C.render();
    });

    function addPresetBadge(preset) {
        var pos = C.positionToXY(preset.position);
        state.badges.push({ emoji: preset.emoji, text: preset.text, color: preset.color, x: pos.x, y: pos.y });
        C.renderBadgeControls(); C.render();
    }

    function renderPresetButtons() {
        badgePresetsEl.innerHTML = '';
        C.BADGE_PRESETS.forEach(function (preset) {
            var btn = document.createElement('button');
            btn.className = 'preset-badge-btn';
            btn.style.background = preset.color;
            btn.textContent = preset.emoji + ' ' + preset.text;
            btn.title = 'Add "' + preset.text + '" badge';
            btn.addEventListener('click', function () { addPresetBadge(preset); });
            badgePresetsEl.appendChild(btn);
        });
    }
    renderPresetButtons();

    C.renderBadgeControls = function () {
        badgeListEl.innerHTML = '';
        state.badges.forEach(function (badge, i) {
            var row = document.createElement('div');
            row.className = 'badge-row';
            row.innerHTML =
                '<input type="text" class="badge-emoji-input" value="' + badge.emoji + '" title="Emoji" maxlength="4">' +
                '<input type="text" class="badge-text-input" value="' + badge.text + '" placeholder="Badge text">' +
                '<input type="color" class="badge-color-input" value="' + badge.color + '" title="Badge color">' +
                '<button class="badge-remove" title="Remove">✕</button>';
            row.querySelector('.badge-emoji-input').addEventListener('input', function (e) { state.badges[i].emoji = e.target.value; C.render(); });
            row.querySelector('.badge-text-input').addEventListener('input', function (e) { state.badges[i].text = e.target.value; C.render(); });
            row.querySelector('.badge-color-input').addEventListener('input', function (e) { state.badges[i].color = e.target.value; C.render(); });
            row.querySelector('.badge-remove').addEventListener('click', function () { state.badges.splice(i, 1); C.renderBadgeControls(); C.render(); });
            badgeListEl.appendChild(row);
        });
    };

    // ===== Border Transform Controls =====
    document.querySelectorAll('[data-rotate]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-rotate]').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state.borderRotate = parseInt(btn.dataset.rotate); C.render();
        });
    });
    var flipHBtn = document.getElementById('flip-h-btn');
    if (flipHBtn) flipHBtn.addEventListener('click', function () { state.borderFlipH = !state.borderFlipH; this.classList.toggle('active'); C.render(); });
    var flipVBtn = document.getElementById('flip-v-btn');
    if (flipVBtn) flipVBtn.addEventListener('click', function () { state.borderFlipV = !state.borderFlipV; this.classList.toggle('active'); C.render(); });

    // ===== QR Code Controls =====
    var qrUrlInput = document.getElementById('cr-qr-url');
    var qrSizeInput = document.getElementById('cr-qr-size');
    var qrSizeValEl = document.getElementById('cr-qr-size-val');
    var qrFgInput = document.getElementById('cr-qr-fg');
    var qrBgInput = document.getElementById('cr-qr-bg');

    var qrDebounce;
    qrUrlInput.addEventListener('input', function (e) { state.qrUrl = e.target.value; clearTimeout(qrDebounce); qrDebounce = setTimeout(C.generateQR, 300); });
    qrSizeInput.addEventListener('input', function (e) { state.qrSize = parseInt(e.target.value); qrSizeValEl.textContent = state.qrSize; C.render(); });
    qrFgInput.addEventListener('input', function (e) { state.qrFg = e.target.value; C.generateQR(); });
    qrBgInput.addEventListener('input', function (e) { state.qrBg = e.target.value; C.generateQR(); });

    // ===== Diagonal Text Controls =====
    var diagTextInput = document.getElementById('cr-diag-text');
    var diagOpacityInput = document.getElementById('cr-diag-opacity');
    var diagOpacityVal = document.getElementById('cr-diag-opacity-val');
    var diagSizeInput = document.getElementById('cr-diag-size');
    var diagSizeValEl = document.getElementById('cr-diag-size-val');
    var diagAngleSelect = document.getElementById('cr-diag-angle');
    var diagColorInput = document.getElementById('cr-diag-color');

    diagTextInput.addEventListener('input', function (e) { state.diagText = e.target.value; C.render(); });
    diagOpacityInput.addEventListener('input', function (e) { state.diagOpacity = parseInt(e.target.value); diagOpacityVal.textContent = state.diagOpacity; C.render(); });
    diagSizeInput.addEventListener('input', function (e) { state.diagSize = parseInt(e.target.value); diagSizeValEl.textContent = state.diagSize; C.render(); });
    diagAngleSelect.addEventListener('change', function (e) { state.diagAngle = parseInt(e.target.value); C.render(); });
    diagColorInput.addEventListener('input', function (e) { state.diagColor = e.target.value; C.render(); });

    // Diagonal text spacing
    var diagSpacingInput = document.getElementById('cr-diag-spacing');
    var diagSpacingValEl = document.getElementById('cr-diag-spacing-val');
    diagSpacingInput.addEventListener('input', function (e) { state.diagSpacing = parseInt(e.target.value); diagSpacingValEl.textContent = state.diagSpacing; C.render(); });

    // Diagonal text font
    diagFontSelect.addEventListener('change', function (e) { state.diagFont = e.target.value; C.render(); });
    diagBoldBtn.addEventListener('click', function () { state.diagBold = !state.diagBold; diagBoldBtn.classList.toggle('active', state.diagBold); C.render(); });
    diagItalicBtn.addEventListener('click', function () { state.diagItalic = !state.diagItalic; diagItalicBtn.classList.toggle('active', state.diagItalic); C.render(); });

    // Diagonal text fill & outline
    var diagFillCheck = document.getElementById('cr-diag-fill');
    var diagOutlineInput = document.getElementById('cr-diag-outline');
    var diagOutlineValEl = document.getElementById('cr-diag-outline-val');
    var diagOutlineColorInput = document.getElementById('cr-diag-outline-color');
    var diagOutlineSizeInput = document.getElementById('cr-diag-outline-size');
    var diagOutlineSizeValEl = document.getElementById('cr-diag-outline-size-val');

    if (diagFillCheck) diagFillCheck.addEventListener('change', function () { state.diagFill = diagFillCheck.checked; C.render(); });
    if (diagOutlineInput) diagOutlineInput.addEventListener('input', function (e) { state.diagOutline = parseInt(e.target.value); diagOutlineValEl.textContent = state.diagOutline; C.render(); });
    if (diagOutlineColorInput) diagOutlineColorInput.addEventListener('input', function (e) { state.diagOutlineColor = e.target.value; C.render(); });
    if (diagOutlineSizeInput) diagOutlineSizeInput.addEventListener('input', function (e) { state.diagOutlineSize = parseInt(e.target.value); diagOutlineSizeValEl.textContent = state.diagOutlineSize; C.render(); });

    // Badge shape
    document.getElementById('cr-badge-shape').addEventListener('change', function (e) { C.pushUndo(); state.badgeShape = e.target.value; C.render(); });

    // ===== Templates =====
    var TEMPLATES_KEY = 'wm-creator-templates';
    var tplNameInput = document.getElementById('cr-tpl-name');
    var tplList = document.getElementById('cr-tpl-list');

    function getTemplates() { try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}'); } catch (e) { return {}; } }
    function saveTemplates(tpls) { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(tpls)); }

    function getTemplateSnapshot() {
        return JSON.parse(JSON.stringify(state, function (key, val) {
            if (key === 'el' || key === 'qrImage') return undefined; return val;
        }));
    }

    function refreshTemplateList() {
        var tpls = getTemplates();
        tplList.innerHTML = '<option value="">— Select template —</option>';
        Object.keys(tpls).sort().forEach(function (name) {
            var opt = document.createElement('option'); opt.value = name; opt.textContent = name; tplList.appendChild(opt);
        });
    }
    refreshTemplateList();

    function loadTemplateImages(snap, callback) {
        if (snap.images && snap.images.length > 0) {
            state.images = [];
            var loaded = 0;
            snap.images.forEach(function (si, idx) {
                if (si.src) {
                    var img = new Image();
                    img.onload = function () {
                        state.images[idx] = Object.assign({}, si, { el: img });
                        loaded++;
                        if (loaded === snap.images.length) callback();
                    };
                    img.src = si.src;
                } else {
                    state.images[idx] = si;
                    loaded++;
                    if (loaded === snap.images.length) callback();
                }
            });
        } else {
            state.images = [];
            callback();
        }
    }

    function applyTemplateSnap(snap) {
        Object.keys(snap).forEach(function (k) { if (k !== 'images' && k !== 'qrImage') state[k] = snap[k]; });
        if (state.qrUrl) C.generateQR(); else state.qrImage = null;
        C.syncUIFromState();
        C.render();
    }

    document.getElementById('btn-tpl-save').addEventListener('click', function () {
        var name = tplNameInput.value.trim();
        if (!name) { alert('Enter a template name'); return; }
        var tpls = getTemplates();
        tpls[name] = getTemplateSnapshot();
        saveTemplates(tpls);
        refreshTemplateList();
        tplList.value = name;
        tplNameInput.value = '';
    });

    document.getElementById('btn-tpl-load').addEventListener('click', function () {
        var name = tplList.value;
        if (!name) { alert('Select a template first'); return; }
        var tpls = getTemplates();
        if (!tpls[name]) return;
        C.pushUndo();
        var snap = tpls[name];
        loadTemplateImages(snap, function () { applyTemplateSnap(snap); });
    });

    document.getElementById('btn-tpl-delete').addEventListener('click', function () {
        var name = tplList.value;
        if (!name) return;
        if (!confirm('Delete template "' + name + '"?')) return;
        var tpls = getTemplates();
        delete tpls[name];
        saveTemplates(tpls);
        refreshTemplateList();
    });

    document.getElementById('btn-tpl-export').addEventListener('click', function () {
        var snap = getTemplateSnapshot();
        var blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.download = 'watermark-template-' + Date.now() + '.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    });

    document.getElementById('tpl-import').addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            try {
                var snap = JSON.parse(ev.target.result);
                C.pushUndo();
                loadTemplateImages(snap, function () { applyTemplateSnap(snap); });
            } catch (err) { alert('Invalid template file'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ===== Initial render =====
    C.render();

})(window.Creator);
