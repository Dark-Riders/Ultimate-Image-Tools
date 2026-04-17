// ===== Background Remover — Download =====
// Single and batch (ZIP) download, process button state.

function downloadSingle(index) {
    const img = images[index];
    if (!img || !img.resultBlob) return;
    const link = document.createElement('a');
    link.download = img.name.replace(/\.[^.]+$/, '') + '_nobg.png';
    link.href = img.resultUrl; link.click();
}

downloadAllBtn.addEventListener('click', async () => {
    const done = images.filter(i => i.status === 'done');
    if (done.length === 0) return;
    if (done.length === 1) { downloadSingle(images.indexOf(done[0])); return; }
    statusText.textContent = '📦 Creating ZIP...'; progressWrap.hidden = false;
    try {
        const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
        const zip = new JSZip();
        done.forEach(img => zip.file(img.name.replace(/\.[^.]+$/, '') + '_nobg.png', img.resultBlob));
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = 'bg-removed-' + Date.now() + '.zip';
        link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href);
        statusText.textContent = '✅ ZIP downloaded!';
    } catch (err) { console.error('ZIP failed:', err); statusText.textContent = '❌ ZIP failed'; }
});

function updateProcessBtn() {
    processBtn.disabled = images.filter(i => i.status !== 'done').length === 0 || processing;
}

console.log('[BG Remover] ✅ Module fully loaded.');
