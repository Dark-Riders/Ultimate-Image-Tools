// ===== Canvas Interaction: Drag-and-Drop, Hit Detection, Keyboard, Image Upload =====
(function (C) {
    var canvas = C.canvas;
    var ctx = C.ctx;
    var SIZE = C.SIZE;
    var state = C.state;

    // ===== Canvas coordinate conversion =====
    function canvasToLogical(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = SIZE / rect.width;
        var scaleY = SIZE / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }

    // ===== Hit detection =====
    function getHitTarget(mx, my) {
        // Check images (reverse order = top-most first)
        for (var i = state.images.length - 1; i >= 0; i--) {
            var img = state.images[i];
            if (mx >= img.x && mx <= img.x + img.w && my >= img.y && my <= img.y + img.h) {
                return { type: 'image', index: i, obj: img };
            }
        }
        // Check badges
        ctx.font = C.getBadgeFont();
        for (var i = state.badges.length - 1; i >= 0; i--) {
            var b = state.badges[i];
            if (!b.text) continue;
            var label = b.emoji ? b.emoji + ' ' + b.text : b.text;
            var pad = state.badgeSize * 0.7;
            var w = ctx.measureText(label).width + pad * 2;
            var h = state.badgeSize * 2.1;
            if (mx >= b.x && mx <= b.x + w && my >= b.y && my <= b.y + h) {
                return { type: 'badge', index: i, obj: b };
            }
        }
        // Check store name
        if (state.storeName) {
            var fx = C.getStyleFx();
            ctx.font = C.getStoreFont();
            var text = state.storeName.toUpperCase();
            var pad = state.storeSize * 0.9;
            var w = ctx.measureText(text).width + pad * 2;
            var h = state.storeSize * 1.7;
            var sx = state.storeNameX !== null ? state.storeNameX : (SIZE - w) / 2;
            var sy = state.storeNameY !== null ? state.storeNameY : state.thickness * fx.borderExtraThickness + 8;
            if (mx >= sx && mx <= sx + w && my >= sy && my <= sy + h) {
                return { type: 'storeName', obj: { x: sx, y: sy, w: w, h: h } };
            }
        }
        // Check QR code
        if (state.qrImage) {
            var qx = state.qrX !== null ? state.qrX : SIZE - state.qrSize - 20;
            var qy = state.qrY !== null ? state.qrY : SIZE - state.qrSize - 20;
            if (mx >= qx && mx <= qx + state.qrSize && my >= qy && my <= qy + state.qrSize) {
                return { type: 'qr', obj: { x: qx, y: qy } };
            }
        }
        return null;
    }

    // ===== Mouse events =====
    canvas.addEventListener('mousedown', function (e) {
        var pos = canvasToLogical(e);
        var hit = getHitTarget(pos.x, pos.y);
        if (hit) {
            C.pushUndo();
            C.dragTarget = hit;
            C.selectedElement = hit;
            C.dragOffsetX = pos.x - hit.obj.x;
            C.dragOffsetY = pos.y - hit.obj.y;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
        } else {
            C.selectedElement = null;
        }
        C.render();
    });

    canvas.addEventListener('mousemove', function (e) {
        var pos = canvasToLogical(e);
        if (C.dragTarget) {
            var nx = pos.x - C.dragOffsetX;
            var ny = pos.y - C.dragOffsetY;

            // Calculate element dimensions for snap
            var ew = 0, eh = 0;
            if (C.dragTarget.type === 'badge') {
                ctx.font = C.getBadgeFont();
                var b = state.badges[C.dragTarget.index];
                var label = b.emoji ? b.emoji + ' ' + b.text : b.text;
                var pad = state.badgeSize * 0.7;
                ew = ctx.measureText(label).width + pad * 2;
                eh = state.badgeSize * 2.1;
            } else if (C.dragTarget.type === 'image') {
                var img = state.images[C.dragTarget.index];
                ew = img.w; eh = img.h;
            } else if (C.dragTarget.type === 'storeName') {
                ctx.font = C.getStoreFont();
                var text = state.storeName.toUpperCase();
                var pad = state.storeSize * 0.9;
                ew = ctx.measureText(text).width + pad * 2;
                eh = state.storeSize * 1.7;
            } else if (C.dragTarget.type === 'qr') {
                ew = state.qrSize; eh = state.qrSize;
            }

            // Snap logic
            C.snapGuides = [];
            var cx = nx + ew / 2, cy = ny + eh / 2;
            var mid = SIZE / 2;

            if (Math.abs(cx - mid) < C.SNAP_THRESHOLD) { nx = mid - ew / 2; C.snapGuides.push({ axis: 'v', pos: mid }); }
            if (Math.abs(cy - mid) < C.SNAP_THRESHOLD) { ny = mid - eh / 2; C.snapGuides.push({ axis: 'h', pos: mid }); }
            if (Math.abs(nx) < C.SNAP_THRESHOLD) { nx = 0; C.snapGuides.push({ axis: 'v', pos: 0 }); }
            if (Math.abs(nx + ew - SIZE) < C.SNAP_THRESHOLD) { nx = SIZE - ew; C.snapGuides.push({ axis: 'v', pos: SIZE }); }
            if (Math.abs(ny) < C.SNAP_THRESHOLD) { ny = 0; C.snapGuides.push({ axis: 'h', pos: 0 }); }
            if (Math.abs(ny + eh - SIZE) < C.SNAP_THRESHOLD) { ny = SIZE - eh; C.snapGuides.push({ axis: 'h', pos: SIZE }); }

            if (C.dragTarget.type === 'badge') {
                state.badges[C.dragTarget.index].x = nx;
                state.badges[C.dragTarget.index].y = ny;
            } else if (C.dragTarget.type === 'image') {
                state.images[C.dragTarget.index].x = nx;
                state.images[C.dragTarget.index].y = ny;
            } else if (C.dragTarget.type === 'storeName') {
                state.storeNameX = nx;
                state.storeNameY = ny;
            } else if (C.dragTarget.type === 'qr') {
                state.qrX = nx;
                state.qrY = ny;
            }
            C.render();
        } else {
            canvas.style.cursor = getHitTarget(pos.x, pos.y) ? 'grab' : 'default';
        }
    });

    canvas.addEventListener('mouseup', function () {
        if (C.dragTarget) {
            C.dragTarget = null;
            C.snapGuides = [];
            canvas.style.cursor = 'grab';
            C.render();
        }
    });

    canvas.addEventListener('mouseleave', function () {
        if (C.dragTarget) { C.dragTarget = null; C.snapGuides = []; canvas.style.cursor = 'default'; C.render(); }
    });

    // ===== Keyboard: Delete + Undo/Redo =====
    document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        // Undo: Ctrl+Z
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            if (C.undoStack.length > 0) {
                C.redoStack.push(C.getCreatorSnapshot());
                C.applySnapshot(C.undoStack.pop());
            }
            e.preventDefault();
            return;
        }
        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z'))) {
            if (C.redoStack.length > 0) {
                C.undoStack.push(C.getCreatorSnapshot());
                C.applySnapshot(C.redoStack.pop());
            }
            e.preventDefault();
            return;
        }

        // Delete selected element
        if (!C.selectedElement) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
            C.pushUndo();
            if (C.selectedElement.type === 'badge') {
                state.badges.splice(C.selectedElement.index, 1);
                C.renderBadgeControls();
            } else if (C.selectedElement.type === 'image') {
                state.images.splice(C.selectedElement.index, 1);
                C.renderImageList();
            } else if (C.selectedElement.type === 'storeName') {
                state.storeNameX = null;
                state.storeNameY = null;
            } else if (C.selectedElement.type === 'qr') {
                state.qrUrl = '';
                state.qrImage = null;
            }
            C.selectedElement = null;
            C.render();
            e.preventDefault();
        }
    });

    // ===== Custom Image Upload =====
    var imageUploadInput = document.getElementById('image-upload');
    var imageListEl = document.getElementById('image-list');

    imageUploadInput.addEventListener('change', function (e) {
        Array.from(e.target.files).forEach(function (file) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                var img = new Image();
                img.onload = function () {
                    var maxDim = 150;
                    var w = img.width, h = img.height;
                    if (w > h) { h = (h / w) * maxDim; w = maxDim; }
                    else { w = (w / h) * maxDim; h = maxDim; }
                    state.images.push({ el: img, x: SIZE / 2 - w / 2, y: SIZE / 2 - h / 2, w: w, h: h, baseW: w, baseH: h, scale: 100, opacity: 100, name: file.name, src: ev.target.result });
                    C.renderImageList();
                    C.render();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    });

    C.renderImageList = function () {
        imageListEl.innerHTML = '';
        state.images.forEach(function (img, i) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:6px 0;border-bottom:1px solid var(--border)';
            row.innerHTML =
                '<div style="display:flex;align-items:center;gap:6px">' +
                    '<span style="flex:1;font-size:11px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (img.name || 'Image ' + (i + 1)) + '</span>' +
                    '<span class="img-scale-val" style="font-size:10px;color:var(--text-muted);min-width:32px;text-align:right">' + img.scale + '%</span>' +
                    '<button class="badge-remove img-del" title="Remove">✕</button>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:4px">' +
                    '<span style="font-size:10px;color:var(--text-muted);min-width:30px">Size</span>' +
                    '<input type="range" class="img-scale" min="10" max="500" value="' + img.scale + '" style="flex:1;accent-color:var(--primary)">' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:4px">' +
                    '<span style="font-size:10px;color:var(--text-muted);min-width:30px">Op.</span>' +
                    '<input type="range" class="img-opacity" min="5" max="100" value="' + (img.opacity !== undefined ? img.opacity : 100) + '" style="flex:1;accent-color:var(--primary)">' +
                    '<span class="img-opacity-val" style="font-size:10px;color:var(--text-muted);min-width:25px;text-align:right">' + (img.opacity !== undefined ? img.opacity : 100) + '%</span>' +
                '</div>';
            row.querySelector('.img-scale').addEventListener('input', function (e) {
                var s = parseInt(e.target.value);
                state.images[i].scale = s;
                state.images[i].w = state.images[i].baseW * s / 100;
                state.images[i].h = state.images[i].baseH * s / 100;
                row.querySelector('.img-scale-val').textContent = s + '%';
                C.render();
            });
            row.querySelector('.img-opacity').addEventListener('input', function (e) {
                var o = parseInt(e.target.value);
                state.images[i].opacity = o;
                row.querySelector('.img-opacity-val').textContent = o + '%';
                C.render();
            });
            row.querySelector('.img-del').addEventListener('click', function () { state.images.splice(i, 1); C.renderImageList(); C.render(); });
            imageListEl.appendChild(row);
        });
    };

})(window.Creator);
