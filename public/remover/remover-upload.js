// ===== Background Remover — Upload & Image List =====
// File handling, drag & drop, image list rendering, compare slider.

function addFiles(fileList) {
    for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue;
        removerImages.push({
            file, name: file.name,
            originalUrl: URL.createObjectURL(file),
            resultBlob: null, resultUrl: null, status: 'pending'
        });
    }
    renderImageList();
    if (removerImages.length > 0) { selectRemoverImage(removerImages.length - 1); }
}

function renderImageList() {
    if (!imageList) return;
    imageList.innerHTML = '';
    countBadge.textContent = removerImages.length;
    removerImages.forEach((img, i) => {
        const statusLabel = img.status === 'done' ? '✅ Done' : img.status === 'error' ? '❌ Error' : img.status === 'processing' ? '⏳ Processing' : '⏳ Pending';
        const item = document.createElement('div');
        item.className = 'remover-image-row'
            + (i === selectedIndex ? ' active' : '')
            + (img.status === 'done' ? ' done' : '')
            + (img.status === 'processing' ? ' processing' : '')
            + (img.status === 'error' ? ' error' : '');
        item.innerHTML =
            '<img class="remover-thumb" src="' + img.originalUrl + '" alt="' + img.name + '">' +
            '<div class="remover-image-info">' +
                '<span class="remover-image-name">' + img.name + '</span>' +
                '<span class="remover-image-status">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="remover-image-actions">' +
                '<button class="remover-rm-btn" title="Remove">×</button>' +
            '</div>';
        item.querySelector('.remover-rm-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(img.originalUrl);
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            removerImages.splice(i, 1);
            if (selectedIndex >= removerImages.length) selectedIndex = removerImages.length - 1;
            renderImageList();
            if (selectedIndex >= 0) selectRemoverImage(selectedIndex); else hidePreview();
        });
        item.addEventListener('click', () => selectRemoverImage(i));
        imageList.appendChild(item);
    });
    updateProcessBtn();
}

function renderResults() {
    renderImageList();
}

function hidePreview() {
    emptyState.hidden = false;
    compareContainer.hidden = true;
    actionBar.hidden = true;
}

function updateSlider(clientX) {
    const rect = compareContainer.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    compareContainer.querySelector('.remover-compare-after').style.clipPath = `inset(0 0 0 ${pct}%)`;
    compareSlider.style.left = pct + '%';
}
