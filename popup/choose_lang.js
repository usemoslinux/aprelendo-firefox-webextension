import { languages } from "../shared/languages.js";
const browser = globalThis.browser || globalThis.chrome;

const GENERIC_ADD_ERROR = "The current page could not be added to Aprelendo.";

document.addEventListener("DOMContentLoaded", async () => {
  const popup = document.querySelector("#popup-content");
  const popupError = document.querySelector("#popup-error");
  let detectedLang = null;
  let busy = false;
  let hasUserInteracted = false;

  function showError(message) {
    popupError.textContent = message || GENERIC_ADD_ERROR;
    popupError.classList.remove("hidden");
  }

  function clearError() {
    popupError.textContent = "";
    popupError.classList.add("hidden");
  }

  function getButton(code) {
    return code ? document.getElementById(code) : null;
  }

  function focusButton(button) {
    if (!button) return;
    button.focus({ preventScroll: true });
  }

  function focusPreferredButton() {
    if (hasUserInteracted) return;

    const preferredButton =
      getButton(detectedLang) || popup.querySelector(".button");

    if (preferredButton && document.activeElement !== preferredButton) {
      focusButton(preferredButton);
    }
  }

  function scrollButtonIntoView(button) {
    requestAnimationFrame(() => {
      const popupRect = popup.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const offset =
        buttonRect.top -
        popupRect.top -
        (popup.clientHeight / 2 - button.offsetHeight / 2);
      popup.scrollTop += offset;
    });
  }

  function buildPopup(visibleLangs) {
    const fragment = document.createDocumentFragment();
    for (const lang of visibleLangs) {
      const el = document.createElement("button");
      el.type = "button";
      el.id = lang.code;
      el.className = `button ${lang.code}`;
      el.textContent = browser.i18n.getMessage(lang.name);
      fragment.appendChild(el);
    }

    popup.replaceChildren(fragment);

    if (detectedLang) {
      highlightDetected(detectedLang);
    } else {
      focusPreferredButton();
    }
  }

  function highlightDetected(lang) {
    detectedLang = lang;
    const detectedButton = getButton(lang);
    const current = popup.querySelector(".detected");

    if (current && current !== detectedButton) {
      current.classList.remove("detected");
      current.removeAttribute("aria-current");
    }

    if (!detectedButton) return;

    detectedButton.classList.add("detected");
    detectedButton.setAttribute("aria-current", "true");
    scrollButtonIntoView(detectedButton);
    focusPreferredButton();
  }

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
      const keys = languages.map((l) => `show_${l.code}`);
      const syncRes = await browser.storage.sync.get(keys);
      const visibleLangs = languages.filter(
        (lang) =>
          syncRes[`show_${lang.code}`] ||
          typeof syncRes[`show_${lang.code}`] === "undefined",
      );
      buildPopup(visibleLangs);
    }
  } catch (e) {
    console.error("Failed to load languages:", e);
    buildPopup(languages);
  }

  popup.addEventListener("pointerdown", () => {
    hasUserInteracted = true;
  });

  popup.addEventListener("keydown", () => {
    hasUserInteracted = true;
  });

  async function submitSelection(btn) {
    if (!btn || busy) return;
    busy = true;
    clearError();

    try {
      const response = await browser.runtime.sendMessage({ lang: btn.id });
      if (!response?.ok) {
        throw new Error(response?.error || GENERIC_ADD_ERROR);
      }
      setTimeout(() => window.close(), 0);
    } catch (error) {
      console.error("Failed to send selection:", error);
      showError(error instanceof Error ? error.message : GENERIC_ADD_ERROR);
      busy = false;
      focusButton(btn);
    }
  }

  popup.addEventListener("click", async (e) => {
    const btn = e.target.closest(".button");
    await submitSelection(btn);
  });
});
