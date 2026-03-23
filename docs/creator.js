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
