import { languages } from "./shared/languages.js";
import {
  DEFAULT_APRELENDO_BASE_URL,
  normalizeAprelendoBaseUrl,
} from "./shared/url_builder.js";

const browser = globalThis.browser || globalThis.chrome;
const languageCodes = languages.map((lang) => lang.code);
let messageTimeoutId = null;

function showMessage({ type, title, body }) {
  const msg = document.getElementById("message-block");
  const messageTitle = document.getElementById("message-title");
  const messageBody = document.getElementById("message-body");

  msg.classList.remove("hidden", "message-success", "message-error");
  msg.classList.add(type === "error" ? "message-error" : "message-success");

  messageTitle.textContent = title;
  messageBody.textContent = body;

  if (messageTimeoutId) {
    clearTimeout(messageTimeoutId);
  }

  messageTimeoutId = setTimeout(() => {
    msg.classList.add("hidden");
  }, 2500);
}

async function saveOptions() {
  const syncSettings = {};

  languageCodes.forEach((code) => {
    syncSettings[`show_${code}`] = document.querySelector(`#${code}`).checked;
  });

  syncSettings.shortcut_lang = document.querySelector("#shortcut-lang").value;
  syncSettings.open_in_new_tab =
    document.querySelector("#open-in-new-tab").checked;

  const baseUrlInput = document.querySelector("#aprelendo-base-url");
  const rawBaseUrl = baseUrlInput.value.trim();
  let normalizedBaseUrl;

  try {
    normalizedBaseUrl = normalizeAprelendoBaseUrl(rawBaseUrl);
  } catch (_error) {
    showMessage({
      type: "error",
      title: browser.i18n.getMessage("errorOptMsgTitle"),
      body: browser.i18n.getMessage("aprelendoServerUrlInvalidError"),
    });
    return;
  }

  const localSettings = {
    aprelendo_base_url:
      rawBaseUrl && normalizedBaseUrl !== DEFAULT_APRELENDO_BASE_URL
        ? normalizedBaseUrl
        : "",
  };

  await Promise.all([
    browser.storage.sync.set(syncSettings),
    browser.storage.local.set(localSettings),
  ]);

  showMessage({
    type: "success",
    title: browser.i18n.getMessage("successOptMsgTitle"),
    body: browser.i18n.getMessage("successOptMsgText"),
  });
}

async function restoreOptions() {
  const keys = languageCodes
    .map((code) => `show_${code}`)
    .concat(["shortcut_lang", "open_in_new_tab"]);

  const [syncSettings, localSettings] = await Promise.all([
    browser.storage.sync.get(keys),
    browser.storage.local.get(["aprelendo_base_url"]),
  ]);

  languageCodes.forEach((code) => {
    document.querySelector(`#${code}`).checked =
      typeof syncSettings[`show_${code}`] !== "undefined"
        ? syncSettings[`show_${code}`]
        : true;
  });
  document.querySelector("#shortcut-lang").value =
    typeof syncSettings.shortcut_lang !== "undefined"
      ? syncSettings.shortcut_lang
      : "en";
  document.querySelector("#open-in-new-tab").checked =
    typeof syncSettings.open_in_new_tab !== "undefined"
      ? syncSettings.open_in_new_tab
      : true;
  document.querySelector("#aprelendo-base-url").value =
    localSettings.aprelendo_base_url || "";

  updateLocaleStrings();
}

function updateLocaleStrings() {
  const i18nElements = document.querySelectorAll("[data-i18n-content]");
  i18nElements.forEach((element) => {
    const i18nMessageName = element.getAttribute("data-i18n-content");
    element.textContent = browser.i18n.getMessage(i18nMessageName);
  });

  document.querySelector("#aprelendo-base-url").placeholder =
    DEFAULT_APRELENDO_BASE_URL;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
