// ===== Visual Style Effects & Border Fill =====
(function (C) {
    var ctx = C.ctx;
    var SIZE = C.SIZE;
    var state = C.state;

    // ===== Visual Style Effects =====
    C.getStyleFx = function () {
        var vs = state.visualStyle;
        return {
            borderShadow:
                vs === 'neo-brutal' ? { x: 5, y: 5, blur: 0, color: '#000' }
                    : vs === 'emboss' ? { x: 3, y: 3, blur: 6, color: 'rgba(0,0,0,0.5)' }
                        : vs === 'neon' ? { x: 0, y: 0, blur: 20, color: state.color1 }
                            : vs === 'metallic' ? { x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.4)' }
                                : vs === 'luxury' ? { x: 3, y: 3, blur: 10, color: 'rgba(0,0,0,0.5)' }
                                    : vs === 'grunge' ? { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.6)' }
                                        : vs === 'comic' ? { x: 6, y: 6, blur: 0, color: '#000' }
                                            : null,

            borderOutline:
                vs === 'neo-brutal' ? { width: 4, color: '#000' }
                    : vs === 'stamp' ? { width: 3, color: state.color1 }
                        : vs === 'outline' ? { width: 3, color: state.color1 }
                            : vs === 'comic' ? { width: 5, color: '#000' }
                                : null,

            borderHighlight:
                vs === 'emboss' ? { offset: -2, color: 'rgba(255,255,255,0.4)' }
                    : vs === 'metallic' ? { offset: -1, color: 'rgba(255,255,255,0.6)' }
                        : vs === 'luxury' ? { offset: -1, color: 'rgba(255,215,0,0.3)' }
                            : null,

            badgeRadius:
                vs === 'neo-brutal' ? 0
                    : vs === 'retro' ? 20
                        : vs === 'stamp' ? 2
                            : vs === 'comic' ? 0
                                : vs === 'pastel' ? 12
                                    : 5,

            badgeShadow:
                vs === 'neo-brutal' ? { x: 4, y: 4, blur: 0, color: '#000' }
                    : vs === 'emboss' ? { x: 2, y: 3, blur: 5, color: 'rgba(0,0,0,0.5)' }
                        : vs === 'neon' ? { x: 0, y: 0, blur: 12, color: null }
                            : vs === 'metallic' ? { x: 1, y: 2, blur: 6, color: 'rgba(0,0,0,0.4)' }
                                : vs === 'comic' ? { x: 5, y: 5, blur: 0, color: '#000' }
                                    : vs === 'luxury' ? { x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.5)' }
                                        : vs === 'pastel' ? { x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.15)' }
                                            : { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.3)' },

            badgeOutline:
                vs === 'neo-brutal' ? { width: 3, color: '#000' }
                    : vs === 'stamp' ? { width: 2, color: 'rgba(255,255,255,0.3)' }
                        : vs === 'outline' ? { width: 2, color: '#fff' }
                            : vs === 'comic' ? { width: 4, color: '#000' }
                                : null,

            textShadow:
                vs === 'emboss' ? { x: 1, y: 1, blur: 0, color: 'rgba(0,0,0,0.5)' }
                    : vs === 'neon' ? { x: 0, y: 0, blur: 8, color: '#fff' }
                        : vs === 'luxury' ? { x: 1, y: 1, blur: 3, color: 'rgba(0,0,0,0.5)' }
                            : null,

            textStroke:
                vs === 'neo-brutal' ? { width: 2, color: '#000' }
                    : vs === 'stamp' ? { width: 1, color: 'rgba(0,0,0,0.3)' }
                        : vs === 'comic' ? { width: 3, color: '#000' }
                            : vs === 'outline' ? { width: 2, color: 'rgba(0,0,0,0.5)' }
                                : null,

            borderDash:
                vs === 'stamp' ? [12, 6]
                    : vs === 'grunge' ? [6, 3]
                        : null,

            borderExtraThickness:
                vs === 'neo-brutal' ? 1.3
                    : vs === 'stamp' ? 0.8
                        : vs === 'comic' ? 1.4
                            : vs === 'outline' ? 0.6
                                : vs === 'pastel' ? 1.1
                                    : 1,

            retroOverlay: vs === 'retro',
            metallicShimmer: vs === 'metallic' || vs === 'luxury',
            neonGlow: vs === 'neon',
            outlineOnly: vs === 'outline',
            comicHalftone: vs === 'comic',
            luxuryColors: vs === 'luxury',
            grungeNoise: vs === 'grunge',
            pastelSoften: vs === 'pastel',

            badgeTextColor:
                vs === 'pastel' ? 'rgba(0,0,0,0.7)'
                    : vs === 'luxury' ? '#fff'
                        : '#fff',

            badgeBgAlpha:
                vs === 'pastel' ? 0.6
                    : vs === 'outline' ? 0
                        : 1,
        };
    };

    // ===== Fill Helpers =====
    C.getBorderFill = function () {
        var fx = C.getStyleFx();
        if (fx.luxuryColors) {
            var grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
            grad.addColorStop(0, '#d4af37');
            grad.addColorStop(0.5, '#f5e6a3');
            grad.addColorStop(1, '#b8860b');
            return grad;
        }
        if (state.fillMode === 'gradient') {
            var grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
            grad.addColorStop(0, state.color1);
            grad.addColorStop(1, state.color2);
            return grad;
        }
        if (state.fillMode === 'stripes') {
            return C.makeStripePattern(state.color1, state.color2);
        }
        if (fx.pastelSoften) {
            return C.lightenColor(state.color1, 0.4);
        }
        return state.color1;
    };

    // ===== Styled Border Drawing =====
    C.applyBorderEffects = function (drawFn) {
        var fx = C.getStyleFx();
        var t = state.thickness * fx.borderExtraThickness;
        var fill = C.getBorderFill();
        var accent = fx.luxuryColors ? '#f5e6a3' : state.accent;

        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        if (state.borderRotate) ctx.rotate(state.borderRotate * Math.PI / 180);
        if (state.borderFlipH) ctx.scale(-1, 1);
        if (state.borderFlipV) ctx.scale(1, -1);
        ctx.translate(-SIZE / 2, -SIZE / 2);

        if (fx.borderDash) ctx.setLineDash(fx.borderDash);

        if (fx.neonGlow) {
            ctx.save();
            ctx.shadowColor = state.color1;
            ctx.shadowBlur = 25;
            drawFn(t, fill, accent);
            ctx.restore();
            drawFn(t, fill, accent);
        } else if (fx.borderShadow) {
            ctx.shadowColor = fx.borderShadow.color;
            ctx.shadowBlur = fx.borderShadow.blur;
            ctx.shadowOffsetX = fx.borderShadow.x;
            ctx.shadowOffsetY = fx.borderShadow.y;
            drawFn(t, fill, accent);
            ctx.shadowColor = 'transparent';
        } else {
            drawFn(t, fill, accent);
        }

        if (fx.borderHighlight) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.3;
            ctx.translate(fx.borderHighlight.offset, fx.borderHighlight.offset);
            drawFn(t * 0.5, fx.borderHighlight.color, 'transparent');
            ctx.restore();
        }

        if (fx.metallicShimmer) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.15;
            var shimmer = ctx.createLinearGradient(0, 0, SIZE, SIZE);
            shimmer.addColorStop(0, '#fff');
            shimmer.addColorStop(0.3, 'transparent');
            shimmer.addColorStop(0.5, '#fff');
            shimmer.addColorStop(0.7, 'transparent');
            shimmer.addColorStop(1, '#fff');
            drawFn(t, shimmer, 'transparent');
            ctx.restore();
        }

        if (fx.grungeNoise) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.08;
            for (var i = 0; i < 600; i++) {
                var x = Math.random() * SIZE;
                var y = Math.random() * SIZE;
                ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
                ctx.fillRect(x, y, 2, 2);
            }
            ctx.restore();
        }

        ctx.restore();
        ctx.setLineDash([]);
    };

})(window.Creator);
