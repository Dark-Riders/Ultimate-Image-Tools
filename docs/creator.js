// ===== Font List (25+ Google Fonts) =====
const FONT_LIST = [
    'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Oswald',
    'Bebas Neue', 'Anton', 'Permanent Marker', 'Bangers', 'Righteous',
    'Fredoka One', 'Luckiest Guy', 'Passion One', 'Russo One', 'Black Ops One',
    'Bungee', 'Lilita One', 'Fugaz One', 'Pacifico', 'Lobster',
    'Satisfy', 'Dancing Script', 'Caveat', 'Press Start 2P', 'Silkscreen',
    'Space Mono', 'Archivo Black',
];

// ===== Creator State =====
const creator = {
    style: 'simple',
    visualStyle: 'flat',
    fillMode: 'solid',
    color1: '#e63946',
    color2: '#1d3557',
    accent: '#f4a261',
    thickness: 14,
    badges: [],
    storeName: '',
    // Badge typography
    badgeFont: 'Inter',
    badgeBold: true,
    badgeItalic: false,
    badgeSize: 18,
    // Store name typography
    storeFont: 'Inter',
    storeBold: true,
    storeItalic: false,
    storeSize: 20,
};

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom-center', 'top-center'];

const BADGE_PRESETS = [
    { emoji: '🚚', text: 'GRATIS ONGKIR', color: '#d62828', position: 'bottom-center' },
    { emoji: '💰', text: 'BAYAR DITEMPAT', color: '#c1121f', position: 'bottom-left' },
    { emoji: '🛒', text: 'BISA COD', color: '#e63946', position: 'bottom-left' },
    { emoji: '⭐', text: 'SPECIAL DISCOUNT', color: '#e76f51', position: 'bottom-right' },
    { emoji: '✅', text: 'HARGA MURAH', color: '#2a9d8f', position: 'top-right' },
    { emoji: '🔥', text: 'BEST SELLER', color: '#e85d04', position: 'top-right' },
    { emoji: '💎', text: 'PREMIUM QUALITY', color: '#7209b7', position: 'top-left' },
    { emoji: '🏷️', text: 'PROMO', color: '#f77f00', position: 'top-center' },
    { emoji: '📦', text: 'READY STOCK', color: '#0077b6', position: 'top-left' },
    { emoji: '💯', text: 'ORIGINAL 100%', color: '#38b000', position: 'top-right' },
    { emoji: '🎁', text: 'BONUS GIFT', color: '#9d4edd', position: 'bottom-right' },
    { emoji: '⚡', text: 'FLASH SALE', color: '#ff006e', position: 'top-center' },
];

const canvas = document.getElementById('creator-canvas');
const ctx = canvas.getContext('2d');
const SIZE = 800;

// ===== DOM =====
const color1Input = document.getElementById('cr-color1');
const color2Input = document.getElementById('cr-color2');
const accentInput = document.getElementById('cr-accent');
const thicknessInput = document.getElementById('cr-thickness');
const thicknessVal = document.getElementById('cr-thickness-val');
const storeNameInput = document.getElementById('cr-store-name');
const visualStyleSelect = document.getElementById('cr-visual-style');
const btnExport = document.getElementById('btn-export');
const btnAddBadge = document.getElementById('btn-add-badge');
const badgeListEl = document.getElementById('badge-list');
const badgePresetsEl = document.getElementById('badge-presets');

// Typography DOM
const badgeFontSelect = document.getElementById('cr-badge-font');
const badgeBoldBtn = document.getElementById('cr-badge-bold');
const badgeItalicBtn = document.getElementById('cr-badge-italic');
const badgeSizeInput = document.getElementById('cr-badge-size');
const badgeSizeVal = document.getElementById('cr-badge-size-val');
const storeFontSelect = document.getElementById('cr-store-font');
const storeBoldBtn = document.getElementById('cr-store-bold');
const storeItalicBtn = document.getElementById('cr-store-italic');
const storeSizeInput = document.getElementById('cr-store-size');
const storeSizeVal = document.getElementById('cr-store-size-val');

// ===== Populate Font Selects =====
function populateFontSelects() {
    [badgeFontSelect, storeFontSelect].forEach(sel => {
        sel.innerHTML = '';
        FONT_LIST.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.style.fontFamily = `'${f}', sans-serif`;
            sel.appendChild(opt);
        });
    });
    badgeFontSelect.value = creator.badgeFont;
    storeFontSelect.value = creator.storeFont;
}
populateFontSelects();

// ===== Controls =====

// Visual style
visualStyleSelect.addEventListener('change', e => { creator.visualStyle = e.target.value; render(); });

// Border style
document.querySelectorAll('#border-style-grid .style-card').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#border-style-grid .style-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        creator.style = btn.dataset.style;
        render();
    });
});

// Fill mode
document.querySelectorAll('.fill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.fill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        creator.fillMode = btn.dataset.fill;
        render();
    });
});

// Colors
color1Input.addEventListener('input', e => { creator.color1 = e.target.value; render(); });
color2Input.addEventListener('input', e => { creator.color2 = e.target.value; render(); });
accentInput.addEventListener('input', e => { creator.accent = e.target.value; render(); });

// Thickness
thicknessInput.addEventListener('input', e => {
    creator.thickness = parseInt(e.target.value);
    thicknessVal.textContent = creator.thickness;
    render();
});

// Store name
storeNameInput.addEventListener('input', e => { creator.storeName = e.target.value; render(); });

// Badge typography
badgeFontSelect.addEventListener('change', e => { creator.badgeFont = e.target.value; render(); });
badgeSizeInput.addEventListener('input', e => {
    creator.badgeSize = parseInt(e.target.value);
    badgeSizeVal.textContent = creator.badgeSize;
    render();
});
badgeBoldBtn.addEventListener('click', () => {
    creator.badgeBold = !creator.badgeBold;
    badgeBoldBtn.classList.toggle('active', creator.badgeBold);
    render();
});
badgeItalicBtn.addEventListener('click', () => {
    creator.badgeItalic = !creator.badgeItalic;
    badgeItalicBtn.classList.toggle('active', creator.badgeItalic);
    render();
});

// Store name typography
storeFontSelect.addEventListener('change', e => { creator.storeFont = e.target.value; render(); });
storeSizeInput.addEventListener('input', e => {
    creator.storeSize = parseInt(e.target.value);
    storeSizeVal.textContent = creator.storeSize;
    render();
});
storeBoldBtn.addEventListener('click', () => {
    creator.storeBold = !creator.storeBold;
    storeBoldBtn.classList.toggle('active', creator.storeBold);
    render();
});
storeItalicBtn.addEventListener('click', () => {
    creator.storeItalic = !creator.storeItalic;
    storeItalicBtn.classList.toggle('active', creator.storeItalic);
    render();
});

// Export
btnExport.addEventListener('click', () => {
    const link = document.createElement('a');
    const name = creator.storeName
        ? creator.storeName.toLowerCase().replace(/\s+/g, '_') + '_watermark.png'
        : 'watermark.png';
    link.download = name;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// ===== Badge Management =====
btnAddBadge.addEventListener('click', () => {
    creator.badges.push({ emoji: '', text: '', color: '#d62828', position: 'bottom-center' });
    renderBadgeControls();
    render();
});

function addPresetBadge(preset) {
    creator.badges.push({ ...preset });
    renderBadgeControls();
    render();
}

function renderPresetButtons() {
    badgePresetsEl.innerHTML = '';
    BADGE_PRESETS.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'preset-badge-btn';
        btn.style.background = preset.color;
        btn.textContent = `${preset.emoji} ${preset.text}`;
        btn.title = `Add "${preset.text}" badge`;
        btn.addEventListener('click', () => addPresetBadge(preset));
        badgePresetsEl.appendChild(btn);
    });
}
renderPresetButtons();

function renderBadgeControls() {
    badgeListEl.innerHTML = '';
    creator.badges.forEach((badge, i) => {
        const row = document.createElement('div');
        row.className = 'badge-row';
        row.innerHTML = `
      <input type="text" class="badge-emoji-input" value="${badge.emoji}" title="Emoji" maxlength="4">
      <input type="text" class="badge-text-input" value="${badge.text}" placeholder="Badge text">
      <input type="color" class="badge-color-input" value="${badge.color}" title="Badge color">
      <select class="badge-pos-select">
        ${POSITIONS.map(p => `<option value="${p}" ${p === badge.position ? 'selected' : ''}>${p.replace('-', ' ')}</option>`).join('')}
      </select>
      <button class="badge-remove" title="Remove">✕</button>
    `;
        row.querySelector('.badge-emoji-input').addEventListener('input', e => { creator.badges[i].emoji = e.target.value; render(); });
        row.querySelector('.badge-text-input').addEventListener('input', e => { creator.badges[i].text = e.target.value; render(); });
        row.querySelector('.badge-color-input').addEventListener('input', e => { creator.badges[i].color = e.target.value; render(); });
        row.querySelector('.badge-pos-select').addEventListener('change', e => { creator.badges[i].position = e.target.value; render(); });
        row.querySelector('.badge-remove').addEventListener('click', () => { creator.badges.splice(i, 1); renderBadgeControls(); render(); });
        badgeListEl.appendChild(row);
    });
}

// ===== Font String Builders =====
function getBadgeFont() {
    const weight = creator.badgeBold ? '700' : '400';
    const italic = creator.badgeItalic ? 'italic ' : '';
    return `${italic}${weight} ${creator.badgeSize}px '${creator.badgeFont}', sans-serif`;
}

function getStoreFont() {
    const weight = creator.storeBold ? '700' : '400';
    const italic = creator.storeItalic ? 'italic ' : '';
    return `${italic}${weight} ${creator.storeSize}px '${creator.storeFont}', sans-serif`;
}

// ===== Visual Style Effects =====
function getStyleFx() {
    const vs = creator.visualStyle;
    return {
        // Border effects
        borderShadow:
            vs === 'neo-brutal' ? { x: 5, y: 5, blur: 0, color: '#000' }
                : vs === 'emboss' ? { x: 3, y: 3, blur: 6, color: 'rgba(0,0,0,0.5)' }
                    : vs === 'neon' ? { x: 0, y: 0, blur: 20, color: creator.color1 }
                        : vs === 'metallic' ? { x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.4)' }
                            : vs === 'luxury' ? { x: 3, y: 3, blur: 10, color: 'rgba(0,0,0,0.5)' }
                                : vs === 'grunge' ? { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.6)' }
                                    : vs === 'comic' ? { x: 6, y: 6, blur: 0, color: '#000' }
                                        : null,

        borderOutline:
            vs === 'neo-brutal' ? { width: 4, color: '#000' }
                : vs === 'stamp' ? { width: 3, color: creator.color1 }
                    : vs === 'outline' ? { width: 3, color: creator.color1 }
                        : vs === 'comic' ? { width: 5, color: '#000' }
                            : null,

        borderHighlight:
            vs === 'emboss' ? { offset: -2, color: 'rgba(255,255,255,0.4)' }
                : vs === 'metallic' ? { offset: -1, color: 'rgba(255,255,255,0.6)' }
                    : vs === 'luxury' ? { offset: -1, color: 'rgba(255,215,0,0.3)' }
                        : null,

        // Badge modifications
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

        // Text effects
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

        // Global modifiers
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

        // Special effects
        retroOverlay: vs === 'retro',
        metallicShimmer: vs === 'metallic' || vs === 'luxury',
        neonGlow: vs === 'neon',
        outlineOnly: vs === 'outline',
        comicHalftone: vs === 'comic',
        luxuryColors: vs === 'luxury',
        grungeNoise: vs === 'grunge',
        pastelSoften: vs === 'pastel',

        // Badge text color override
        badgeTextColor:
            vs === 'pastel' ? 'rgba(0,0,0,0.7)'
                : vs === 'luxury' ? '#fff'
                    : '#fff',

        // Badge bg modifier
        badgeBgAlpha:
            vs === 'pastel' ? 0.6
                : vs === 'outline' ? 0
                    : 1,
    };
}

// ===== Fill Helpers =====
function getBorderFill() {
    const fx = getStyleFx();
    if (fx.luxuryColors) {
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, '#d4af37');
        grad.addColorStop(0.5, '#f5e6a3');
        grad.addColorStop(1, '#b8860b');
        return grad;
    }
    if (creator.fillMode === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, creator.color1);
        grad.addColorStop(1, creator.color2);
        return grad;
    }
    if (creator.fillMode === 'stripes') {
        return makeStripePattern(creator.color1, creator.color2);
    }
    if (fx.pastelSoften) {
        return lightenColor(creator.color1, 0.4);
    }
    return creator.color1;
}

function makeStripePattern(c1, c2) {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 20; pCanvas.height = 20;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = c1; pCtx.fillRect(0, 0, 20, 20);
    pCtx.strokeStyle = c2; pCtx.lineWidth = 6;
    pCtx.beginPath();
    pCtx.moveTo(-5, 25); pCtx.lineTo(25, -5);
    pCtx.moveTo(-5, 5); pCtx.lineTo(5, -5);
    pCtx.moveTo(15, 25); pCtx.lineTo(25, 15);
    pCtx.stroke();
    return ctx.createPattern(pCanvas, 'repeat');
}

function lightenColor(hex, amount) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.round(r + (255 - r) * amount);
    const lg = Math.round(g + (255 - g) * amount);
    const lb = Math.round(b + (255 - b) * amount);
    return `rgb(${lr},${lg},${lb})`;
}

// ===== Styled Border Drawing =====
function applyBorderEffects(drawFn) {
    const fx = getStyleFx();
    const t = creator.thickness * fx.borderExtraThickness;
    const fill = getBorderFill();
    const accent = fx.luxuryColors ? '#f5e6a3' : creator.accent;

    ctx.save();
    if (fx.borderDash) ctx.setLineDash(fx.borderDash);

    if (fx.neonGlow) {
        ctx.save();
        ctx.shadowColor = creator.color1;
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
        const shimmer = ctx.createLinearGradient(0, 0, SIZE, SIZE);
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
        for (let i = 0; i < 600; i++) {
            const x = Math.random() * SIZE;
            const y = Math.random() * SIZE;
            ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.restore();
    }

    ctx.restore();
    ctx.setLineDash([]);
}

// ===== Render =====
function render() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const fx = getStyleFx();

    const borderDrawFns = {
        simple: drawSimple, double: drawDouble, angular: drawAngular,
        corners: drawCorners, layered: drawLayered, bracket: drawBracket,
        rounded: drawRounded, inset: drawInset,
        wavy: drawWavy, scalloped: drawScalloped, zigzag: drawZigzag,
        dotted: drawDotted, filmstrip: drawFilmstrip, ticket: drawTicket,
        chain: drawChain, crossStitch: drawCrossStitch,
        arrow: drawArrow, rope: drawRope, network: drawNetwork,
        geoBlocks: drawGeoBlocks, bubbles: drawBubbles, mosaic: drawMosaic,
        floral: drawFloral, pixelArt: drawPixelArt, confetti: drawConfetti,
        woven: drawWoven, circuit: drawCircuit,
        starBurst: drawStarBurst, hearts: drawHearts, leaves: drawLeaves,
        lightning: drawLightning, waves3D: drawWaves3D, triangles: drawTriangles,
        spiral: drawSpiral, dna: drawDna, barcode: drawBarcode,
        gradientFade: drawGradientFade, honeycomb: drawHoneycomb,
        splatter: drawSplatter, ribbon: drawRibbon,
    };

    applyBorderEffects(borderDrawFns[creator.style] || drawSimple);

    if (fx.retroOverlay) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(255,248,220,0.15)';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.restore();
    }

    drawAllBadges();
    if (creator.storeName) drawStoreName();
}

// ===== 8 Border Styles =====
function drawSimple(t, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
}

function drawDouble(t, fill) {
    const gap = t * 1.5;
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
    ctx.lineWidth = t * 0.5;
    ctx.strokeRect(t + gap, t + gap, SIZE - 2 * (t + gap), SIZE - 2 * (t + gap));
}

function drawAngular(t, fill, accent) {
    const cut = t * 3;
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
        .forEach(([x1, y1, x2, y2, x3, y3]) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
        });
    ctx.globalAlpha = 1;
}

function drawCorners(t, fill) {
    const len = SIZE * 0.22;
    ctx.strokeStyle = fill; ctx.lineWidth = t; ctx.lineCap = 'square';
    [[t / 2, len, t / 2, t / 2, len, t / 2], [SIZE - len, t / 2, SIZE - t / 2, t / 2, SIZE - t / 2, len],
    [SIZE - t / 2, SIZE - len, SIZE - t / 2, SIZE - t / 2, SIZE - len, SIZE - t / 2],
    [len, SIZE - t / 2, t / 2, SIZE - t / 2, t / 2, SIZE - len]]
        .forEach(([x1, y1, x2, y2, x3, y3]) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
        });
}

function drawLayered(t, fill, accent) {
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]); const g = t + 6;
    ctx.strokeRect(g, g, SIZE - g * 2, SIZE - g * 2);
    ctx.setLineDash([]);
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5; const g2 = t + 14;
    ctx.strokeRect(g2, g2, SIZE - g2 * 2, SIZE - g2 * 2);
}

function drawBracket(t, fill, accent) {
    const armLen = SIZE * 0.22, midLen = SIZE * 0.15;
    ctx.strokeStyle = fill; ctx.lineWidth = t; ctx.lineCap = 'square';
    [[t / 2, armLen, t / 2, t / 2, armLen, t / 2], [SIZE - armLen, t / 2, SIZE - t / 2, t / 2, SIZE - t / 2, armLen],
    [SIZE - t / 2, SIZE - armLen, SIZE - t / 2, SIZE - t / 2, SIZE - armLen, SIZE - t / 2],
    [armLen, SIZE - t / 2, t / 2, SIZE - t / 2, t / 2, SIZE - armLen]]
        .forEach(([x1, y1, x2, y2, x3, y3]) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
        });
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.6; const c = SIZE / 2;
    [[c - midLen, t / 2, c + midLen, t / 2], [c - midLen, SIZE - t / 2, c + midLen, SIZE - t / 2],
    [t / 2, c - midLen, t / 2, c + midLen], [SIZE - t / 2, c - midLen, SIZE - t / 2, c + midLen]]
        .forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
}

function drawRounded(t, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    roundRect(ctx, t / 2, t / 2, SIZE - t, SIZE - t, t * 3); ctx.stroke();
}

function drawInset(t, fill, accent) {
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
    const d = t * 2.5; ctx.strokeStyle = accent; ctx.lineWidth = t * 0.6;
    [[0, d, d, 0], [SIZE - d, 0, SIZE, d], [SIZE, SIZE - d, SIZE - d, SIZE], [d, SIZE, 0, SIZE - d]]
        .forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    const ds = t * 0.8; ctx.fillStyle = accent;
    [[t * 1.5, t * 1.5], [SIZE - t * 1.5, t * 1.5], [SIZE - t * 1.5, SIZE - t * 1.5], [t * 1.5, SIZE - t * 1.5]]
        .forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy - ds); ctx.lineTo(cx + ds, cy); ctx.lineTo(cx, cy + ds); ctx.lineTo(cx - ds, cy);
            ctx.closePath(); ctx.fill();
        });
}

// ===== 12 New Border Styles =====

function drawWavy(t, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    const waves = 12; const amp = t * 1.8;
    // Top
    ctx.beginPath();
    for (let i = 0; i <= waves; i++) {
        const x = (i / waves) * SIZE;
        const y = t + (i % 2 === 0 ? -amp : amp);
        i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo((x + ((i - 1) / waves) * SIZE) / 2, t + (i % 2 === 0 ? amp : -amp), x, y);
    }
    ctx.stroke();
    // Bottom
    ctx.beginPath();
    for (let i = 0; i <= waves; i++) {
        const x = (i / waves) * SIZE;
        const y = SIZE - t + (i % 2 === 0 ? -amp : amp);
        i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo((x + ((i - 1) / waves) * SIZE) / 2, SIZE - t + (i % 2 === 0 ? amp : -amp), x, y);
    }
    ctx.stroke();
    // Left
    ctx.beginPath();
    for (let i = 0; i <= waves; i++) {
        const y = (i / waves) * SIZE;
        const x = t + (i % 2 === 0 ? -amp : amp);
        i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(t + (i % 2 === 0 ? amp : -amp), (y + ((i - 1) / waves) * SIZE) / 2, x, y);
    }
    ctx.stroke();
    // Right
    ctx.beginPath();
    for (let i = 0; i <= waves; i++) {
        const y = (i / waves) * SIZE;
        const x = SIZE - t + (i % 2 === 0 ? amp : -amp);
        i === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(SIZE - t + (i % 2 === 0 ? -amp : amp), (y + ((i - 1) / waves) * SIZE) / 2, x, y);
    }
    ctx.stroke();
}

function drawScalloped(t, fill, accent) {
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.6;
    const count = 10; const r = SIZE / (count * 2);
    // Top edge
    for (let i = 0; i < count; i++) {
        const cx = r + i * r * 2;
        ctx.beginPath(); ctx.arc(cx, t, r, Math.PI, 0, false); ctx.stroke();
    }
    // Bottom edge
    for (let i = 0; i < count; i++) {
        const cx = r + i * r * 2;
        ctx.beginPath(); ctx.arc(cx, SIZE - t, r, 0, Math.PI, false); ctx.stroke();
    }
    // Left edge
    for (let i = 0; i < count; i++) {
        const cy = r + i * r * 2;
        ctx.beginPath(); ctx.arc(t, cy, r, Math.PI * 1.5, Math.PI * 0.5, false); ctx.stroke();
    }
    // Right edge
    for (let i = 0; i < count; i++) {
        const cy = r + i * r * 2;
        ctx.beginPath(); ctx.arc(SIZE - t, cy, r, Math.PI * 0.5, Math.PI * 1.5, false); ctx.stroke();
    }
    // Corner dots
    ctx.fillStyle = accent;
    [[t, t], [SIZE - t, t], [SIZE - t, SIZE - t], [t, SIZE - t]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, t * 0.6, 0, Math.PI * 2); ctx.fill();
    });
}

function drawZigzag(t, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.7;
    const teeth = 16; const step = SIZE / teeth; const amp = t * 2;
    // Top
    ctx.beginPath(); ctx.moveTo(0, t);
    for (let i = 0; i < teeth; i++) {
        ctx.lineTo(step * i + step / 2, t - amp);
        ctx.lineTo(step * (i + 1), t);
    }
    ctx.stroke();
    // Bottom
    ctx.beginPath(); ctx.moveTo(0, SIZE - t);
    for (let i = 0; i < teeth; i++) {
        ctx.lineTo(step * i + step / 2, SIZE - t + amp);
        ctx.lineTo(step * (i + 1), SIZE - t);
    }
    ctx.stroke();
    // Left
    ctx.beginPath(); ctx.moveTo(t, 0);
    for (let i = 0; i < teeth; i++) {
        ctx.lineTo(t - amp, step * i + step / 2);
        ctx.lineTo(t, step * (i + 1));
    }
    ctx.stroke();
    // Right
    ctx.beginPath(); ctx.moveTo(SIZE - t, 0);
    for (let i = 0; i < teeth; i++) {
        ctx.lineTo(SIZE - t + amp, step * i + step / 2);
        ctx.lineTo(SIZE - t, step * (i + 1));
    }
    ctx.stroke();
}

function drawDotted(t, fill) {
    ctx.fillStyle = fill;
    const spacing = t * 2.5; const r = t * 0.6;
    const count = Math.floor(SIZE / spacing);
    for (let i = 0; i <= count; i++) {
        const pos = i * spacing;
        // Top & Bottom
        ctx.beginPath(); ctx.arc(pos, t, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pos, SIZE - t, r, 0, Math.PI * 2); ctx.fill();
        // Left & Right
        ctx.beginPath(); ctx.arc(t, pos, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(SIZE - t, pos, r, 0, Math.PI * 2); ctx.fill();
    }
}

function drawFilmstrip(t, fill, accent) {
    const borderW = t * 2.5;
    ctx.fillStyle = fill;
    // Left stripe
    ctx.fillRect(0, 0, borderW, SIZE);
    // Right stripe
    ctx.fillRect(SIZE - borderW, 0, borderW, SIZE);
    // Sprocket holes
    ctx.fillStyle = accent;
    const holeH = t * 0.8; const holeW = t * 1.2; const gap = t * 2;
    for (let y = gap; y < SIZE - gap; y += gap + holeH) {
        // Left holes
        roundRect(ctx, borderW * 0.2, y, holeW, holeH, 2); ctx.fill();
        // Right holes
        roundRect(ctx, SIZE - borderW * 0.2 - holeW, y, holeW, holeH, 2); ctx.fill();
    }
    // Top & bottom bars
    ctx.fillStyle = fill;
    ctx.fillRect(borderW, 0, SIZE - borderW * 2, t);
    ctx.fillRect(borderW, SIZE - t, SIZE - borderW * 2, t);
}

function drawTicket(t, fill, accent) {
    const notchR = t * 2;
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.setLineDash([t * 0.4, t * 0.4]);
    roundRect(ctx, t / 2, t / 2, SIZE - t, SIZE - t, t * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);
    // Punch-out notches (clear circles on sides)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    [[0, SIZE / 2], [SIZE, SIZE / 2], [SIZE / 2, 0], [SIZE / 2, SIZE]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, notchR, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    // Re-draw notch borders
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4;
    [[0, SIZE / 2], [SIZE, SIZE / 2], [SIZE / 2, 0], [SIZE / 2, SIZE]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, notchR, 0, Math.PI * 2); ctx.stroke();
    });
}

function drawChain(t, fill, accent) {
    // Outer border
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
    ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
    // Chain links along all edges
    const linkW = t * 2; const linkH = t * 1;
    const spacing = linkW * 1.6;
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.35;
    for (let pos = spacing; pos < SIZE - spacing; pos += spacing) {
        // Top edge links
        ctx.beginPath(); ctx.ellipse(pos, t, linkW / 2, linkH / 2, 0, 0, Math.PI * 2); ctx.stroke();
        // Bottom edge links
        ctx.beginPath(); ctx.ellipse(pos, SIZE - t, linkW / 2, linkH / 2, 0, 0, Math.PI * 2); ctx.stroke();
        // Left edge links
        ctx.beginPath(); ctx.ellipse(t, pos, linkH / 2, linkW / 2, 0, 0, Math.PI * 2); ctx.stroke();
        // Right edge links
        ctx.beginPath(); ctx.ellipse(SIZE - t, pos, linkH / 2, linkW / 2, 0, 0, Math.PI * 2); ctx.stroke();
    }
}

function drawCrossStitch(t, fill, accent) {
    // Outer border
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
    ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
    // Cross stitches along all edges
    const xSize = t * 1.2;
    const spacing = xSize * 2;
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.35; ctx.lineCap = 'round';
    for (let i = t; i < SIZE - t; i += spacing) {
        // Top edge stitches
        ctx.beginPath(); ctx.moveTo(i, t * 0.3); ctx.lineTo(i + xSize, t * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + xSize, t * 0.3); ctx.lineTo(i, t * 1.5); ctx.stroke();
        // Bottom edge stitches
        ctx.beginPath(); ctx.moveTo(i, SIZE - t * 0.3); ctx.lineTo(i + xSize, SIZE - t * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + xSize, SIZE - t * 0.3); ctx.lineTo(i, SIZE - t * 1.5); ctx.stroke();
    }
    for (let i = t; i < SIZE - t; i += spacing) {
        // Left edge stitches
        ctx.beginPath(); ctx.moveTo(t * 0.3, i); ctx.lineTo(t * 1.5, i + xSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(t * 0.3, i + xSize); ctx.lineTo(t * 1.5, i); ctx.stroke();
        // Right edge stitches
        ctx.beginPath(); ctx.moveTo(SIZE - t * 0.3, i); ctx.lineTo(SIZE - t * 1.5, i + xSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(SIZE - t * 0.3, i + xSize); ctx.lineTo(SIZE - t * 1.5, i); ctx.stroke();
    }
}

function drawArrow(t, fill, accent) {
    // Outer border
    ctx.strokeStyle = fill; ctx.lineWidth = t;
    ctx.strokeRect(t / 2, t / 2, SIZE - t, SIZE - t);
    // Arrow chevrons along edges
    const arrowSize = t * 1.5;
    const spacing = arrowSize * 2.5;
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4; ctx.lineCap = 'round';
    for (let pos = spacing; pos < SIZE - spacing; pos += spacing) {
        // Top edge arrows (pointing right)
        ctx.beginPath(); ctx.moveTo(pos - arrowSize / 2, t * 0.2); ctx.lineTo(pos + arrowSize / 2, t);
        ctx.lineTo(pos - arrowSize / 2, t * 1.8); ctx.stroke();
        // Bottom edge arrows (pointing left)
        ctx.beginPath(); ctx.moveTo(pos + arrowSize / 2, SIZE - t * 0.2); ctx.lineTo(pos - arrowSize / 2, SIZE - t);
        ctx.lineTo(pos + arrowSize / 2, SIZE - t * 1.8); ctx.stroke();
        // Left edge arrows (pointing down)
        ctx.beginPath(); ctx.moveTo(t * 0.2, pos - arrowSize / 2); ctx.lineTo(t, pos + arrowSize / 2);
        ctx.lineTo(t * 1.8, pos - arrowSize / 2); ctx.stroke();
        // Right edge arrows (pointing up)
        ctx.beginPath(); ctx.moveTo(SIZE - t * 0.2, pos + arrowSize / 2); ctx.lineTo(SIZE - t, pos - arrowSize / 2);
        ctx.lineTo(SIZE - t * 1.8, pos + arrowSize / 2); ctx.stroke();
    }
}

function drawRope(t, fill, accent) {
    // Thick dashed "twist" layer
    ctx.strokeStyle = fill; ctx.lineWidth = t * 1.2;
    ctx.setLineDash([t * 1.5, t * 0.8]);
    ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
    // Offset thin dash for rope texture
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.4;
    ctx.setLineDash([t * 0.8, t * 1.5]);
    ctx.lineDashOffset = t;
    ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    // Knot circles at corners
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
    [[t * 1.5, t * 1.5], [SIZE - t * 1.5, t * 1.5], [SIZE - t * 1.5, SIZE - t * 1.5], [t * 1.5, SIZE - t * 1.5]]
        .forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, t * 1, 0, Math.PI * 2); ctx.stroke();
        });
}

function drawNetwork(t, fill, accent) {
    // Outer border
    ctx.strokeStyle = fill; ctx.lineWidth = t * 0.5;
    ctx.strokeRect(t, t, SIZE - t * 2, SIZE - t * 2);
    // Nodes along edges
    const spacing = t * 3.5;
    const nodeR = t * 0.45;
    const nodes = [];
    for (let pos = spacing; pos < SIZE - spacing / 2; pos += spacing) {
        nodes.push([pos, t], [pos, SIZE - t], [t, pos], [SIZE - t, pos]);
    }
    // Connecting lines between adjacent nodes
    ctx.strokeStyle = accent; ctx.lineWidth = t * 0.15;
    ctx.setLineDash([t * 0.3, t * 0.3]);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const [x1, y1] = nodes[i]; const [x2, y2] = nodes[j];
            const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            if (dist < spacing * 1.5) {
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
        }
    }
    ctx.setLineDash([]);
    // Draw nodes
    ctx.fillStyle = fill;
    nodes.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, nodeR, 0, Math.PI * 2); ctx.fill();
    });
}

// ===== 8 Decorative Border Styles =====

// Seeded pseudo-random for deterministic shapes
function seededRand(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function drawGeoBlocks(t, fill, accent) {
    const rng = seededRand(42);
    const blockCount = 8;
    const zone = t * 3;
    // Draw on each side
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        // Connecting line along edge
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3;
        ctx.beginPath(); ctx.moveTo(0, zone * 0.5); ctx.lineTo(SIZE, zone * 0.5); ctx.stroke();
        for (let i = 0; i < blockCount; i++) {
            const x = rng() * SIZE * 0.9;
            const w = t * (1.5 + rng() * 3);
            const h = t * (1 + rng() * 2.5);
            const y = rng() * zone * 0.6;
            const isFill = rng() > 0.4;
            if (isFill) {
                ctx.fillStyle = fill; ctx.globalAlpha = 0.3 + rng() * 0.5;
                ctx.fillRect(x, y, w, h);
                ctx.globalAlpha = 1;
            } else {
                ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3;
                ctx.strokeRect(x, y, w, h);
            }
            // Connecting line to spine
            if (rng() > 0.5) {
                ctx.strokeStyle = accent; ctx.lineWidth = t * 0.2;
                ctx.beginPath(); ctx.moveTo(x + w / 2, y + h); ctx.lineTo(x + w / 2, zone * 0.5); ctx.stroke();
            }
        }
        ctx.restore();
    }
}

function drawBubbles(t, fill, accent) {
    const rng = seededRand(77);
    const zone = t * 3.5;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 12; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone;
            const r = t * (0.4 + rng() * 1.5);
            const isFill = rng() > 0.5;
            if (isFill) {
                ctx.fillStyle = fill; ctx.globalAlpha = 0.15 + rng() * 0.4;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
            } else {
                ctx.strokeStyle = fill; ctx.lineWidth = t * 0.25;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
            }
        }
        // A few accent bubbles
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = accent; ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(rng() * SIZE, rng() * zone * 0.5, t * (0.3 + rng() * 0.6), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawMosaic(t, fill, accent) {
    const zone = t * 2.5;
    const tileSize = t * 1.2;
    const cols = Math.ceil(SIZE / tileSize);
    const rng = seededRand(123);
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        const rows = Math.ceil(zone / tileSize);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const alpha = (1 - row / rows) * (0.3 + rng() * 0.5);
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
}

function drawFloral(t, fill, accent) {
    const zone = t * 3;
    const rng = seededRand(55);
    function drawPetal(cx, cy, petalR, petals) {
        for (let p = 0; p < petals; p++) {
            const angle = (Math.PI * 2 / petals) * p;
            const px = cx + Math.cos(angle) * petalR;
            const py = cy + Math.sin(angle) * petalR;
            ctx.beginPath(); ctx.arc(px, py, petalR * 0.6, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy, petalR * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2; ctx.fillStyle = accent;
        // Vine line
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.15;
        ctx.beginPath();
        ctx.moveTo(0, zone * 0.5);
        for (let x = 0; x < SIZE; x += 20) { ctx.lineTo(x, zone * 0.5 + Math.sin(x * 0.05) * t); }
        ctx.stroke();
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
        for (let i = 0; i < 6; i++) {
            const x = (i + 0.5) * (SIZE / 6) + (rng() - 0.5) * t * 2;
            const y = zone * 0.4 * rng();
            const pr = t * (0.5 + rng() * 0.8);
            const petals = 4 + Math.floor(rng() * 3);
            drawPetal(x, y, pr, petals);
        }
        ctx.restore();
    }
}

function drawPixelArt(t, fill, accent) {
    const pxSize = t * 1;
    const zone = Math.ceil(t * 2.5 / pxSize) * pxSize;
    const cols = Math.ceil(SIZE / pxSize);
    const rows = Math.ceil(zone / pxSize);
    const rng = seededRand(99);
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const prob = 1 - (row / rows);
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
}

function drawConfetti(t, fill, accent) {
    const zone = t * 3;
    const rng = seededRand(31);
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 18; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone;
            const w = t * (0.4 + rng() * 1.2);
            const h = t * (0.3 + rng() * 0.8);
            const angle = rng() * Math.PI;
            const isCircle = rng() > 0.6;
            ctx.save();
            ctx.translate(x, y); ctx.rotate(angle);
            ctx.fillStyle = rng() > 0.6 ? accent : fill;
            ctx.globalAlpha = 0.3 + rng() * 0.5;
            if (isCircle) {
                ctx.beginPath(); ctx.arc(0, 0, w * 0.5, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillRect(-w / 2, -h / 2, w, h);
            }
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawWoven(t, fill, accent) {
    const zone = t * 2.5;
    const strandW = t * 1.5;
    const gap = t * 0.8;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.4;
        // Horizontal weave strands
        for (let y = 0; y < zone; y += strandW + gap) {
            ctx.beginPath();
            for (let x = 0; x < SIZE; x += strandW * 2) {
                ctx.moveTo(x, y); ctx.quadraticCurveTo(x + strandW, y + strandW * 0.3, x + strandW * 2, y);
            }
            ctx.stroke();
        }
        // Vertical cross strands
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.25;
        for (let x = strandW; x < SIZE; x += strandW * 2 + gap) {
            ctx.beginPath();
            ctx.moveTo(x, 0); ctx.lineTo(x, zone);
            ctx.stroke();
        }
        ctx.restore();
    }
}

function drawCircuit(t, fill, accent) {
    const zone = t * 3;
    const rng = seededRand(88);
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((Math.PI / 2) * side);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        // Traces
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.2;
        const traceCount = 10;
        for (let i = 0; i < traceCount; i++) {
            const x1 = rng() * SIZE;
            const y1 = rng() * zone * 0.3;
            const len = t * (2 + rng() * 5);
            const goDown = rng() > 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, 0);
            ctx.lineTo(x1, y1);
            if (goDown) {
                ctx.lineTo(x1 + len, y1);
                ctx.lineTo(x1 + len, y1 + t * (0.5 + rng()));
            } else {
                ctx.lineTo(x1 - len * 0.5, y1);
            }
            ctx.stroke();
            // Solder dot at end
            ctx.fillStyle = accent;
            ctx.beginPath(); ctx.arc(x1, y1, t * 0.25, 0, Math.PI * 2); ctx.fill();
        }
        // IC chip shapes
        for (let i = 0; i < 2; i++) {
            const cx = SIZE * 0.2 + rng() * SIZE * 0.6;
            const chipW = t * (1.5 + rng());
            const chipH = t * (0.8 + rng() * 0.5);
            ctx.fillStyle = fill; ctx.globalAlpha = 0.4;
            ctx.fillRect(cx, t * 0.2, chipW, chipH);
            ctx.globalAlpha = 1;
            // Legs
            ctx.strokeStyle = fill; ctx.lineWidth = t * 0.1;
            for (let l = 0; l < 3; l++) {
                const lx = cx + (l + 0.5) * (chipW / 3);
                ctx.beginPath(); ctx.moveTo(lx, t * 0.2 + chipH); ctx.lineTo(lx, t * 0.2 + chipH + t * 0.5); ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// ===== 13 More Decorative Border Styles =====

function drawStarBurst(t, fill, accent) {
    const rng = seededRand(200);
    const zone = t * 3;
    function star(cx, cy, r, spikes) {
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const rad = i % 2 === 0 ? r : r * 0.4;
            const x = cx + Math.cos(angle) * rad;
            const y = cy + Math.sin(angle) * rad;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 10; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone;
            const r = t * (0.4 + rng() * 1);
            const spikes = 4 + Math.floor(rng() * 4);
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
}

function drawHearts(t, fill, accent) {
    const rng = seededRand(143);
    const zone = t * 3;
    function heart(cx, cy, size) {
        const s = size;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * 0.4);
        ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.2, cx - s, cy + s * 0.1, cx, cy + s);
        ctx.bezierCurveTo(cx + s, cy + s * 0.1, cx + s * 0.5, cy - s * 0.2, cx, cy + s * 0.4);
        ctx.closePath();
    }
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 8; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone * 0.7;
            const s = t * (0.5 + rng() * 1);
            ctx.fillStyle = rng() > 0.5 ? accent : fill;
            ctx.globalAlpha = 0.25 + rng() * 0.45;
            heart(x, y, s); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawLeaves(t, fill, accent) {
    const rng = seededRand(67);
    const zone = t * 3;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        // Vine
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.15;
        ctx.beginPath(); ctx.moveTo(0, zone * 0.5);
        for (let x = 0; x < SIZE; x += 10) { ctx.lineTo(x, zone * 0.5 + Math.sin(x * 0.04) * t * 0.5); }
        ctx.stroke();
        // Leaves
        for (let i = 0; i < 10; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone * 0.6;
            const leafW = t * (0.5 + rng() * 0.8);
            const leafH = t * (1 + rng() * 1.5);
            const angle = (rng() - 0.5) * 1.5;
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
}

function drawLightning(t, fill, accent) {
    const rng = seededRand(111);
    const zone = t * 3;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 6; i++) {
            let x = rng() * SIZE;
            let y = 0;
            ctx.strokeStyle = rng() > 0.5 ? accent : fill;
            ctx.lineWidth = t * (0.15 + rng() * 0.25);
            ctx.globalAlpha = 0.4 + rng() * 0.5;
            ctx.beginPath(); ctx.moveTo(x, y);
            const segs = 3 + Math.floor(rng() * 3);
            for (let s = 0; s < segs; s++) {
                x += (rng() - 0.5) * t * 2;
                y += zone / segs * (0.5 + rng() * 0.5);
                ctx.lineTo(x, Math.min(y, zone));
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawWaves3D(t, fill, accent) {
    const layers = 4;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let l = 0; l < layers; l++) {
            const y = l * t * 0.8;
            const amp = t * (0.8 - l * 0.15);
            const freq = 0.03 + l * 0.005;
            ctx.strokeStyle = l % 2 === 0 ? fill : accent;
            ctx.lineWidth = t * (0.4 - l * 0.08);
            ctx.globalAlpha = 1 - l * 0.2;
            ctx.beginPath();
            for (let x = 0; x <= SIZE; x += 4) {
                const yy = y + Math.sin(x * freq + l * 0.8) * amp;
                x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawTriangles(t, fill, accent) {
    const rng = seededRand(155);
    const zone = t * 3;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 12; i++) {
            const x = rng() * SIZE;
            const y = rng() * zone;
            const s = t * (0.6 + rng() * 1.2);
            const flip = rng() > 0.5 ? 1 : -1;
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
}

function drawSpiral(t, fill, accent) {
    const rng = seededRand(222);
    const zone = t * 3;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 6; i++) {
            const cx = rng() * SIZE;
            const cy = rng() * zone * 0.8;
            const maxR = t * (0.8 + rng() * 1.2);
            const turns = 2 + rng() * 2;
            ctx.strokeStyle = rng() > 0.5 ? accent : fill;
            ctx.lineWidth = t * 0.15;
            ctx.globalAlpha = 0.4 + rng() * 0.4;
            ctx.beginPath();
            for (let a = 0; a < turns * Math.PI * 2; a += 0.2) {
                const r = (a / (turns * Math.PI * 2)) * maxR;
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawDna(t, fill, accent) {
    const zone = t * 2.5;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        const strand1Y = zone * 0.3;
        const strand2Y = zone * 0.7;
        const amp = zone * 0.25;
        const freq = 0.04;
        // Two helical strands
        ctx.lineWidth = t * 0.3;
        for (let s = 0; s < 2; s++) {
            ctx.strokeStyle = s === 0 ? fill : accent;
            ctx.beginPath();
            for (let x = 0; x <= SIZE; x += 3) {
                const baseY = s === 0 ? strand1Y : strand2Y;
                const yy = baseY + Math.sin(x * freq + s * Math.PI) * amp;
                x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
            }
            ctx.stroke();
        }
        // Cross rungs
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.1; ctx.globalAlpha = 0.5;
        for (let x = 0; x < SIZE; x += t * 2) {
            const y1 = strand1Y + Math.sin(x * freq) * amp;
            const y2 = strand2Y + Math.sin(x * freq + Math.PI) * amp;
            ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawBarcode(t, fill, accent) {
    const rng = seededRand(333);
    const zone = t * 2.5;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        let x = 0;
        while (x < SIZE) {
            const barW = t * (0.1 + rng() * 0.4);
            const barH = zone * (0.4 + rng() * 0.6);
            const gap = t * (0.1 + rng() * 0.3);
            ctx.fillStyle = rng() > 0.8 ? accent : fill;
            ctx.globalAlpha = 0.4 + rng() * 0.5;
            ctx.fillRect(x, 0, barW, barH);
            x += barW + gap;
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawGradientFade(t, fill, accent) {
    const zone = t * 3;
    const steps = 8;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < steps; i++) {
            const y = (i / steps) * zone;
            const h = zone / steps;
            ctx.fillStyle = i % 2 === 0 ? fill : accent;
            ctx.globalAlpha = (1 - i / steps) * 0.6;
            ctx.fillRect(0, y, SIZE, h);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawHoneycomb(t, fill, accent) {
    const hexR = t * 1;
    const zone = t * 3;
    const hexH = hexR * Math.sqrt(3);
    const rng = seededRand(444);
    function drawHex(cx, cy) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + hexR * Math.cos(a);
            const y = cy + hexR * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        let row = 0;
        for (let y = hexR; y < zone + hexR; y += hexH * 0.75) {
            const offset = row % 2 === 0 ? 0 : hexR * 1.5;
            for (let x = offset; x < SIZE + hexR; x += hexR * 3) {
                const alpha = (1 - (y / zone)) * 0.5;
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
}

function drawSplatter(t, fill, accent) {
    const rng = seededRand(555);
    const zone = t * 3.5;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        for (let i = 0; i < 8; i++) {
            const cx = rng() * SIZE;
            const cy = rng() * zone * 0.7;
            const mainR = t * (0.5 + rng() * 1.5);
            ctx.fillStyle = rng() > 0.5 ? accent : fill;
            ctx.globalAlpha = 0.2 + rng() * 0.4;
            // Main blob
            ctx.beginPath(); ctx.arc(cx, cy, mainR, 0, Math.PI * 2); ctx.fill();
            // Droplets
            const dropCount = 2 + Math.floor(rng() * 4);
            for (let d = 0; d < dropCount; d++) {
                const angle = rng() * Math.PI * 2;
                const dist = mainR + rng() * t * 1.5;
                const dr = t * (0.1 + rng() * 0.3);
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, dr, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawRibbon(t, fill, accent) {
    const zone = t * 2.5;
    for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2); ctx.rotate((Math.PI / 2) * side); ctx.translate(-SIZE / 2, -SIZE / 2);
        // Filled ribbon band
        ctx.fillStyle = fill; ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= SIZE; x += 4) {
            ctx.lineTo(x, Math.sin(x * 0.03) * t * 0.5 + t * 0.3);
        }
        for (let x = SIZE; x >= 0; x -= 4) {
            ctx.lineTo(x, Math.sin(x * 0.03) * t * 0.5 + zone * 0.6);
        }
        ctx.closePath(); ctx.fill();
        // Top edge
        ctx.strokeStyle = fill; ctx.lineWidth = t * 0.3; ctx.globalAlpha = 0.7;
        ctx.beginPath();
        for (let x = 0; x <= SIZE; x += 4) {
            const y = Math.sin(x * 0.03) * t * 0.5 + t * 0.3;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Bottom edge
        ctx.strokeStyle = accent; ctx.lineWidth = t * 0.2;
        ctx.beginPath();
        for (let x = 0; x <= SIZE; x += 4) {
            const y = Math.sin(x * 0.03) * t * 0.5 + zone * 0.6;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// ===== Styled Badges =====
function drawAllBadges() {
    creator.badges.forEach(badge => {
        if (!badge.text) return;
        const label = badge.emoji ? `${badge.emoji} ${badge.text}` : badge.text;
        drawBadgeAt(label, badge.color, badge.position);
    });
}

function drawBadgeAt(text, bgColor, position) {
    const fx = getStyleFx();
    const fontSize = creator.badgeSize;
    ctx.font = getBadgeFont();
    const metrics = ctx.measureText(text);
    const pad = fontSize * 0.7;
    const w = metrics.width + pad * 2;
    const h = fontSize * 2.1;
    const margin = 10;
    const r = fx.badgeRadius;
    let bx, by;

    switch (position) {
        case 'top-left': bx = margin; by = margin; break;
        case 'top-right': bx = SIZE - w - margin; by = margin; break;
        case 'top-center': bx = (SIZE - w) / 2; by = margin; break;
        case 'bottom-left': bx = margin; by = SIZE - h - margin; break;
        case 'bottom-right': bx = SIZE - w - margin; by = SIZE - h - margin; break;
        case 'bottom-center': bx = (SIZE - w) / 2; by = SIZE - h - margin; break;
        default: bx = margin; by = SIZE - h - margin;
    }

    ctx.save();

    // Shadow
    if (fx.badgeShadow) {
        ctx.shadowColor = fx.badgeShadow.color || bgColor;
        ctx.shadowBlur = fx.badgeShadow.blur;
        ctx.shadowOffsetX = fx.badgeShadow.x;
        ctx.shadowOffsetY = fx.badgeShadow.y;
    }

    // Badge bg
    const effectiveBg = fx.pastelSoften ? lightenColor(bgColor, 0.35) : bgColor;
    ctx.globalAlpha = fx.badgeBgAlpha;
    ctx.fillStyle = effectiveBg;
    roundRect(ctx, bx, by, w, h, r);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';

    // Outline
    if (fx.badgeOutline) {
        ctx.strokeStyle = fx.badgeOutline.color;
        ctx.lineWidth = fx.badgeOutline.width;
        roundRect(ctx, bx, by, w, h, r);
        ctx.stroke();
    }

    // Text
    ctx.font = getBadgeFont();
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
    const fx = getStyleFx();
    const text = creator.storeName.toUpperCase();
    ctx.font = getStoreFont();
    const metrics = ctx.measureText(text);
    const pad = creator.storeSize * 0.9;
    const w = metrics.width + pad * 2;
    const h = creator.storeSize * 1.7;
    const bx = (SIZE - w) / 2;
    const by = creator.thickness * (fx.borderExtraThickness) + 8;
    const r = fx.badgeRadius;

    ctx.save();

    if (fx.badgeShadow) {
        ctx.shadowColor = fx.badgeShadow.color || creator.accent;
        ctx.shadowBlur = fx.badgeShadow.blur;
        ctx.shadowOffsetX = fx.badgeShadow.x;
        ctx.shadowOffsetY = fx.badgeShadow.y;
    }

    const storeColor = fx.luxuryColors ? '#d4af37' : (fx.pastelSoften ? lightenColor(creator.accent, 0.35) : creator.accent);
    ctx.fillStyle = storeColor;
    ctx.globalAlpha = fx.badgeBgAlpha === 0 ? 0 : 0.9;
    roundRect(ctx, bx, by, w, h, r);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';

    if (fx.badgeOutline) {
        ctx.strokeStyle = fx.badgeOutline.color;
        ctx.lineWidth = fx.badgeOutline.width;
        roundRect(ctx, bx, by, w, h, r);
        ctx.stroke();
    }

    ctx.font = getStoreFont();
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

// ===== Util =====
function roundRect(ctx, x, y, w, h, r) {
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
}

// Initial render
render();
