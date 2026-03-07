import { languages } from "./shared/languages.js";
import { detectLang } from "./shared/language_detector.js";
import { buildAprelendoUrl } from "./shared/url_builder.js";

// background.js
const browser = globalThis.browser || globalThis.chrome;

const supportedLangCodes = new Set(languages.map((l) => l.code));

async function getShortcutFallbackLang() {
  const { shortcut_lang } = await browser.storage.sync.get(["shortcut_lang"]);
  return shortcut_lang || "en";
}

async function redirect(msg) {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  const tab = tabs && tabs[0];
  if (!tab || !tab.url) throw new Error("No active tab URL.");

  const lang = msg.lang;
  const aprelendo_url = buildAprelendoUrl(tab.url, lang);

  const { open_in_new_tab } = await browser.storage.sync.get([
    "open_in_new_tab",
  ]);
  const openInNewTab =
    typeof open_in_new_tab === "undefined" ? true : open_in_new_tab;

  if (openInNewTab) {
    await browser.tabs.create({
      url: aprelendo_url,
      active: true,
      index: (typeof tab.index === "number" ? tab.index : 0) + 1,
    });
  } else if (tab.id) {
    await browser.tabs.update(tab.id, { url: aprelendo_url, active: true });
  }
}

async function detectTabLanguage(tab) {
  if (!tab || !tab.id) return null;
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText.slice(0, 5000), // Increased limit for better accuracy
    });
    const text = results && results[0] && results[0].result;
    if (!text) return null;
    const detected = detectLang(text);
    return supportedLangCodes.has(detected) ? detected : null;
  } catch (e) {
    // Can fail on special pages like about:debugging or restricted domains
    console.warn("Language detection skipped or failed:", e.message);
    return null;
  }
}

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.action === "getDetectedLanguage") {
    (async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        const lang = await detectTabLanguage(tab);
        sendResponse({ lang });
      } catch (error) {
        console.error(error);
        sendResponse({ lang: null });
      }
    })();
    return true;
  }

  if (msg?.lang) {
    (async () => {
      try {
        await redirect(msg);
        sendResponse({ ok: true });
      } catch (e) {
        console.error(e);
        sendResponse({ ok: false, error: e?.message });
      }
    })();
    return true;
  }

  return undefined;
});

browser.commands.onCommand.addListener(async (command) => {
  if (command === "add-page") {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const detectedLang = await detectTabLanguage(tab);
    const lang = detectedLang || (await getShortcutFallbackLang());
    try {
      await redirect({ lang });
    } catch (e) {
      console.error(e);
    }
  }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-page-auto-detect") {
    const detectedLang = await detectTabLanguage(tab);
    const lang = detectedLang || (await getShortcutFallbackLang());
    try {
      await redirect({ lang });
    } catch (e) {
      console.error(e);
    }
  }
});

async function cacheVisibleLanguages() {
  const keys = languages.map((l) => `show_${l.code}`);
  const settings = await browser.storage.sync.get(keys);
  const visibleLangs = languages.filter(
    (lang) =>
      settings[`show_${lang.code}`] ||
      typeof settings[`show_${lang.code}`] === "undefined",
  );
  await browser.storage.local.set({ cached_languages: visibleLangs });
}

browser.runtime.onInstalled.addListener(() => {
  // Create context menu
  browser.contextMenus.create({
    id: "add-page-auto-detect",
    title: "Add to Aprelendo (auto-detect language)",
    contexts: ["page"],
  });

  // Initial caching of visible languages
  cacheVisibleLanguages();
});

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    const langSettingChanged = Object.keys(changes).some((key) =>
      key.startsWith("show_"),
    );
    if (langSettingChanged) {
      cacheVisibleLanguages();
    }
  }
});
