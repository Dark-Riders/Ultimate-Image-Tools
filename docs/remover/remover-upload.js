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
    if (removerImages.length > 0) { selectImage(removerImages.length - 1); }
}

function renderImageList() {
    if (!imageList) return;
    imageList.innerHTML = '';
    countBadge.textContent = removerImages.length;
    removerImages.forEach((img, i) => {
        const item = document.createElement('div');
        item.className = 'remover-image-item' + (i === selectedIndex ? ' selected' : '');
        item.innerHTML = `
            <img src="${img.originalUrl}" alt="${img.name}">
            <span class="name">${img.name}</span>
            <span class="status ${img.status}">${img.status === 'done' ? '✅' : img.status === 'error' ? '❌' : '⏳'}</span>
            <button class="remove-btn" title="Remove">×</button>
        `;
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(img.originalUrl);
            if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
            removerImages.splice(i, 1);
            if (selectedIndex >= removerImages.length) selectedIndex = removerImages.length - 1;
            renderImageList();
            if (selectedIndex >= 0) selectImage(selectedIndex); else hidePreview();
        });
        item.addEventListener('click', () => selectImage(i));
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
    afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    compareSlider.style.left = pct + '%';
}
