/**
 * Listen for clicks on the buttons, and redirect to the appropriate page
 */
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("button")) {
        browser.runtime.sendMessage({"lang": e.target.id});
        window.close();
    }
});

/**
 * Loads languages shown in menu depending on user selection in Preferences
 */
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.querySelector("#popup-content");
    const languages = [
        { code: 'ar', name: 'arabicName' },
        { code: 'bg', name: 'bulgarianName' },
        { code: 'ca', name: 'catalanName' },
        { code: 'zh', name: 'chineseName' },
        { code: 'hr', name: 'croatianName' },
        { code: 'cs', name: 'czechName' },
        { code: 'da', name: 'danishName' },
        { code: 'nl', name: 'dutchName' },
        { code: 'en', name: 'englishName' },
        { code: 'fr', name: 'frenchName' },
        { code: 'de', name: 'germanName' },
        { code: 'el', name: 'greekName' },
        { code: 'he', name: 'hebrewName' },
        { code: 'hi', name: 'hindiName' },
        { code: 'hu', name: 'hungarianName' },
        { code: 'it', name: 'italianName' },
        { code: 'ja', name: 'japaneseName' },
        { code: 'ko', name: 'koreanName' },
        { code: 'no', name: 'norwegianName' },
        { code: 'pl', name: 'polishName' },
        { code: 'pt', name: 'portugueseName' },
        { code: 'ro', name: 'romanianName' },
        { code: 'ru', name: 'russianName' },
        { code: 'sk', name: 'slovakName' },
        { code: 'sl', name: 'slovenianName' },
        { code: 'es', name: 'spanishName' },
        { code: 'sv', name: 'swedishName' },
        { code: 'tr', name: 'turkishName' },
        { code: 'vi', name: 'vietnameseName' }
    ];

    browser.storage.sync.get(languages.map(lang => `show_${lang.code}`), (res) => {
        languages.forEach(lang => {
            if (res[`show_${lang.code}`] || typeof res[`show_${lang.code}`] === 'undefined') {
                const element = document.createElement('div');
                element.id = lang.code;
                element.className = `button ${lang.code}`;
                element.textContent = browser.i18n.getMessage(lang.name);
                popup.appendChild(element);
            }
        });
    });
});

