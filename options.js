const languageCodes = languages.map(lang => lang.code);

async function saveOptions() {
    let settings = {};

    languageCodes.forEach(code => {
        settings[`show_${code}`] = document.querySelector(`#${code}`).checked;
    });

    settings["shortcut_lang"] = document.querySelector("#shortcut-lang").value;

    await browser.storage.sync.set(settings);

    // Update message to let user know options were saved.
    const msg = document.getElementById('message-block');
    msg.classList.remove("hidden");
    setTimeout(() => {
        msg.classList.add("hidden");
    }, 2000);
}

async function restoreOptions() {
    const keys = languageCodes.map(code => `show_${code}`).concat(["shortcut_lang"]);

    const res = await browser.storage.sync.get(keys);

    languageCodes.forEach(code => {
        document.querySelector(`#${code}`).checked = (typeof res[`show_${code}`] !== 'undefined') ? res[`show_${code}`] : true;
    });
    document.querySelector("#shortcut-lang").value = (typeof res.shortcut_lang !== 'undefined') ? res.shortcut_lang : 'en';

    updateLocaleStrings();
}

function updateLocaleStrings() {
    const i18nElements = document.querySelectorAll('[data-i18n-content]');
    i18nElements.forEach(element => {
        const i18nMessageName = element.getAttribute('data-i18n-content');
        element.innerText = browser.i18n.getMessage(i18nMessageName);
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
