// ===== Artistic Border Styles (17) =====
(function (C) {
    var ctx = C.ctx;
    var SIZE = C.SIZE;

    C.drawPixelArt = function (t, fill, accent) {
        var pxSize = t * 1;
        var zone = Math.ceil(t * 2.5 / pxSize) * pxSize;
        var cols = Math.ceil(SIZE / pxSize);
        var rows = Math.ceil(zone / pxSize);
        var rng = C.seededRand(99);
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    var prob = 1 - (row / rows);
                    if (rng() < prob * 0.7) {
                        ctx.fillStyle = rng() > 0.8 ? accent : fill;
                        ctx.globalAlpha = 0.4 + prob * 0.5;
                        ctx.fillRect(col * pxSize, row * pxSize, pxSize, pxSize);
                    }
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawConfetti = function (t, fill, accent) {
        var zone = t * 3;
        var rng = C.seededRand(31);
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 18; i++) {
                var x = rng() * SIZE, y = rng() * zone;
                var w = t * (0.4 + rng() * 1.2), h = t * (0.3 + rng() * 0.8);
                var angle = rng() * Math.PI;
                var isCircle = rng() > 0.6;
                ctx.save();
                ctx.translate(x, y); ctx.rotate(angle);
                ctx.fillStyle = rng() > 0.6 ? accent : fill;
                ctx.globalAlpha = 0.3 + rng() * 0.5;
                if (isCircle) { ctx.beginPath(); ctx.arc(0, 0, w * 0.5, 0, Math.PI * 2); ctx.fill(); }
                else { ctx.fillRect(-w / 2, -h / 2, w, h); }
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawWoven = function (t, fill, accent) {
        var zone = t * 2.5;
        var strandW = t * 1.5;
        var gap = t * 0.8;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.4;
            for (var y = 0; y < zone; y += strandW + gap) {
                ctx.beginPath();
                for (var x = 0; x < SIZE; x += strandW * 2) {
                    ctx.moveTo(x, y); ctx.quadraticCurveTo(x + strandW, y + strandW * 0.3, x + strandW * 2, y);
                }
                ctx.stroke();
            }
            ctx.strokeStyle = accent; ctx.lineWidth = t * 0.25;
            for (var x = strandW; x < SIZE; x += strandW * 2 + gap) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, zone); ctx.stroke();
            }
            ctx.restore();
        }
    };

    C.drawCircuit = function (t, fill, accent) {
        var zone = t * 3;
        var rng = C.seededRand(88);
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
            var traceCount = 10;
            for (var i = 0; i < traceCount; i++) {
                var x1 = rng() * SIZE, y1 = rng() * zone * 0.3;
                var len = t * (2 + rng() * 5);
                var goDown = rng() > 0.5;
                ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, y1);
                if (goDown) { ctx.lineTo(x1 + len, y1); ctx.lineTo(x1 + len, y1 + t * (0.5 + rng())); }
                else { ctx.lineTo(x1 - len * 0.5, y1); }
                ctx.stroke();
                ctx.fillStyle = accent;
                ctx.beginPath(); ctx.arc(x1, y1, t * 0.25, 0, Math.PI * 2); ctx.fill();
            }
            for (var i = 0; i < 2; i++) {
                var cx = SIZE * 0.2 + rng() * SIZE * 0.6;
                var chipW = t * (1.5 + rng()), chipH = t * (0.8 + rng() * 0.5);
                ctx.fillStyle = fill; ctx.globalAlpha = 0.4;
                ctx.fillRect(cx, t * 0.2, chipW, chipH);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = fill; ctx.lineWidth = t * 0.1;
                for (var l = 0; l < 3; l++) {
                    var lx = cx + (l + 0.5) * (chipW / 3);
                    ctx.beginPath(); ctx.moveTo(lx, t * 0.2 + chipH); ctx.lineTo(lx, t * 0.2 + chipH + t * 0.5); ctx.stroke();
                }
            }
            ctx.restore();
        }
    };

    C.drawStarBurst = function (t, fill, accent) {
        var rng = C.seededRand(200);
        var zone = t * 3;
        function star(cx, cy, r, spikes) {
            ctx.beginPath();
            for (var i = 0; i < spikes * 2; i++) {
                var angle = (i * Math.PI) / spikes - Math.PI / 2;
                var rad = i % 2 === 0 ? r : r * 0.4;
                var x = cx + Math.cos(angle) * rad, y = cy + Math.sin(angle) * rad;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
        }
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 10; i++) {
                var x = rng() * SIZE, y = rng() * zone;
                var r = t * (0.4 + rng() * 1);
                var spikes = 4 + Math.floor(rng() * 4);
                if (rng() > 0.5) {
                    ctx.fillStyle = rng() > 0.6 ? accent : fill;
                    ctx.globalAlpha = 0.3 + rng() * 0.5;
                    star(x, y, r, spikes); ctx.fill();
                } else {
                    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
                    star(x, y, r, spikes); ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawHearts = function (t, fill, accent) {
        var rng = C.seededRand(143);
        var zone = t * 3;
        function heart(cx, cy, size) {
            var s = size;
            ctx.beginPath();
            ctx.moveTo(cx, cy + s * 0.4);
            ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.2, cx - s, cy + s * 0.1, cx, cy + s);
            ctx.bezierCurveTo(cx + s, cy + s * 0.1, cx + s * 0.5, cy - s * 0.2, cx, cy + s * 0.4);
            ctx.closePath();
        }
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 8; i++) {
                var x = rng() * SIZE, y = rng() * zone * 0.7, s = t * (0.5 + rng() * 1);
                ctx.fillStyle = rng() > 0.5 ? accent : fill;
                ctx.globalAlpha = 0.25 + rng() * 0.45;
                heart(x, y, s); ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawLeaves = function (t, fill, accent) {
        var rng = C.seededRand(67);
        var zone = t * 3;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.15;
            ctx.beginPath(); ctx.moveTo(0, zone * 0.5);
            for (var x = 0; x < SIZE; x += 10) { ctx.lineTo(x, zone * 0.5 + Math.sin(x * 0.04) * t * 0.5); }
            ctx.stroke();
            for (var i = 0; i < 10; i++) {
                var x = rng() * SIZE, y = rng() * zone * 0.6;
                var leafW = t * (0.5 + rng() * 0.8), leafH = t * (1 + rng() * 1.5);
                var angle = (rng() - 0.5) * 1.5;
                ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
                ctx.fillStyle = rng() > 0.6 ? accent : fill;
                ctx.globalAlpha = 0.25 + rng() * 0.4;
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.quadraticCurveTo(leafW, -leafH * 0.5, 0, -leafH);
                ctx.quadraticCurveTo(-leafW, -leafH * 0.5, 0, 0); ctx.fill();
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawLightning = function (t, fill, accent) {
        var rng = C.seededRand(111);
        var zone = t * 3;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 6; i++) {
                var x = rng() * SIZE, y = 0;
                ctx.strokeStyle = rng() > 0.5 ? accent : fill;
                ctx.lineWidth = t * (0.15 + rng() * 0.25);
                ctx.globalAlpha = 0.4 + rng() * 0.5;
                ctx.beginPath(); ctx.moveTo(x, y);
                var segs = 3 + Math.floor(rng() * 3);
                for (var s = 0; s < segs; s++) {
                    x += (rng() - 0.5) * t * 2;
                    y += zone / segs * (0.5 + rng() * 0.5);
                    ctx.lineTo(x, Math.min(y, zone));
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawWaves3D = function (t, fill, accent) {
        var layers = 4;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var l = 0; l < layers; l++) {
                var y = l * t * 0.8;
                var amp = t * (0.8 - l * 0.15);
                var freq = 0.03 + l * 0.005;
                ctx.strokeStyle = l % 2 === 0 ? fill : accent;
                ctx.lineWidth = t * (0.4 - l * 0.08);
                ctx.globalAlpha = 1 - l * 0.2;
                ctx.beginPath();
                for (var x = 0; x <= SIZE; x += 4) {
                    var yy = y + Math.sin(x * freq + l * 0.8) * amp;
                    x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawTriangles = function (t, fill, accent) {
        var rng = C.seededRand(155);
        var zone = t * 3;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 12; i++) {
                var x = rng() * SIZE, y = rng() * zone, s = t * (0.6 + rng() * 1.2);
                var flip = rng() > 0.5 ? 1 : -1;
                ctx.globalAlpha = 0.25 + rng() * 0.45;
                if (rng() > 0.4) {
                    ctx.fillStyle = rng() > 0.6 ? accent : fill;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * flip); ctx.lineTo(x - s, y + s * flip); ctx.closePath(); ctx.fill();
                } else {
                    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * flip); ctx.lineTo(x - s, y + s * flip); ctx.closePath(); ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawSpiral = function (t, fill, accent) {
        var rng = C.seededRand(222);
        var zone = t * 3;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 6; i++) {
                var cx = rng() * SIZE, cy = rng() * zone * 0.8;
                var maxR = t * (0.8 + rng() * 1.2);
                var turns = 2 + rng() * 2;
                ctx.strokeStyle = rng() > 0.5 ? accent : fill;
                ctx.lineWidth = t * 0.15;
                ctx.globalAlpha = 0.4 + rng() * 0.4;
                ctx.beginPath();
                for (var a = 0; a < turns * Math.PI * 2; a += 0.2) {
                    var r = (a / (turns * Math.PI * 2)) * maxR;
                    var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
                    a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawDna = function (t, fill, accent) {
        var zone = t * 2.5;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            var strand1Y = zone * 0.3, strand2Y = zone * 0.7;
            var amp = zone * 0.25, freq = 0.04;
            ctx.lineWidth = t * 0.3;
            for (var s = 0; s < 2; s++) {
                ctx.strokeStyle = s === 0 ? fill : accent;
                ctx.beginPath();
                for (var x = 0; x <= SIZE; x += 3) {
                    var baseY = s === 0 ? strand1Y : strand2Y;
                    var yy = baseY + Math.sin(x * freq + s * Math.PI) * amp;
                    x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
                }
                ctx.stroke();
            }
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.1; ctx.globalAlpha = 0.5;
            for (var x = 0; x < SIZE; x += t * 2) {
                var y1 = strand1Y + Math.sin(x * freq) * amp;
                var y2 = strand2Y + Math.sin(x * freq + Math.PI) * amp;
                ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawBarcode = function (t, fill, accent) {
        var rng = C.seededRand(333);
        var zone = t * 2.5;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            var x = 0;
            while (x < SIZE) {
                var barW = t * (0.1 + rng() * 0.4), barH = zone * (0.4 + rng() * 0.6);
                var gap = t * (0.1 + rng() * 0.3);
                ctx.fillStyle = rng() > 0.8 ? accent : fill;
                ctx.globalAlpha = 0.4 + rng() * 0.5;
                ctx.fillRect(x, 0, barW, barH);
                x += barW + gap;
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawGradientFade = function (t, fill, accent) {
        var zone = t * 3;
        var steps = 8;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < steps; i++) {
                var y = (i / steps) * zone;
                var h = zone / steps;
                ctx.fillStyle = i % 2 === 0 ? fill : accent;
                ctx.globalAlpha = (1 - i / steps) * 0.6;
                ctx.fillRect(0, y, SIZE, h);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawHoneycomb = function (t, fill, accent) {
        var hexR = t * 1;
        var zone = t * 3;
        var hexH = hexR * Math.sqrt(3);
        var rng = C.seededRand(444);
        function drawHex(cx, cy) {
            ctx.beginPath();
            for (var i = 0; i < 6; i++) {
                var a = (Math.PI / 3) * i - Math.PI / 6;
                var x = cx + hexR * Math.cos(a), y = cy + hexR * Math.sin(a);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
        }
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            var row = 0;
            for (var y = hexR; y < zone + hexR; y += hexH * 0.75) {
                var offset = row % 2 === 0 ? 0 : hexR * 1.5;
                for (var x = offset; x < SIZE + hexR; x += hexR * 3) {
                    var alpha = (1 - (y / zone)) * 0.5;
                    if (rng() > 0.3) {
                        ctx.strokeStyle = rng() > 0.7 ? accent : fill;
                        ctx.lineWidth = t * 0.15;
                        ctx.globalAlpha = alpha + 0.1;
                        drawHex(x, y); ctx.stroke();
                    }
                    if (rng() > 0.7) {
                        ctx.fillStyle = accent;
                        ctx.globalAlpha = alpha * 0.5;
                        drawHex(x, y); ctx.fill();
                    }
                }
                row++;
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawSplatter = function (t, fill, accent) {
        var rng = C.seededRand(555);
        var zone = t * 3.5;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 8; i++) {
                var cx = rng() * SIZE, cy = rng() * zone * 0.7;
                var mainR = t * (0.5 + rng() * 1.5);
                ctx.fillStyle = rng() > 0.5 ? accent : fill;
                ctx.globalAlpha = 0.2 + rng() * 0.4;
                ctx.beginPath(); ctx.arc(cx, cy, mainR, 0, Math.PI * 2); ctx.fill();
                var dropCount = 2 + Math.floor(rng() * 4);
                for (var d = 0; d < dropCount; d++) {
                    var angle = rng() * Math.PI * 2;
                    var dist = mainR + rng() * t * 1.5;
                    var dr = t * (0.1 + rng() * 0.3);
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, dr, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawRibbon = function (t, fill, accent) {
        var zone = t * 2.5;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.fillStyle = fill; ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var x = 0; x <= SIZE; x += 4) { ctx.lineTo(x, Math.sin(x * 0.03) * t * 0.5 + t * 0.3); }
            for (var x = SIZE; x >= 0; x -= 4) { ctx.lineTo(x, Math.sin(x * 0.03) * t * 0.5 + zone * 0.6); }
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3; ctx.globalAlpha = 0.7;
            ctx.beginPath();
            for (var x = 0; x <= SIZE; x += 4) {
                var y = Math.sin(x * 0.03) * t * 0.5 + t * 0.3;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.strokeStyle = accent; ctx.lineWidth = t * 0.2;
            ctx.beginPath();
            for (var x = 0; x <= SIZE; x += 4) {
                var y = Math.sin(x * 0.03) * t * 0.5 + zone * 0.6;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

})(window.Creator);
