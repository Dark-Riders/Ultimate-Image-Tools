// ===== Annotator — Template System =====
// Save/load text layout presets to localStorage. Export/import as JSON.
// Auto-saves last used template for session persistence.

var ANT_TPL_KEY = 'ant-templates';
var ANT_LAST_TPL_KEY = 'ant-last-template';

function antGetTemplates() {
    try { return JSON.parse(localStorage.getItem(ANT_TPL_KEY)) || {}; }
    catch (e) { return {}; }
}

function antSaveTemplates(tpls) {
    localStorage.setItem(ANT_TPL_KEY, JSON.stringify(tpls));
}

function antRefreshTplDropdown() {
    if (!antTplList) return;
    var tpls = antGetTemplates();
    var names = Object.keys(tpls).sort();
    antTplList.innerHTML = '<option value="">— Select template —</option>';
    for (var i = 0; i < names.length; i++) {
        var opt = document.createElement('option');
        opt.value = names[i];
        opt.textContent = names[i];
        antTplList.appendChild(opt);
    }
}

function antBuildTemplateData() {
    return antTexts.map(function (t) {
        return {
            text: t.text, x: t.x, y: t.y,
            fontSize: t.fontSize, fontFamily: t.fontFamily,
            color: t.color, bold: t.bold, italic: t.italic
        };
    });
}

function antApplyTemplate(data) {
    if (!Array.isArray(data)) return;
    antPushHistory();
    antTexts = data.map(function (t) {
        return {
            text: t.text || 'Text', x: t.x || 0, y: t.y || 0,
            fontSize: t.fontSize || 36, fontFamily: t.fontFamily || 'Inter',
            color: t.color || '#000000', bold: !!t.bold, italic: !!t.italic
        };
    });
    antSelectedIndex = -1;
    antSelectedType = null;
    antRenderTextList();
    antRender();
}

function antAutoSaveLastTemplate() {
    localStorage.setItem(ANT_LAST_TPL_KEY, JSON.stringify(antBuildTemplateData()));
}

function antRestoreLastTemplate() {
    try {
        var data = JSON.parse(localStorage.getItem(ANT_LAST_TPL_KEY));
        if (data && data.length > 0) {
            antTexts = data.map(function (t) {
                return {
                    text: t.text || 'Text', x: t.x || 0, y: t.y || 0,
                    fontSize: t.fontSize || 36, fontFamily: t.fontFamily || 'Inter',
                    color: t.color || '#000000', bold: !!t.bold, italic: !!t.italic
                };
            });
            antRenderTextList();
            antRender();
            console.log('[Annotator] Restored last template (' + data.length + ' texts).');
        }
    } catch (e) { /* ignore */ }
}

// ===== Template Listeners (called from initAnnotatorListeners) =====
function initAnnotatorTemplateListeners() {
    antTplSaveBtn.addEventListener('click', function () {
        var name = (antTplName.value || '').trim();
        if (!name) { alert('Enter a template name.'); return; }
        var tpls = antGetTemplates();
        tpls[name] = antBuildTemplateData();
        antSaveTemplates(tpls);
        antRefreshTplDropdown();
        antTplList.value = name;
        antTplName.value = '';
    });

    antTplLoadBtn.addEventListener('click', function () {
        var name = antTplList.value;
        if (!name) { alert('Select a template first.'); return; }
        var tpls = antGetTemplates();
        if (tpls[name]) antApplyTemplate(tpls[name]);
    });

    antTplDeleteBtn.addEventListener('click', function () {
        var name = antTplList.value;
        if (!name) return;
        var tpls = antGetTemplates();
        delete tpls[name];
        antSaveTemplates(tpls);
        antRefreshTplDropdown();
    });

    antTplExportBtn.addEventListener('click', function () {
        var data = antBuildTemplateData();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.download = 'annotator-template.json';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    });

    antTplImportInput.addEventListener('change', function () {
        var file = antTplImportInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                antApplyTemplate(data);
            } catch (e) { alert('Invalid template file.'); }
        };
        reader.readAsText(file);
        antTplImportInput.value = '';
    });

    // Auto-save last template on any text change
    var origRender = antRender;
    antRender = function () {
        origRender();
        if (antTexts.length > 0) antAutoSaveLastTemplate();
    };
}
