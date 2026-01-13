const supportedLangCodes = new Set(languages.map(l => l.code));

async function redirect(msg) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const tab = tabs && tabs[0];
    if (!tab || !tab.url) throw new Error("No active tab URL.");

    const lang = msg.lang;
    const yt = ['https://www.youtube.com/watch', 'https://m.youtube.com/watch', 'https://youtu.be/'];
    const isYouTube = yt.some(prefix => tab.url.startsWith(prefix));

    const aprelendo_url = isYouTube
        ? `https://www.aprelendo.com/addvideo.php?lang=${lang}&url=${encodeURIComponent(tab.url)}`
        : `https://www.aprelendo.com/addtext.php?lang=${lang}&url=${encodeURIComponent(tab.url)}`;

    await browser.tabs.create({
        url: aprelendo_url,
        active: true,
        index: (typeof tab.index === 'number' ? tab.index : 0) + 1
    });
}

async function detectTabLanguage(tab) {
    if (!tab || !tab.id) return null;
    try {
        const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText.slice(0, 2000)
        });
        const text = results[0].result;
        if (!text) return null;
        const detected = detectLang(text);
        return supportedLangCodes.has(detected) ? detected : null;
    } catch (e) {
        // Can fail on special pages like about:debugging
        console.error("Language detection failed:", e);
        return null;
    }
}

browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.action === 'getDetectedLanguage') {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const lang = await detectTabLanguage(tab);
        return { lang };
    }

    if (msg.lang) {
        try {
            await redirect(msg);
            return { ok: true };
        } catch (e) {
            console.error(e);
            return { ok: false, error: e?.message };
        }
    }
});

browser.commands.onCommand.addListener(async (command) => {
    if (command === 'add-page') {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const detectedLang = await detectTabLanguage(tab);
        const { shortcut_lang } = await browser.storage.sync.get(['shortcut_lang']);
        const lang = detectedLang || shortcut_lang || 'en';
        try {
            await redirect({ lang });
        } catch (e) {
            console.error(e);
        }
    }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'add-page-auto-detect') {
        const detectedLang = await detectTabLanguage(tab);
        const lang = detectedLang || 'en';
        try { await redirect({ lang }); } catch (e) { console.error(e); }
    }
});

async function cacheVisibleLanguages() {
    const keys = languages.map(l => `show_${l.code}`);
    const settings = await browser.storage.sync.get(keys);
    const visibleLangs = languages.filter(lang =>
        settings[`show_${lang.code}`] || typeof settings[`show_${lang.code}`] === 'undefined'
    );
    await browser.storage.local.set({ cached_languages: visibleLangs });
}

browser.runtime.onInstalled.addListener(() => {
    // Create context menu
    browser.contextMenus.create({
        id: "add-page-auto-detect",
        title: "Add to Aprelendo (auto-detect language)",
        contexts: ["page"]
    });

    // Initial caching of visible languages
    cacheVisibleLanguages();
});

browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        const langSettingChanged = Object.keys(changes).some(key => key.startsWith('show_'));
        if (langSettingChanged) {
            cacheVisibleLanguages();
        }
    }
});