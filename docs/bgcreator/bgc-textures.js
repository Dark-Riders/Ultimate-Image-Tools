// ===== BG Creator — Texture Generation =====
// Client-side texture overlay using canvas pixel manipulation.
// Each texture type generates a subtle pattern composited at given opacity.

function bgcGenerateTexture(ctx, w, h, type, opacity, scale) {
    if (opacity <= 0) return;

    // Create offscreen canvas for texture
    var tc = document.createElement('canvas');
    var tw = Math.ceil(w / scale), th = Math.ceil(h / scale);
    tc.width = tw;
    tc.height = th;
    var tctx = tc.getContext('2d');
    var imageData = tctx.createImageData(tw, th);
    var data = imageData.data;

    switch (type) {
        case 'paper_grain':
            bgcTexPaperGrain(data, tw, th);
            break;
        case 'linen':
            bgcTexLinen(data, tw, th);
            break;
        case 'fine_noise':
            bgcTexFineNoise(data, tw, th);
            break;
        case 'micro_dot':
            bgcTexMicroDot(data, tw, th);
            break;
        case 'soft_canvas':
            bgcTexSoftCanvas(data, tw, th);
            break;
        default:
            return;
    }

    tctx.putImageData(imageData, 0, 0);

    // Composite texture onto main canvas
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(tc, 0, 0, w, h);
    ctx.restore();
}

// Paper Grain — warm organic noise with density clusters
function bgcTexPaperGrain(data, w, h) {
    for (var i = 0; i < data.length; i += 4) {
        var x = (i / 4) % w;
        var y = Math.floor((i / 4) / w);
        // Multi-frequency noise for organic feel
        var n1 = Math.random() * 40 - 20;
        var n2 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15;
        var v = 128 + n1 + n2;
        data[i] = v;
        data[i + 1] = v - 3; // Slightly warm
        data[i + 2] = v - 6;
        data[i + 3] = 255;
    }
}

// Linen — horizontal micro-weave
function bgcTexLinen(data, w, h) {
    for (var i = 0; i < data.length; i += 4) {
        var x = (i / 4) % w;
        var y = Math.floor((i / 4) / w);
        var hLine = (y % 3 === 0) ? -15 : 0;
        var vLine = (x % 4 === 0) ? -8 : 0;
        var noise = Math.random() * 10 - 5;
        var v = 128 + hLine + vLine + noise;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
}

// Fine Noise — cool uniform grain
function bgcTexFineNoise(data, w, h) {
    for (var i = 0; i < data.length; i += 4) {
        var v = 128 + (Math.random() * 30 - 15);
        data[i] = v + 2; // Slightly cool
        data[i + 1] = v + 2;
        data[i + 2] = v + 4;
        data[i + 3] = 255;
    }
}

// Micro Dot — tiny dot grid
function bgcTexMicroDot(data, w, h) {
    var spacing = 6;
    // Fill with neutral first
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 0; // Transparent base
    }
    // Draw dots
    for (var dy = 0; dy < h; dy += spacing) {
        for (var dx = 0; dx < w; dx += spacing) {
            var px = dx + Math.floor(spacing / 2);
            var py = dy + Math.floor(spacing / 2);
            if (px < w && py < h) {
                var idx = (py * w + px) * 4;
                data[idx] = 80;
                data[idx + 1] = 80;
                data[idx + 2] = 80;
                data[idx + 3] = 255;
                // Adjacent pixels for slightly larger dot
                if (px + 1 < w) {
                    var idx2 = (py * w + px + 1) * 4;
                    data[idx2] = 100; data[idx2 + 1] = 100; data[idx2 + 2] = 100; data[idx2 + 3] = 180;
                }
                if (py + 1 < h) {
                    var idx3 = ((py + 1) * w + px) * 4;
                    data[idx3] = 100; data[idx3 + 1] = 100; data[idx3 + 2] = 100; data[idx3 + 3] = 180;
                }
            }
        }
    }
}

// Soft Canvas — diagonal micro-texture
function bgcTexSoftCanvas(data, w, h) {
    for (var i = 0; i < data.length; i += 4) {
        var x = (i / 4) % w;
        var y = Math.floor((i / 4) / w);
        var diag1 = ((x + y) % 5 === 0) ? -12 : 0;
        var diag2 = ((x - y + 1000) % 7 === 0) ? -8 : 0;
        var noise = Math.random() * 6 - 3;
        var v = 128 + diag1 + diag2 + noise;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
}
