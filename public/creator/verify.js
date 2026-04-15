// Verification script: compare original creator.js with split files
const fs = require('fs');
const path = require('path');

const origPath = path.join(__dirname, '..', 'creator.js');
const splitDir = __dirname;

const origContent = fs.readFileSync(origPath, 'utf-8');

// Get all split files
const splitFiles = fs.readdirSync(splitDir)
    .filter(f => f.startsWith('creator-') && f.endsWith('.js'))
    .sort();

const splitContent = splitFiles
    .map(f => fs.readFileSync(path.join(splitDir, f), 'utf-8'))
    .join('\n');

console.log('=== FILE SIZES ===');
console.log(`Original: ${origContent.length} chars, ${origContent.split('\n').length} lines`);
splitFiles.forEach(f => {
    const c = fs.readFileSync(path.join(splitDir, f), 'utf-8');
    console.log(`  ${f}: ${c.split('\n').length} lines`);
});
console.log(`Split total: ${splitContent.length} chars`);

// Extract function declarations
function extractFunctions(code) {
    const funcs = new Set();
    // function name(
    const regex1 = /function\s+(\w+)\s*\(/g;
    let m;
    while ((m = regex1.exec(code)) !== null) funcs.add(m[1]);
    // C.name = function
    const regex2 = /C\.(\w+)\s*=\s*function/g;
    while ((m = regex2.exec(code)) !== null) funcs.add(m[1]);
    return funcs;
}

// Extract addEventListener calls
function extractEventListeners(code) {
    const listeners = [];
    const regex = /(?:getElementById\(['"]([^'"]+)['"]\)|(\w+))[\s\S]*?\.addEventListener\(['"](\w+)['"]/g;
    let m;
    while ((m = regex.exec(code)) !== null) {
        listeners.push((m[1] || m[2]) + '.' + m[3]);
    }
    return listeners;
}

// Extract draw function names (key to the border system)
function extractDrawFunctions(code) {
    const draws = new Set();
    const regex = /(?:function\s+|C\.)draw(\w+)\s*[=(:]/g;
    let m;
    while ((m = regex.exec(code)) !== null) draws.add('draw' + m[1]);
    return draws;
}

// Extract const/let/var declarations
function extractConstants(code) {
    const consts = new Set();
    const regex = /(?:const|let|var)\s+([A-Z_][A-Z_0-9]+)\s*=/g;
    let m;
    while ((m = regex.exec(code)) !== null) consts.add(m[1]);
    // C.NAME = pattern
    const regex2 = /C\.([A-Z_][A-Z_0-9]+)\s*=/g;
    while ((m = regex2.exec(code)) !== null) consts.add(m[1]);
    return consts;
}

console.log('\n=== FUNCTION COMPARISON ===');
const origFuncs = extractFunctions(origContent);
const splitFuncs = extractFunctions(splitContent);
console.log(`Original functions: ${origFuncs.size}`);
console.log(`Split functions: ${splitFuncs.size}`);

const missingFuncs = [...origFuncs].filter(f => !splitFuncs.has(f));
const extraFuncs = [...splitFuncs].filter(f => !origFuncs.has(f));
console.log(`Missing in split: ${missingFuncs.length === 0 ? 'NONE ✓' : missingFuncs.join(', ')}`);
console.log(`Extra in split: ${extraFuncs.length === 0 ? 'NONE ✓' : extraFuncs.join(', ')}`);

console.log('\n=== DRAW FUNCTIONS COMPARISON ===');
const origDraws = extractDrawFunctions(origContent);
const splitDraws = extractDrawFunctions(splitContent);
console.log(`Original draw fns: ${origDraws.size}`);
console.log(`Split draw fns: ${splitDraws.size}`);
const missingDraws = [...origDraws].filter(f => !splitDraws.has(f));
console.log(`Missing draws: ${missingDraws.length === 0 ? 'NONE ✓' : missingDraws.join(', ')}`);

console.log('\n=== CONSTANTS COMPARISON ===');
const origConsts = extractConstants(origContent);
const splitConsts = extractConstants(splitContent);
const missingConsts = [...origConsts].filter(c => !splitConsts.has(c));
console.log(`Missing constants: ${missingConsts.length === 0 ? 'NONE ✓' : missingConsts.join(', ')}`);

// Check border dispatch map completeness
console.log('\n=== BORDER DISPATCH MAP ===');
const origDispatch = origContent.match(/borderDrawFns\s*=\s*\{([^}]+)\}/s);
const splitDispatch = splitContent.match(/borderDrawFns\s*=\s*\{([^}]+)\}/s);
if (origDispatch && splitDispatch) {
    const origKeys = origDispatch[1].match(/(\w+):/g).map(k => k.replace(':',''));
    const splitKeys = splitDispatch[1].match(/(\w+):/g).map(k => k.replace(':',''));
    const missingKeys = origKeys.filter(k => !splitKeys.includes(k));
    console.log(`Original border keys: ${origKeys.length}`);
    console.log(`Split border keys: ${splitKeys.length}`);
    console.log(`Missing keys: ${missingKeys.length === 0 ? 'NONE ✓' : missingKeys.join(', ')}`);
}

console.log('\n=== SUMMARY ===');
const issues = missingFuncs.length + missingDraws.length + missingConsts.length;
if (issues === 0) {
    console.log('✅ All checks passed! Split files contain all original functionality.');
} else {
    console.log(`⚠️ ${issues} issues found. Review above.`);
}
