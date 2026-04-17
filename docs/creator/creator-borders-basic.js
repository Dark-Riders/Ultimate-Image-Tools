// ===== Basic Border Styles (12) =====
(function (C) {
    var ctx = C.ctx;
    var SIZE = C.SIZE;

    C.drawSimple = function (t, fill) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
    };

    C.drawDouble = function (t, fill) {
        var gap = t * 1.5;
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
        ctx.lineWidth = t * 0.5;
        ctx.strokeRect(t + gap, t + gap, SIZE - 2 * (t + gap), SIZE - 2 * (t + gap));
    };

    C.drawAngular = function (t, fill, accent) {
        var cut = t * 3;
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.beginPath();
        ctx.moveTo(cut + t / 2, t / 2); ctx.lineTo(SIZE - cut - t / 2, t / 2);
        ctx.lineTo(SIZE - t / 2, cut + t / 2); ctx.lineTo(SIZE - t / 2, SIZE - cut - t / 2);
        ctx.lineTo(SIZE - cut - t / 2, SIZE - t / 2); ctx.lineTo(cut + t / 2, SIZE - t / 2);
        ctx.lineTo(t / 2, SIZE - cut - t / 2); ctx.lineTo(t / 2, cut + t / 2);
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = accent; ctx.globalAlpha = 0.8;
        [[0, 0, cut + t, 0, 0, cut + t], [SIZE, 0, SIZE - cut - t, 0, SIZE, cut + t],
        [SIZE, SIZE, SIZE - cut - t, SIZE, SIZE, SIZE - cut - t], [0, SIZE, cut + t, SIZE, 0, SIZE - cut - t]]
            .forEach(function (p) {
                ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.closePath(); ctx.fill();
            });
        ctx.globalAlpha = 1;
    };

    C.drawCorners = function (t, fill) {
        var len = SIZE * 0.22;
        ctx.strokeStyle = fill; ctx.lineWidth = t; ctx.lineCap = 'square';
        [[t / 2, len, t / 2, t / 2, len, t / 2], [SIZE - len, t / 2, SIZE - t / 2, t / 2, SIZE - t / 2, len],
        [SIZE - t / 2, SIZE - len, SIZE - t / 2, SIZE - t / 2, SIZE - len, SIZE - t / 2],
        [len, SIZE - t / 2, t / 2, SIZE - t / 2, t / 2, SIZE - len]]
            .forEach(function (p) {
                ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.stroke();
            });
    };

    C.drawLayered = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]); var g = t + 6;
        ctx.strokeRect(g, g, SIZE - g * 2, SIZE - g * 2);
        ctx.setLineDash([]);
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5; var g2 = t + 14;
        ctx.strokeRect(g2, g2, SIZE - g2 * 2, SIZE - g2 * 2);
    };

    C.drawBracket = function (t, fill, accent) {
        var armLen = SIZE * 0.22, midLen = SIZE * 0.15;
        ctx.strokeStyle = fill; ctx.lineWidth = t; ctx.lineCap = 'square';
        [[t / 2, armLen, t / 2, t / 2, armLen, t / 2], [SIZE - armLen, t / 2, SIZE - t / 2, t / 2, SIZE - t / 2, armLen],
        [SIZE - t / 2, SIZE - armLen, SIZE - t / 2, SIZE - t / 2, SIZE - armLen, SIZE - t / 2],
        [armLen, SIZE - t / 2, t / 2, SIZE - t / 2, t / 2, SIZE - armLen]]
            .forEach(function (p) {
                ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.stroke();
            });
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.6; var c = SIZE / 2;
        [[c - midLen, t / 2, c + midLen, t / 2], [c - midLen, SIZE - t / 2, c + midLen, SIZE - t / 2],
        [t / 2, c - midLen, t / 2, c + midLen], [SIZE - t / 2, c - midLen, SIZE - t / 2, c + midLen]]
            .forEach(function (p) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.stroke(); });
    };

    C.drawRounded = function (t, fill) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        C.roundRect(ctx, t / 2, t / 2, SIZE - t, SIZE - t, t * 3); ctx.stroke();
    };

    C.drawInset = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
        var d = t * 2.5; ctx.strokeStyle = accent; ctx.lineWidth = t * 0.6;
        [[0, d, d, 0], [SIZE - d, 0, SIZE, d], [SIZE, SIZE - d, SIZE - d, SIZE], [d, SIZE, 0, SIZE - d]]
            .forEach(function (p) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.stroke(); });
        var ds = t * 0.8; ctx.fillStyle = accent;
        [[t * 1.5, t * 1.5], [SIZE - t * 1.5, t * 1.5], [SIZE - t * 1.5, SIZE - t * 1.5], [t * 1.5, SIZE - t * 1.5]]
            .forEach(function (p) {
                ctx.beginPath();
                ctx.moveTo(p[0], p[1] - ds); ctx.lineTo(p[0] + ds, p[1]); ctx.lineTo(p[0], p[1] + ds); ctx.lineTo(p[0] - ds, p[1]);
                ctx.closePath(); ctx.fill();
            });
    };

    // ===== Wavy, Scalloped, Zigzag, Dotted =====

    C.drawWavy = function (t, fill) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        var waves = 12; var amp = t * 1.8;
        ctx.beginPath();
        for (var i = 0; i <= waves; i++) {
            var x = (i / waves) * SIZE;
            var y = t + (i % 2 === 0 ? -amp : amp);
            i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo((x + ((i - 1) / waves) * SIZE) / 2, t + (i % 2 === 0 ? amp : -amp), x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (var i = 0; i <= waves; i++) {
            var x = (i / waves) * SIZE;
            var y = SIZE - t + (i % 2 === 0 ? -amp : amp);
            i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo((x + ((i - 1) / waves) * SIZE) / 2, SIZE - t + (i % 2 === 0 ? amp : -amp), x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (var i = 0; i <= waves; i++) {
            var y = (i / waves) * SIZE;
            var x = t + (i % 2 === 0 ? -amp : amp);
            i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(t + (i % 2 === 0 ? amp : -amp), (y + ((i - 1) / waves) * SIZE) / 2, x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (var i = 0; i <= waves; i++) {
            var y = (i / waves) * SIZE;
            var x = SIZE - t + (i % 2 === 0 ? amp : -amp);
            i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(SIZE - t + (i % 2 === 0 ? -amp : amp), (y + ((i - 1) / waves) * SIZE) / 2, x, y);
        }
        ctx.stroke();
    };

    C.drawScalloped = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.6;
        var count = 10; var r = SIZE / (count * 2);
        for (var i = 0; i < count; i++) {
            var cx = r + i * r * 2;
            ctx.beginPath(); ctx.arc(cx, t, r, Math.PI, 0, false); ctx.stroke();
        }
        for (var i = 0; i < count; i++) {
            var cx = r + i * r * 2;
            ctx.beginPath(); ctx.arc(cx, SIZE - t, r, 0, Math.PI, false); ctx.stroke();
        }
        for (var i = 0; i < count; i++) {
            var cy = r + i * r * 2;
            ctx.beginPath(); ctx.arc(t, cy, r, Math.PI * 1.5, Math.PI * 0.5, false); ctx.stroke();
        }
        for (var i = 0; i < count; i++) {
            var cy = r + i * r * 2;
            ctx.beginPath(); ctx.arc(SIZE - t, cy, r, Math.PI * 0.5, Math.PI * 1.5, false); ctx.stroke();
        }
        ctx.fillStyle = accent;
        [[t, t], [SIZE - t, t], [SIZE - t, SIZE - t], [t, SIZE - t]].forEach(function (p) {
            ctx.beginPath(); ctx.arc(p[0], p[1], t * 0.6, 0, Math.PI * 2); ctx.fill();
        });
    };

    C.drawZigzag = function (t, fill) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.7;
        var teeth = 16; var step = SIZE / teeth; var amp = t * 2;
        ctx.beginPath(); ctx.moveTo(0, t);
        for (var i = 0; i < teeth; i++) { ctx.lineTo(step * i + step / 2, t - amp); ctx.lineTo(step * (i + 1), t); }
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, SIZE - t);
        for (var i = 0; i < teeth; i++) { ctx.lineTo(step * i + step / 2, SIZE - t + amp); ctx.lineTo(step * (i + 1), SIZE - t); }
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(t, 0);
        for (var i = 0; i < teeth; i++) { ctx.lineTo(t - amp, step * i + step / 2); ctx.lineTo(t, step * (i + 1)); }
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(SIZE - t, 0);
        for (var i = 0; i < teeth; i++) { ctx.lineTo(SIZE - t + amp, step * i + step / 2); ctx.lineTo(SIZE - t, step * (i + 1)); }
        ctx.stroke();
    };

    C.drawDotted = function (t, fill) {
        ctx.fillStyle = fill;
        var spacing = t * 2.5; var r = t * 0.6;
        var count = Math.floor(SIZE / spacing);
        for (var i = 0; i <= count; i++) {
            var pos = i * spacing;
            ctx.beginPath(); ctx.arc(pos, t, r, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(pos, SIZE - t, r, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(t, pos, r, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(SIZE - t, pos, r, 0, Math.PI * 2); ctx.fill();
        }
    };

})(window.Creator);
