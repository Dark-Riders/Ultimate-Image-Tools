// ===== Decorative Border Styles (11) =====
(function (C) {
    var ctx = C.ctx;
    var SIZE = C.SIZE;

    C.drawFilmstrip = function (t, fill, accent) {
        var borderW = t * 2.5;
        ctx.fillStyle = fill;
        ctx.fillRect(0, 0, borderW, SIZE);
        ctx.fillRect(SIZE - borderW, 0, borderW, SIZE);
        ctx.fillStyle = accent;
        var holeH = t * 0.8; var holeW = t * 1.2; var gap = t * 2;
        for (var y = gap; y < SIZE - gap; y += gap + holeH) {
            C.roundRect(ctx, borderW * 0.2, y, holeW, holeH, 2); ctx.fill();
            C.roundRect(ctx, SIZE - borderW * 0.2 - holeW, y, holeW, holeH, 2); ctx.fill();
        }
        ctx.fillStyle = fill;
        ctx.fillRect(borderW, 0, SIZE - borderW * 2, t);
        ctx.fillRect(borderW, SIZE - t, SIZE - borderW * 2, t);
    };

    C.drawTicket = function (t, fill, accent) {
        var notchR = t * 2;
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.setLineDash([t * 0.4, t * 0.4]);
        C.roundRect(ctx, t / 2, t / 2, SIZE - t, SIZE - t, t * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000';
        [[0, SIZE / 2], [SIZE, SIZE / 2], [SIZE / 2, 0], [SIZE / 2, SIZE]].forEach(function (p) {
            ctx.beginPath(); ctx.arc(p[0], p[1], notchR, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4;
        [[0, SIZE / 2], [SIZE, SIZE / 2], [SIZE / 2, 0], [SIZE / 2, SIZE]].forEach(function (p) {
            ctx.beginPath(); ctx.arc(p[0], p[1], notchR, 0, Math.PI * 2); ctx.stroke();
        });
    };

    C.drawChain = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
        ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
        var linkW = t * 2; var linkH = t * 1;
        var spacing = linkW * 1.6;
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.35;
        for (var pos = spacing; pos < SIZE - spacing; pos += spacing) {
            ctx.beginPath(); ctx.ellipse(pos, t, linkW / 2, linkH / 2, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(pos, SIZE - t, linkW / 2, linkH / 2, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(t, pos, linkH / 2, linkW / 2, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(SIZE - t, pos, linkH / 2, linkW / 2, 0, 0, Math.PI * 2); ctx.stroke();
        }
    };

    C.drawCrossStitch = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
        ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
        var xSize = t * 1.2;
        var spacing = xSize * 2;
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.35; ctx.lineCap = 'round';
        for (var i = t; i < SIZE - t; i += spacing) {
            ctx.beginPath(); ctx.moveTo(i, t * 0.3); ctx.lineTo(i + xSize, t * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(i + xSize, t * 0.3); ctx.lineTo(i, t * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(i, SIZE - t * 0.3); ctx.lineTo(i + xSize, SIZE - t * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(i + xSize, SIZE - t * 0.3); ctx.lineTo(i, SIZE - t * 1.5); ctx.stroke();
        }
        for (var i = t; i < SIZE - t; i += spacing) {
            ctx.beginPath(); ctx.moveTo(t * 0.3, i); ctx.lineTo(t * 1.5, i + xSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(t * 0.3, i + xSize); ctx.lineTo(t * 1.5, i); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(SIZE - t * 0.3, i); ctx.lineTo(SIZE - t * 1.5, i + xSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(SIZE - t * 0.3, i + xSize); ctx.lineTo(SIZE - t * 1.5, i); ctx.stroke();
        }
    };

    C.drawArrow = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t;
        ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
        var arrowSize = t * 1.5;
        var spacing = arrowSize * 2.5;
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4; ctx.lineCap = 'round';
        for (var pos = spacing; pos < SIZE - spacing; pos += spacing) {
            ctx.beginPath(); ctx.moveTo(pos - arrowSize / 2, t * 0.2); ctx.lineTo(pos + arrowSize / 2, t);
            ctx.lineTo(pos - arrowSize / 2, t * 1.8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pos + arrowSize / 2, SIZE - t * 0.2); ctx.lineTo(pos - arrowSize / 2, SIZE - t);
            ctx.lineTo(pos + arrowSize / 2, SIZE - t * 1.8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(t * 0.2, pos - arrowSize / 2); ctx.lineTo(t, pos + arrowSize / 2);
            ctx.lineTo(t * 1.8, pos - arrowSize / 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(SIZE - t * 0.2, pos + arrowSize / 2); ctx.lineTo(SIZE - t, pos - arrowSize / 2);
            ctx.lineTo(SIZE - t * 1.8, pos + arrowSize / 2); ctx.stroke();
        }
    };

    C.drawRope = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 1.2;
        ctx.setLineDash([t * 1.5, t * 0.8]);
        ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4;
        ctx.setLineDash([t * 0.8, t * 1.5]);
        ctx.lineDashOffset = t;
        ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
        [[t * 1.5, t * 1.5], [SIZE - t * 1.5, t * 1.5], [SIZE - t * 1.5, SIZE - t * 1.5], [t * 1.5, SIZE - t * 1.5]]
            .forEach(function (p) {
                ctx.beginPath(); ctx.arc(p[0], p[1], t * 1, 0, Math.PI * 2); ctx.stroke();
            });
    };

    C.drawNetwork = function (t, fill, accent) {
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
        ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
        var spacing = t * 3.5;
        var nodeR = t * 0.45;
        var nodes = [];
        for (var pos = spacing; pos < SIZE - spacing / 2; pos += spacing) {
            nodes.push([pos, t], [pos, SIZE - t], [t, pos], [SIZE - t, pos]);
        }
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.15;
        ctx.setLineDash([t * 0.3, t * 0.3]);
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                var x1 = nodes[i][0], y1 = nodes[i][1], x2 = nodes[j][0], y2 = nodes[j][1];
                var dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                if (dist < spacing * 1.5) {
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                }
            }
        }
        ctx.setLineDash([]);
        ctx.fillStyle = fill;
        nodes.forEach(function (n) {
            ctx.beginPath(); ctx.arc(n[0], n[1], nodeR, 0, Math.PI * 2); ctx.fill();
        });
    };

    C.drawGeoBlocks = function (t, fill, accent) {
        var rng = C.seededRand(42);
        var blockCount = 8;
        var zone = t * 3;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2);
            ctx.rotate((Math.PI / 2) * side);
            ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3;
            ctx.beginPath(); ctx.moveTo(0, zone * 0.5); ctx.lineTo(SIZE, zone * 0.5); ctx.stroke();
            for (var i = 0; i < blockCount; i++) {
                var x = rng() * SIZE * 0.9;
                var w = t * (1.5 + rng() * 3);
                var h = t * (1 + rng() * 2.5);
                var y = rng() * zone * 0.6;
                var isFill = rng() > 0.4;
                if (isFill) {
                    ctx.fillStyle = fill; ctx.globalAlpha = 0.3 + rng() * 0.5;
                    ctx.fillRect(x, y, w, h);
                    ctx.globalAlpha = 1;
                } else {
                    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3;
                    ctx.strokeRect(x, y, w, h);
                }
                if (rng() > 0.5) {
                    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.2;
                    ctx.beginPath(); ctx.moveTo(x + w / 2, y + h); ctx.lineTo(x + w / 2, zone * 0.5); ctx.stroke();
                }
            }
            ctx.restore();
        }
    };

    C.drawBubbles = function (t, fill, accent) {
        var rng = C.seededRand(77);
        var zone = t * 3.5;
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2);
            ctx.rotate((Math.PI / 2) * side);
            ctx.translate(-SIZE / 2, -SIZE / 2);
            for (var i = 0; i < 12; i++) {
                var x = rng() * SIZE;
                var y = rng() * zone;
                var r = t * (0.4 + rng() * 1.5);
                var isFill = rng() > 0.5;
                if (isFill) {
                    ctx.fillStyle = fill; ctx.globalAlpha = 0.15 + rng() * 0.4;
                    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1;
                } else {
                    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.25;
                    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
                }
            }
            for (var i = 0; i < 3; i++) {
                ctx.fillStyle = accent; ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.arc(rng() * SIZE, rng() * zone * 0.5, t * (0.3 + rng() * 0.6), 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawMosaic = function (t, fill, accent) {
        var zone = t * 2.5;
        var tileSize = t * 1.2;
        var cols = Math.ceil(SIZE / tileSize);
        var rng = C.seededRand(123);
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2);
            ctx.rotate((Math.PI / 2) * side);
            ctx.translate(-SIZE / 2, -SIZE / 2);
            var rows = Math.ceil(zone / tileSize);
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    var alpha = (1 - row / rows) * (0.3 + rng() * 0.5);
                    if (rng() > 0.3) {
                        ctx.fillStyle = rng() > 0.7 ? accent : fill;
                        ctx.globalAlpha = alpha;
                        ctx.fillRect(col * tileSize + 0.5, row * tileSize + 0.5, tileSize - 1, tileSize - 1);
                    }
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    };

    C.drawFloral = function (t, fill, accent) {
        var zone = t * 3;
        var rng = C.seededRand(55);
        function drawPetal(cx, cy, petalR, petals) {
            for (var p = 0; p < petals; p++) {
                var angle = (Math.PI * 2 / petals) * p;
                var px = cx + Math.cos(angle) * petalR;
                var py = cy + Math.sin(angle) * petalR;
                ctx.beginPath(); ctx.arc(px, py, petalR * 0.6, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.beginPath(); ctx.arc(cx, cy, petalR * 0.3, 0, Math.PI * 2); ctx.fill();
        }
        for (var side = 0; side < 4; side++) {
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2);
            ctx.rotate((Math.PI / 2) * side);
            ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2; ctx.fillStyle = accent;
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.15;
            ctx.beginPath();
            ctx.moveTo(0, zone * 0.5);
            for (var x = 0; x < SIZE; x += 20) { ctx.lineTo(x, zone * 0.5 + Math.sin(x * 0.05) * t); }
            ctx.stroke();
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
            for (var i = 0; i < 6; i++) {
                var x = (i + 0.5) * (SIZE / 6) + (rng() - 0.5) * t * 2;
                var y = zone * 0.4 * rng();
                var pr = t * (0.5 + rng() * 0.8);
                var petals = 4 + Math.floor(rng() * 3);
                drawPetal(x, y, pr, petals);
            }
            ctx.restore();
        }
    };

})(window.Creator);
