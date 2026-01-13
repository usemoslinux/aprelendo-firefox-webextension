const t = (k) => browser.i18n.getMessage(k) || k;

document.addEventListener("DOMContentLoaded", async () => {
    const popup = document.querySelector("#popup-content");

    function buildPopup(visibleLangs) {
        for (const lang of visibleLangs) {
            const el = document.createElement('div');
            el.id = lang.code;
            el.className = `button ${lang.code}`;
            el.textContent = t(lang.name);
            popup.appendChild(el);
        }
    }

    const res = await browser.storage.local.get('cached_languages');
    if (res.cached_languages && res.cached_languages.length > 0) {
        buildPopup(res.cached_languages);
    } else {
        // Fallback for safety, though it should rarely be needed
        const sync_res = await browser.storage.sync.get(languages.map(l => `show_${l.code}`));
        const visibleLangs = languages.filter(lang =>
            sync_res[`show_${lang.code}`] || typeof sync_res[`show_${lang.code}`] === 'undefined'
        );
        buildPopup(visibleLangs);
    }

    popup.tabIndex = -1;
    popup.focus();

    let busy = false;

    const handlePick = async (e) => {
        const btn = e.target.closest('.button');
        if (!btn || busy) return;
        busy = true;

        try { await browser.runtime.sendMessage({ lang: btn.id }); }
        finally { window.close(); }
    };

    document.addEventListener('pointerdown', handlePick, { passive: true });

    document.addEventListener('keydown', async (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !busy) {
            const btn = document.activeElement?.closest?.('.button');
            if (btn) {
                e.preventDefault();
                busy = true;
                try { await browser.runtime.sendMessage({ lang: btn.id }); }
                finally { window.close(); }
            }
        }
    });
});