// ===== Render & Drawing Functions =====
(function (C) {
    var ctx = C.ctx;
    var canvas = C.canvas;
    var SIZE = C.SIZE;
    var state = C.state;

    // ===== Border dispatch map =====
    var borderDrawFns = {
        simple: 'drawSimple', double: 'drawDouble', angular: 'drawAngular',
        corners: 'drawCorners', layered: 'drawLayered', bracket: 'drawBracket',
        rounded: 'drawRounded', inset: 'drawInset',
        wavy: 'drawWavy', scalloped: 'drawScalloped', zigzag: 'drawZigzag',
        dotted: 'drawDotted', filmstrip: 'drawFilmstrip', ticket: 'drawTicket',
        chain: 'drawChain', crossStitch: 'drawCrossStitch',
        arrow: 'drawArrow', rope: 'drawRope', network: 'drawNetwork',
        geoBlocks: 'drawGeoBlocks', bubbles: 'drawBubbles', mosaic: 'drawMosaic',
        floral: 'drawFloral', pixelArt: 'drawPixelArt', confetti: 'drawConfetti',
        woven: 'drawWoven', circuit: 'drawCircuit',
        starBurst: 'drawStarBurst', hearts: 'drawHearts', leaves: 'drawLeaves',
        lightning: 'drawLightning', waves3D: 'drawWaves3D', triangles: 'drawTriangles',
        spiral: 'drawSpiral', dna: 'drawDna', barcode: 'drawBarcode',
        gradientFade: 'drawGradientFade', honeycomb: 'drawHoneycomb',
        splatter: 'drawSplatter', ribbon: 'drawRibbon',
    };

    // ===== Main Render =====
    C.render = function () {
        ctx.clearRect(0, 0, SIZE, SIZE);
        var fx = C.getStyleFx();

        if (state.style !== 'none') {
            var fnName = borderDrawFns[state.style] || 'drawSimple';
            C.applyBorderEffects(C[fnName]);
        }

        if (fx.retroOverlay) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(255,248,220,0.15)';
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.restore();
        }

        if (state.diagText) drawDiagonalText();

        drawCustomImages();
        drawAllBadges();
        if (state.storeName) drawStoreName();
        if (state.qrImage) drawQRCode();

        // Draw crop overlay for non-square canvas presets
        var cRatio = state.canvasW / state.canvasH;
        if (Math.abs(cRatio - 1) > 0.01) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            if (cRatio > 1) {
                var cropH = SIZE / cRatio;
                var cropY = (SIZE - cropH) / 2;
                ctx.fillRect(0, 0, SIZE, cropY);
                ctx.fillRect(0, cropY + cropH, SIZE, cropY);
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(0, cropY); ctx.lineTo(SIZE, cropY);
                ctx.moveTo(0, cropY + cropH); ctx.lineTo(SIZE, cropY + cropH);
                ctx.stroke(); ctx.setLineDash([]);
            } else {
                var cropW = SIZE * cRatio;
                var cropX = (SIZE - cropW) / 2;
                ctx.fillRect(0, 0, cropX, SIZE);
                ctx.fillRect(cropX + cropW, 0, cropX, SIZE);
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(cropX, 0); ctx.lineTo(cropX, SIZE);
                ctx.moveTo(cropX + cropW, 0); ctx.lineTo(cropX + cropW, SIZE);
                ctx.stroke(); ctx.setLineDash([]);
            }
            ctx.restore();
        }

        // Draw selection highlight
        if (C.selectedElement) {
            var sx, sy, sw, sh;
            if (C.selectedElement.type === 'badge') {
                var b = state.badges[C.selectedElement.index];
                if (b) {
                    ctx.font = C.getBadgeFont();
                    var label = b.emoji ? b.emoji + ' ' + b.text : b.text;
                    var pad = state.badgeSize * 0.7;
                    sw = ctx.measureText(label).width + pad * 2;
                    sh = state.badgeSize * 2.1;
                    sx = b.x; sy = b.y;
                }
            } else if (C.selectedElement.type === 'image') {
                var img = state.images[C.selectedElement.index];
                if (img) { sx = img.x; sy = img.y; sw = img.w; sh = img.h; }
            } else if (C.selectedElement.type === 'storeName') {
                var fx2 = C.getStyleFx();
                ctx.font = C.getStoreFont();
                var text = state.storeName.toUpperCase();
                var pad = state.storeSize * 0.9;
                sw = ctx.measureText(text).width + pad * 2;
                sh = state.storeSize * 1.7;
                sx = state.storeNameX !== null ? state.storeNameX : (SIZE - sw) / 2;
                sy = state.storeNameY !== null ? state.storeNameY : state.thickness * fx2.borderExtraThickness + 8;
            } else if (C.selectedElement.type === 'qr' && state.qrImage) {
                sx = state.qrX !== null ? state.qrX : SIZE - state.qrSize - 20;
                sy = state.qrY !== null ? state.qrY : SIZE - state.qrSize - 20;
                sw = state.qrSize; sh = state.qrSize;
            }
            if (sx !== undefined) {
                ctx.save();
                ctx.strokeStyle = '#4dabf7'; ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.strokeRect(sx - 3, sy - 3, sw + 6, sh + 6);
                ctx.setLineDash([]);
                ctx.restore();
            }
        }

        // Draw snap guides
        if (C.snapGuides.length > 0) {
            ctx.save();
            ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            C.snapGuides.forEach(function (g) {
                ctx.beginPath();
                if (g.axis === 'v') { ctx.moveTo(g.pos, 0); ctx.lineTo(g.pos, SIZE); }
                else { ctx.moveTo(0, g.pos); ctx.lineTo(SIZE, g.pos); }
                ctx.stroke();
            });
            ctx.setLineDash([]);
            ctx.restore();
        }
    };

    // ===== Draw Custom Images =====
    function drawCustomImages() {
        state.images.forEach(function (img) {
            if (!img.el) return;
            ctx.save();
            ctx.globalAlpha = (img.opacity !== undefined ? img.opacity : 100) / 100;
            ctx.drawImage(img.el, img.x, img.y, img.w, img.h);
            ctx.restore();
        });
    }

    // ===== Styled Badges =====
    function drawAllBadges() {
        state.badges.forEach(function (badge) {
            if (!badge.text) return;
            var label = badge.emoji ? badge.emoji + ' ' + badge.text : badge.text;
            drawBadgeAt(label, badge.color, badge.x, badge.y);
        });
    }

    function drawBadgeAt(text, bgColor, bx, by) {
        var fx = C.getStyleFx();
        var fontSize = state.badgeSize;
        ctx.font = C.getBadgeFont();
        var metrics = ctx.measureText(text);
        var pad = fontSize * 0.7;
        var shape = state.badgeShape || 'rounded';

        var w, h;
        if (shape === 'circle') {
            var diameter = Math.max(metrics.width + pad, fontSize * 2.8);
            w = diameter; h = diameter;
        } else {
            w = metrics.width + pad * 2;
            h = fontSize * 2.1;
        }
        if (shape === 'ribbon') { w += h * 0.4; }

        var r = fx.badgeRadius;
        ctx.save();

        if (fx.badgeShadow) {
            ctx.shadowColor = fx.badgeShadow.color || bgColor;
            ctx.shadowBlur = fx.badgeShadow.blur;
            ctx.shadowOffsetX = fx.badgeShadow.x;
            ctx.shadowOffsetY = fx.badgeShadow.y;
        }

        var effectiveBg = fx.pastelSoften ? C.lightenColor(bgColor, 0.35) : bgColor;
        ctx.globalAlpha = fx.badgeBgAlpha;
        ctx.fillStyle = effectiveBg;

        if (shape === 'pill') {
            C.roundRect(ctx, bx, by, w, h, h / 2);
        } else if (shape === 'circle') {
            ctx.beginPath(); ctx.arc(bx + w / 2, by + h / 2, w / 2, 0, Math.PI * 2); ctx.closePath();
        } else if (shape === 'ribbon') {
            var notch = h * 0.3;
            ctx.beginPath();
            ctx.moveTo(bx + notch, by); ctx.lineTo(bx + w - notch, by);
            ctx.lineTo(bx + w, by + h / 2); ctx.lineTo(bx + w - notch, by + h);
            ctx.lineTo(bx + notch, by + h); ctx.lineTo(bx, by + h / 2);
            ctx.closePath();
        } else if (shape === 'hexagon') {
            var cx0 = bx + w / 2, cy0 = by + h / 2;
            var rx = w / 2, ry = h / 2;
            ctx.beginPath();
            for (var i = 0; i < 6; i++) {
                var angle = Math.PI / 3 * i - Math.PI / 6;
                var px = cx0 + rx * Math.cos(angle), py = cy0 + ry * Math.sin(angle);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
        } else {
            C.roundRect(ctx, bx, by, w, h, r);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowColor = 'transparent';

        if (fx.badgeOutline) {
            ctx.strokeStyle = fx.badgeOutline.color;
            ctx.lineWidth = fx.badgeOutline.width;
            if (shape === 'pill') { C.roundRect(ctx, bx, by, w, h, h / 2); }
            else if (shape === 'circle') { ctx.beginPath(); ctx.arc(bx + w / 2, by + h / 2, w / 2, 0, Math.PI * 2); ctx.closePath(); }
            else if (shape !== 'ribbon' && shape !== 'hexagon') { C.roundRect(ctx, bx, by, w, h, r); }
            ctx.stroke();
        }

        ctx.font = C.getBadgeFont();
        ctx.fillStyle = fx.badgeTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (fx.textStroke) {
            ctx.strokeStyle = fx.textStroke.color;
            ctx.lineWidth = fx.textStroke.width;
            ctx.strokeText(text, bx + w / 2, by + h / 2 + 1);
        }

        if (fx.textShadow) {
            ctx.shadowColor = fx.textShadow.color;
            ctx.shadowBlur = fx.textShadow.blur;
            ctx.shadowOffsetX = fx.textShadow.x;
            ctx.shadowOffsetY = fx.textShadow.y;
        }

        ctx.fillText(text, bx + w / 2, by + h / 2 + 1);
        ctx.restore();
    }

    // ===== Styled Store Name =====
    function drawStoreName() {
        var fx = C.getStyleFx();
        var text = state.storeName.toUpperCase();
        ctx.font = C.getStoreFont();
        var metrics = ctx.measureText(text);
        var pad = state.storeSize * 0.9;
        var w = metrics.width + pad * 2;
        var h = state.storeSize * 1.7;
        var defaultX = (SIZE - w) / 2;
        var defaultY = state.thickness * (fx.borderExtraThickness) + 8;
        var bx = state.storeNameX !== null ? state.storeNameX : defaultX;
        var by = state.storeNameY !== null ? state.storeNameY : defaultY;
        var r = fx.badgeRadius;

        ctx.save();

        if (fx.badgeShadow) {
            ctx.shadowColor = fx.badgeShadow.color || state.accent;
            ctx.shadowBlur = fx.badgeShadow.blur;
            ctx.shadowOffsetX = fx.badgeShadow.x;
            ctx.shadowOffsetY = fx.badgeShadow.y;
        }

        var storeColor = fx.luxuryColors ? '#d4af37' : (fx.pastelSoften ? C.lightenColor(state.accent, 0.35) : state.accent);
        var bgColor = state.storeBgColor || storeColor;
        var showBg = state.storeBg && state.storeBgShape !== 'none';

        if (showBg) {
            ctx.fillStyle = bgColor;
            ctx.globalAlpha = fx.badgeBgAlpha === 0 ? 0 : 0.9;
            var bgR = state.storeBgShape === 'pill' ? h / 2 : r;
            C.roundRect(ctx, bx, by, w, h, bgR);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = 'transparent';

        if (showBg && fx.badgeOutline) {
            ctx.strokeStyle = fx.badgeOutline.color;
            ctx.lineWidth = fx.badgeOutline.width;
            var bgR = state.storeBgShape === 'pill' ? h / 2 : r;
            C.roundRect(ctx, bx, by, w, h, bgR);
            ctx.stroke();
        }

        ctx.font = C.getStoreFont();
        ctx.fillStyle = fx.badgeTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (fx.textStroke) {
            ctx.strokeStyle = fx.textStroke.color;
            ctx.lineWidth = fx.textStroke.width;
            ctx.strokeText(text, SIZE / 2, by + h / 2 + 1);
        }

        if (fx.textShadow) {
            ctx.shadowColor = fx.textShadow.color;
            ctx.shadowBlur = fx.textShadow.blur;
            ctx.shadowOffsetX = fx.textShadow.x;
            ctx.shadowOffsetY = fx.textShadow.y;
        }

        ctx.fillText(text, SIZE / 2, by + h / 2 + 1);
        ctx.restore();
    }

    // ===== QR Code =====
    C.generateQR = function () {
        if (!state.qrUrl) { state.qrImage = null; C.render(); return; }
        try {
            var qr = qrcode(0, 'M');
            qr.addData(state.qrUrl);
            qr.make();
            var moduleCount = qr.getModuleCount();
            var cellSize = 10;
            var qCanvas = document.createElement('canvas');
            qCanvas.width = moduleCount * cellSize;
            qCanvas.height = moduleCount * cellSize;
            var qCtx = qCanvas.getContext('2d');
            qCtx.fillStyle = state.qrBg;
            qCtx.fillRect(0, 0, qCanvas.width, qCanvas.height);
            qCtx.fillStyle = state.qrFg;
            for (var r = 0; r < moduleCount; r++) {
                for (var c = 0; c < moduleCount; c++) {
                    if (qr.isDark(r, c)) qCtx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            }
            var img = new Image();
            img.onload = function () { state.qrImage = img; C.render(); };
            img.src = qCanvas.toDataURL();
            if (state.qrX === null) { state.qrX = SIZE - state.qrSize - 20; state.qrY = SIZE - state.qrSize - 20; }
        } catch (e) { state.qrImage = null; C.render(); }
    };

    function drawQRCode() {
        if (!state.qrImage) return;
        var x = state.qrX !== null ? state.qrX : SIZE - state.qrSize - 20;
        var y = state.qrY !== null ? state.qrY : SIZE - state.qrSize - 20;
        ctx.drawImage(state.qrImage, x, y, state.qrSize, state.qrSize);
    }

    // ===== Diagonal Text Watermark =====
    function drawDiagonalText() {
        if (!state.diagText) return;
        var hasFill = state.diagFill;
        var hasOutline = state.diagOutline > 0;
        if (!hasFill && !hasOutline) return;

        var angle = state.diagAngle * Math.PI / 180;
        var text = state.diagText.toUpperCase();
        var mainSize = state.diagSize;
        var outSize = state.diagOutlineSize || mainSize;
        var maxSize = Math.max(mainSize, outSize);
        var spacing = maxSize * (state.diagSpacing || 5);
        var diag = Math.sqrt(SIZE * SIZE * 2) * 1.5;

        ctx.font = C.getDiagFont(maxSize);
        var textWidth = ctx.measureText(text).width;
        var xStep = textWidth + maxSize * 3;

        if (hasOutline && !hasFill) {
            var offCanvas = document.createElement('canvas');
            offCanvas.width = canvas.width; offCanvas.height = canvas.height;
            var offCtx = offCanvas.getContext('2d');
            offCtx.textAlign = 'center'; offCtx.textBaseline = 'middle';
            offCtx.lineJoin = 'round';
            offCtx.translate(SIZE / 2, SIZE / 2); offCtx.rotate(angle);

            offCtx.font = C.getDiagFont(outSize);
            offCtx.strokeStyle = state.diagOutlineColor;
            offCtx.lineWidth = state.diagOutline;
            for (var y = -diag / 2; y < diag / 2; y += spacing) {
                for (var x = -diag / 2; x < diag / 2; x += xStep) { offCtx.strokeText(text, x, y); }
            }

            offCtx.globalCompositeOperation = 'destination-out';
            offCtx.font = C.getDiagFont(outSize);
            for (var y = -diag / 2; y < diag / 2; y += spacing) {
                for (var x = -diag / 2; x < diag / 2; x += xStep) { offCtx.fillText(text, x, y); }
            }

            ctx.save();
            ctx.globalAlpha = state.diagOpacity / 100;
            ctx.drawImage(offCanvas, 0, 0);
            ctx.restore();
        } else {
            ctx.save();
            ctx.globalAlpha = state.diagOpacity / 100;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate(angle);

            for (var y = -diag / 2; y < diag / 2; y += spacing) {
                for (var x = -diag / 2; x < diag / 2; x += xStep) {
                    if (hasOutline) {
                        ctx.font = C.getDiagFont(outSize);
                        ctx.strokeStyle = state.diagOutlineColor;
                        ctx.lineWidth = state.diagOutline;
                        ctx.strokeText(text, x, y);
                    }
                    if (hasFill) {
                        ctx.font = C.getDiagFont(mainSize);
                        ctx.fillStyle = state.diagColor;
                        ctx.fillText(text, x, y);
                    }
                }
            }
            ctx.restore();
        }
    }

})(window.Creator);
