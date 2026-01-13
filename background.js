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

browser.runtime.onMessage.addListener(async (msg) => {
    await redirect(msg);
    return { ok: true };
});

browser.commands.onCommand.addListener(async (command) => {
    if (command === 'add-page') {
        const { shortcut_lang } = await browser.storage.sync.get(['shortcut_lang']);
        const lang = (typeof shortcut_lang === 'undefined') ? 'en' : shortcut_lang;
        try {
            await redirect({ lang });
        } catch (e) {
            console.error(e);
        }
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

browser.runtime.onInstalled.addListener(cacheVisibleLanguages);
browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        const langSettingChanged = Object.keys(changes).some(key => key.startsWith('show_'));
        if (langSettingChanged) {
            cacheVisibleLanguages();
        }
    }
});
