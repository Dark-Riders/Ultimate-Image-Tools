// ===== Utility Functions =====
(function (C) {
    var ctx = C.ctx;
    var SIZE = C.SIZE;
    var state = C.state;

    // ===== roundRect =====
    C.roundRect = function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    // ===== lightenColor =====
    C.lightenColor = function (hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        var lr = Math.round(r + (255 - r) * amount);
        var lg = Math.round(g + (255 - g) * amount);
        var lb = Math.round(b + (255 - b) * amount);
        return 'rgb(' + lr + ',' + lg + ',' + lb + ')';
    };

    // ===== makeStripePattern =====
    C.makeStripePattern = function (c1, c2) {
        var pCanvas = document.createElement('canvas');
        pCanvas.width = 20; pCanvas.height = 20;
        var pCtx = pCanvas.getContext('2d');
        pCtx.fillStyle = c1; pCtx.fillRect(0, 0, 20, 20);
        pCtx.strokeStyle = c2; pCtx.lineWidth = 6;
        pCtx.beginPath();
        pCtx.moveTo(-5, 25); pCtx.lineTo(25, -5);
        pCtx.moveTo(-5, 5); pCtx.lineTo(5, -5);
        pCtx.moveTo(15, 25); pCtx.lineTo(25, 15);
        pCtx.stroke();
        return ctx.createPattern(pCanvas, 'repeat');
    };

    // ===== seededRand =====
    C.seededRand = function (seed) {
        var s = seed;
        return function () { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    };

    // ===== Font String Builders =====
    C.getBadgeFont = function () {
        var weight = state.badgeBold ? '700' : '400';
        var italic = state.badgeItalic ? 'italic ' : '';
        return italic + weight + ' ' + state.badgeSize + "px '" + state.badgeFont + "', sans-serif";
    };

    C.getStoreFont = function () {
        var weight = state.storeBold ? '700' : '400';
        var italic = state.storeItalic ? 'italic ' : '';
        return italic + weight + ' ' + state.storeSize + "px '" + state.storeFont + "', sans-serif";
    };

    C.getDiagFont = function (size) {
        var style = state.diagItalic ? 'italic ' : '';
        var weight = state.diagBold ? '700' : '400';
        return style + weight + ' ' + size + "px '" + (state.diagFont || 'Inter') + "', sans-serif";
    };

    // ===== positionToXY =====
    C.positionToXY = function (position) {
        var m = 10;
        switch (position) {
            case 'top-left': return { x: m, y: m };
            case 'top-right': return { x: SIZE - 200, y: m };
            case 'top-center': return { x: SIZE / 2 - 100, y: m };
            case 'bottom-left': return { x: m, y: SIZE - 50 };
            case 'bottom-right': return { x: SIZE - 200, y: SIZE - 50 };
            case 'bottom-center': return { x: SIZE / 2 - 100, y: SIZE - 50 };
            default: return { x: m, y: SIZE - 50 };
        }
    };

})(window.Creator);
