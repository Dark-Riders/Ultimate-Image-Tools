// ===== Background Remover — Upload & Image List =====
// File upload, drag/drop, image list rendering, comparison slider.

// ===== File Upload =====
browseLink.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
fileInput.addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    addFiles(Array.from(e.dataTransfer.files).filter(f => /\.(png|jpe?g|webp)$/i.test(f.name)));
});

function addFiles(fileList) {
    Array.from(fileList).forEach(file => {
        if (!/\.(png|jpe?g|webp)$/i.test(file.name)) return;
        images.push({ file, name: file.name, originalUrl: URL.createObjectURL(file), resultBlob: null, resultUrl: null, status: 'pending' });
    });
    renderImageList();
    updateProcessBtn();
}

// ===== Render Image List =====
function renderImageList() {
    imageList.innerHTML = '';
    countBadge.textContent = images.length;
    images.forEach((img, i) => {
        const row = document.createElement('div');
        row.className = 'remover-image-row' +
            (img.status === 'done' ? ' done' : '') +
            (img.status === 'processing' ? ' processing' : '') +
            (img.status === 'error' ? ' error' : '') +
            (i === selectedIndex ? ' active' : '');
        const icon = { done: '✅', processing: '⏳', error: '❌' }[img.status] || '⬜';
        row.innerHTML =
            '<img src="' + img.originalUrl + '" class="remover-thumb" alt="">' +
            '<div class="remover-image-info"><span class="remover-image-name">' + img.name + '</span>' +
            '<span class="remover-image-status">' + icon + ' ' + img.status + '</span></div>' +
            '<div class="remover-image-actions">' +
            (img.resultUrl ? '<button class="remover-dl-btn" title="Download">⬇</button>' : '') +
            '<button class="remover-rm-btn" title="Remove">✕</button></div>';
        row.addEventListener('click', (e) => {
            if (e.target.closest('.remover-rm-btn') || e.target.closest('.remover-dl-btn')) return;
            exitEditor(); selectImage(i);
        });
        const dlBtn = row.querySelector('.remover-dl-btn');
        if (dlBtn) dlBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadSingle(i); });
        row.querySelector('.remover-rm-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(img.originalUrl);
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            images.splice(i, 1);
            if (selectedIndex >= images.length) selectedIndex = images.length - 1;
            renderImageList(); updateProcessBtn();
            if (images.length === 0) { hidePreview(); } else if (selectedIndex >= 0) { exitEditor(); selectImage(selectedIndex); }
        });
        imageList.appendChild(row);
    });
}

function renderResults() {
    resultsContainer.innerHTML = ''; resultsContainer.hidden = false;
    images.forEach((img, i) => {
        if (img.status !== 'done') return;
        const thumb = document.createElement('div');
        thumb.className = 'remover-result-thumb' + (i === selectedIndex ? ' active' : '');
        thumb.innerHTML = '<img src="' + img.resultUrl + '" alt=""><span>' + img.name.replace(/\.[^.]+$/, '') + '</span>';
        thumb.addEventListener('click', () => { exitEditor(); selectImage(i); });
        resultsContainer.appendChild(thumb);
    });
}

// ===== Comparison Slider =====
var sliderDragging = false;
compareSlider.addEventListener('mousedown', (e) => { sliderDragging = true; e.preventDefault(); });
compareSlider.addEventListener('touchstart', (e) => { sliderDragging = true; e.preventDefault(); });
document.addEventListener('mousemove', (e) => { if (sliderDragging) updateSlider(e.clientX); });
document.addEventListener('touchmove', (e) => { if (sliderDragging) updateSlider(e.touches[0].clientX); });
document.addEventListener('mouseup', () => sliderDragging = false);
document.addEventListener('touchend', () => sliderDragging = false);
function updateSlider(clientX) {
    const rect = previewContainer.getBoundingClientRect();
    let pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    compareSlider.style.left = pct + '%';
    compareContainer.querySelector('.remover-compare-after').style.clipPath = 'inset(0 0 0 ' + pct + '%)';
}
