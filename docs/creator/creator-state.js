// ===== Creator Global Namespace =====
// All creator modules share state through window.Creator (aliased as C).
window.Creator = {};

(function (C) {
    // ===== Canvas =====
    C.canvas = document.getElementById('creator-canvas');
    C.ctx = C.canvas.getContext('2d');
    C.SIZE = 800;

    // ===== Creator State =====
    C.state = {
        style: 'simple',
        visualStyle: 'flat',
        fillMode: 'solid',
        canvasPreset: '1:1',
        canvasW: 1000,
        canvasH: 1000,
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
        // Store name background
        storeBg: true,
        storeBgColor: null,
        storeBgShape: 'rounded',
        // Border transforms
        borderRotate: 0,
        borderFlipH: false,
        borderFlipV: false,
        // Custom images
        images: [],
        // Store name position (free move)
        storeNameX: null,
        storeNameY: null,
        // QR Code
        qrUrl: '',
        qrSize: 120,
        qrFg: '#000000',
        qrBg: '#ffffff',
        qrX: null,
        qrY: null,
        qrImage: null,
        // Diagonal text
        diagText: '',
        diagOpacity: 15,
        diagSize: 32,
        diagAngle: -45,
        diagColor: '#ffffff',
        diagFill: true,
        diagOutline: 0,
        diagOutlineColor: '#000000',
        diagOutlineSize: 32,
        diagFont: 'Inter',
        diagBold: true,
        diagItalic: false,
        diagSpacing: 5,
        // Badge shape
        badgeShape: 'rounded',
    };

    // ===== Snap guides (drawn during drag) =====
    C.snapGuides = [];
    C.SNAP_THRESHOLD = 8;

    // ===== Drag state =====
    C.dragTarget = null;
    C.selectedElement = null;
    C.dragOffsetX = 0;
    C.dragOffsetY = 0;

    // ===== Undo/Redo history =====
    C.undoStack = [];
    C.redoStack = [];
    C.MAX_HISTORY = 50;

    C.getCreatorSnapshot = function () {
        return JSON.parse(JSON.stringify(C.state, function (key, val) {
            if (key === 'el' || key === 'qrImage') return undefined;
            return val;
        }));
    };

    C.pushUndo = function () {
        C.undoStack.push(C.getCreatorSnapshot());
        if (C.undoStack.length > C.MAX_HISTORY) C.undoStack.shift();
        C.redoStack.length = 0;
    };

    C.applySnapshot = function (snap) {
        Object.keys(snap).forEach(function (k) {
            if (k === 'images') {
                snap.images.forEach(function (si, i) {
                    if (C.state.images[i]) {
                        Object.assign(C.state.images[i], si);
                    }
                });
                C.state.images.length = snap.images.length;
            } else if (k !== 'qrImage') {
                C.state[k] = snap[k];
            }
        });
        if (C.state.qrUrl) C.generateQR(); else { C.state.qrImage = null; }
        C.syncUIFromState();
        C.render();
    };

    // ===== Positions & Badge Presets =====
    C.POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom-center', 'top-center'];

    C.BADGE_PRESETS = [
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

    // ===== syncUIFromState =====
    // Populated later by creator-controls.js, but declared here so applySnapshot can call it
    C.syncUIFromState = function () { };
    C.render = function () { };
    C.generateQR = function () { };
    C.renderBadgeControls = function () { };
    C.renderImageList = function () { };

})(window.Creator);
