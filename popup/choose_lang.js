import { languages } from "../shared/languages.js";
const browser = globalThis.browser || globalThis.chrome;

document.addEventListener("DOMContentLoaded", async () => {
  const popup = document.querySelector("#popup-content");
  let detectedLang = null;

  function buildPopup(visibleLangs) {
    const fragment = document.createDocumentFragment();
    for (const lang of visibleLangs) {
      const el = document.createElement("div");
      el.id = lang.code;
      el.className = `button ${lang.code}`;
      el.textContent = browser.i18n.getMessage(lang.name);
      fragment.appendChild(el);
    }
    popup.appendChild(fragment);

    if (detectedLang) {
      highlightDetected(detectedLang);
    }
  }

  function highlightDetected(lang) {
    detectedLang = lang;
    const detectedButton = document.getElementById(lang);
    if (detectedButton) {
      // Remove 'detected' class from any other button just in case
      const current = popup.querySelector(".detected");
      if (current) current.classList.remove("detected");

      detectedButton.classList.add("detected");
      requestAnimationFrame(() => {
        const popupRect = popup.getBoundingClientRect();
        const buttonRect = detectedButton.getBoundingClientRect();
        const offset =
          buttonRect.top -
          popupRect.top -
          (popup.clientHeight / 2 - detectedButton.offsetHeight / 2);
        popup.scrollTop += offset;
      });
    }
  }

  // Ask background script for detected language of the current tab
  browser.runtime
    .sendMessage({ action: "getDetectedLanguage" })
    .then((response) => {
      if (response && response.lang) {
        highlightDetected(response.lang);
      }
    })
    .catch((error) => {
      console.error("Failed to get detected language:", error);
    });

  try {
    const res = await browser.storage.local.get("cached_languages");
    if (res.cached_languages && res.cached_languages.length > 0) {
      buildPopup(res.cached_languages);
    } else {
      // Fallback: fetch from sync storage if local cache is empty
      const keys = languages.map((l) => `show_${l.code}`);
      const sync_res = await browser.storage.sync.get(keys);
      const visibleLangs = languages.filter(
        (lang) =>
          sync_res[`show_${lang.code}`] ||
          typeof sync_res[`show_${lang.code}`] === "undefined",
      );
      buildPopup(visibleLangs);
    }
  } catch (e) {
    console.error("Failed to load languages:", e);
    // Emergency fallback: show all languages
    buildPopup(languages);
  }

  popup.tabIndex = -1;
  popup.focus();

  let busy = false;

  const handlePick = async (e) => {
    const btn = e.target.closest(".button");
    if (!btn || busy) return;
    busy = true;

    try {
      await browser.runtime.sendMessage({ lang: btn.id });
    } catch (error) {
      console.error("Failed to send selection:", error);
    } finally {
      // close even if failed — but only once
      setTimeout(() => window.close(), 0);
    }
  };

  // Use click so scrolling doesn't trigger a selection on touch devices.
  popup.addEventListener("click", handlePick);

  // Optional keyboard support (Enter/Space) without using 'click'
  document.addEventListener("keydown", async (e) => {
    if ((e.key === "Enter" || e.key === " ") && !busy) {
      const btn = document.activeElement?.closest?.(".button");
      if (btn) {
        e.preventDefault();
        busy = true;
        try {
          await browser.runtime.sendMessage({ lang: btn.id });
        } catch (error) {
          console.error("Failed to send selection:", error);
        } finally {
          setTimeout(() => window.close(), 0);
        }
      }
    }
  });
});
