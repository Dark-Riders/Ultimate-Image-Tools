// ===== BG Creator — Organic Pattern Generation =====
// Seeded PRNG for reproducible but organic patterns.
// Each pattern uses jittered positions, varying sizes, rotation, and random omissions.

// Seeded pseudo-random number generator (mulberry32)
function bgcSeededRandom(seed) {
    var s = seed | 0;
    return function () {
        s = (s + 0x6D2B79F5) | 0;
        var t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Main dispatcher
function bgcDrawPattern(ctx, w, h, type, seed, colors) {
    var rng = bgcSeededRandom(seed);
    var base = colors.second || '#ddd';
    var accent = colors.third || colors.second || '#ccc';

    ctx.save();
    switch (type) {
        case 'polka_dot':      bgcPatPolkaDot(ctx, w, h, rng, base, accent); break;
        case 'diagonal_line':  bgcPatDiagonalLine(ctx, w, h, rng, base, accent); break;
        case 'chevron':        bgcPatChevron(ctx, w, h, rng, base, accent); break;
        case 'diamond_grid':   bgcPatDiamondGrid(ctx, w, h, rng, base, accent); break;
        case 'crosshatch':     bgcPatCrosshatch(ctx, w, h, rng, base, accent); break;
        case 'scatter_dot':    bgcPatScatterDot(ctx, w, h, rng, base, accent); break;
        case 'wave':           bgcPatWave(ctx, w, h, rng, base, accent); break;
        case 'hexagon':        bgcPatHexagon(ctx, w, h, rng, base, accent); break;
        case 'confetti':       bgcPatConfetti(ctx, w, h, rng, base, accent); break;
        case 'terrazzo':       bgcPatTerrazzo(ctx, w, h, rng, base, accent); break;
    }
    ctx.restore();
}

// 1. Polka Dot — jittered grid, varying sizes, random omissions
function bgcPatPolkaDot(ctx, w, h, rng, color, accent) {
    var spacing = Math.max(w, h) / 12;
    ctx.globalAlpha = 0.3;
    for (var y = -spacing; y < h + spacing; y += spacing) {
        for (var x = -spacing; x < w + spacing; x += spacing) {
            if (rng() < 0.15) continue; // random omission
            var jx = x + (rng() - 0.5) * spacing * 0.4;
            var jy = y + (rng() - 0.5) * spacing * 0.4;
            var r = spacing * 0.15 * (0.7 + rng() * 0.6);
            ctx.fillStyle = rng() > 0.7 ? accent : color;
            ctx.globalAlpha = 0.15 + rng() * 0.2;
            ctx.beginPath();
            ctx.arc(jx, jy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 2. Diagonal Line — stripes with thickness variation and wobble
function bgcPatDiagonalLine(ctx, w, h, rng, color, accent) {
    var spacing = Math.max(w, h) / 20;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.2;
    var diag = Math.sqrt(w * w + h * h);
    for (var i = -diag; i < diag * 2; i += spacing) {
        var thick = 1 + rng() * 2;
        ctx.lineWidth = thick;
        ctx.strokeStyle = rng() > 0.8 ? accent : color;
        ctx.globalAlpha = 0.1 + rng() * 0.15;
        ctx.beginPath();
        var wobble1 = (rng() - 0.5) * spacing * 0.2;
        var wobble2 = (rng() - 0.5) * spacing * 0.2;
        ctx.moveTo(i + wobble1, -10);
        ctx.lineTo(i - h + wobble2, h + 10);
        ctx.stroke();
    }
}

// 3. Chevron — V-shapes with irregular spacing
function bgcPatChevron(ctx, w, h, rng, color, accent) {
    var rowH = Math.max(w, h) / 10;
    ctx.globalAlpha = 0.18;
    for (var y = -rowH; y < h + rowH; y += rowH) {
        var jy = y + (rng() - 0.5) * rowH * 0.3;
        var angle = (rng() - 0.5) * 0.05; // slight rotation
        ctx.save();
        ctx.translate(w / 2, jy);
        ctx.rotate(angle);
        ctx.strokeStyle = rng() > 0.7 ? accent : color;
        ctx.lineWidth = 1.5 + rng() * 1.5;
        ctx.beginPath();
        for (var x = -w; x < w * 1.5; x += rowH * 0.6) {
            var vx = x - w / 2;
            ctx.moveTo(vx, 0);
            ctx.lineTo(vx + rowH * 0.3, -rowH * 0.25);
            ctx.moveTo(vx, 0);
            ctx.lineTo(vx + rowH * 0.3, rowH * 0.25);
        }
        ctx.stroke();
        ctx.restore();
    }
}

// 4. Diamond Grid — rhombus with size jitter, some missing
function bgcPatDiamondGrid(ctx, w, h, rng, color, accent) {
    var spacing = Math.max(w, h) / 10;
    ctx.globalAlpha = 0.2;
    for (var y = 0; y < h + spacing; y += spacing) {
        for (var x = 0; x < w + spacing; x += spacing) {
            if (rng() < 0.2) continue; // skip some
            var cx = x + (rng() - 0.5) * spacing * 0.3;
            var cy = y + (rng() - 0.5) * spacing * 0.3;
            var s = spacing * 0.2 * (0.6 + rng() * 0.8);
            var rot = (rng() - 0.5) * 0.2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI / 4 + rot);
            ctx.fillStyle = rng() > 0.6 ? accent : color;
            ctx.globalAlpha = 0.12 + rng() * 0.15;
            ctx.fillRect(-s / 2, -s / 2, s, s);
            ctx.restore();
        }
    }
}

// 5. Crosshatch — crossed lines with varying weight
function bgcPatCrosshatch(ctx, w, h, rng, color, accent) {
    var spacing = Math.max(w, h) / 25;
    ctx.globalAlpha = 0.12;
    // Lines going one direction
    for (var i = -w; i < w + h; i += spacing) {
        ctx.strokeStyle = rng() > 0.7 ? accent : color;
        ctx.lineWidth = 0.5 + rng() * 1.5;
        ctx.globalAlpha = 0.08 + rng() * 0.1;
        var a1 = 0.78 + (rng() - 0.5) * 0.1; // ~45° with jitter
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + Math.cos(a1) * h * 1.5, Math.sin(a1) * h * 1.5);
        ctx.stroke();
    }
    // Lines going other direction
    for (var i = -w; i < w + h; i += spacing) {
        ctx.strokeStyle = rng() > 0.7 ? accent : color;
        ctx.lineWidth = 0.5 + rng() * 1.5;
        ctx.globalAlpha = 0.08 + rng() * 0.1;
        var a2 = -0.78 + (rng() - 0.5) * 0.1;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + Math.cos(a2) * h * 1.5, -Math.sin(a2) * h * 1.5 + h);
        ctx.stroke();
    }
}

// 6. Scatter Dot — fully random, no grid, organic clustering
function bgcPatScatterDot(ctx, w, h, rng, color, accent) {
    var count = Math.floor(w * h / 3000);
    // Create clusters
    var clusters = [];
    for (var c = 0; c < 5 + Math.floor(rng() * 5); c++) {
        clusters.push({ x: rng() * w, y: rng() * h, r: 50 + rng() * 150 });
    }
    for (var i = 0; i < count; i++) {
        var cx, cy;
        if (rng() < 0.6 && clusters.length > 0) {
            // Near a cluster
            var cl = clusters[Math.floor(rng() * clusters.length)];
            var angle = rng() * Math.PI * 2;
            var dist = rng() * cl.r;
            cx = cl.x + Math.cos(angle) * dist;
            cy = cl.y + Math.sin(angle) * dist;
        } else {
            cx = rng() * w;
            cy = rng() * h;
        }
        var r = 1 + rng() * 4;
        ctx.fillStyle = rng() > 0.65 ? accent : color;
        ctx.globalAlpha = 0.1 + rng() * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 7. Wave — organic wavy lines with varying amplitude
function bgcPatWave(ctx, w, h, rng, color, accent) {
    var lineCount = 8 + Math.floor(rng() * 6);
    var spacing = h / lineCount;
    for (var l = 0; l < lineCount; l++) {
        var baseY = spacing * l + spacing * 0.5 + (rng() - 0.5) * spacing * 0.3;
        var amp = 5 + rng() * 15;
        var freq = 0.005 + rng() * 0.015;
        var phase = rng() * Math.PI * 2;
        ctx.strokeStyle = rng() > 0.7 ? accent : color;
        ctx.lineWidth = 1 + rng() * 2;
        ctx.globalAlpha = 0.12 + rng() * 0.15;
        ctx.beginPath();
        for (var x = 0; x <= w; x += 2) {
            var y = baseY + Math.sin(x * freq + phase) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

// 8. Hexagon — honeycomb with jitter
function bgcPatHexagon(ctx, w, h, rng, color, accent) {
    var size = Math.max(w, h) / 14;
    var hexH = size * Math.sqrt(3);
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    for (var row = -1; row < h / hexH + 1; row++) {
        for (var col = -1; col < w / (size * 1.5) + 1; col++) {
            if (rng() < 0.15) continue;
            var cx = col * size * 1.5 + (rng() - 0.5) * size * 0.2;
            var cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2) + (rng() - 0.5) * size * 0.2;
            var s = size * 0.4 * (0.7 + rng() * 0.6);
            ctx.strokeStyle = rng() > 0.6 ? accent : color;
            ctx.globalAlpha = 0.1 + rng() * 0.15;
            ctx.beginPath();
            for (var p = 0; p < 6; p++) {
                var a = Math.PI / 3 * p - Math.PI / 6;
                var px = cx + s * Math.cos(a);
                var py = cy + s * Math.sin(a);
                if (p === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}

// 9. Confetti — random rectangles at various angles
function bgcPatConfetti(ctx, w, h, rng, color, accent) {
    var count = Math.floor(w * h / 5000);
    for (var i = 0; i < count; i++) {
        var cx = rng() * w;
        var cy = rng() * h;
        var sw = 3 + rng() * 10;
        var sh = 2 + rng() * 5;
        var rot = rng() * Math.PI;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = rng() > 0.5 ? accent : color;
        ctx.globalAlpha = 0.1 + rng() * 0.18;
        ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        ctx.restore();
    }
}

// 10. Terrazzo — irregular organic blob shapes
function bgcPatTerrazzo(ctx, w, h, rng, color, accent) {
    var count = 20 + Math.floor(rng() * 25);
    for (var i = 0; i < count; i++) {
        var cx = rng() * w;
        var cy = rng() * h;
        var baseR = 8 + rng() * 25;
        var points = 5 + Math.floor(rng() * 5);
        ctx.fillStyle = rng() > 0.55 ? accent : color;
        ctx.globalAlpha = 0.08 + rng() * 0.15;
        ctx.beginPath();
        for (var p = 0; p < points; p++) {
            var a = (Math.PI * 2 / points) * p + rng() * 0.4;
            var r = baseR * (0.5 + rng() * 0.8);
            var px = cx + r * Math.cos(a);
            var py = cy + r * Math.sin(a);
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
}
