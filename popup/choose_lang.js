/**
 * Listen for clicks on the buttons, and redirect to the appropriate page
 */
document.addEventListener("click", (e) => {
    browser.runtime.sendMessage({"lang": e.target.id});
    window.close();
});

/**
 * Loads languages shown in menu depending on user selection in Preferences
 */
document.addEventListener("DOMContentLoaded", (e) => {
    var popup = document.querySelector("#popup-content");
    var htmlstr = '';
    var element;
    
    browser.storage.sync.get(['show_ar','show_zh','show_nl','show_en','show_fr',
                             'show_de','show_el','show_he','show_hi','show_it',
                             'show_ja','show_ko','show_pt','show_ru','show_es'], (res) => {   

        if (res.show_ar || typeof res.show_ar === 'undefined') {
            element = document.createElement('div');
            element.id = "ar";
            element.className = "button ar";
            element.textContent = browser.i18n.getMessage("arabicName");
            popup.appendChild(element);
        }
        
        if (res.show_zh || typeof res.show_zh === 'undefined') {
            element = document.createElement('div');
            element.id = "zh";
            element.className = "button zh";
            element.textContent = browser.i18n.getMessage("chineseName");
            popup.appendChild(element);
        }
        
        if (res.show_nl || typeof res.show_nl === 'undefined') {
            element = document.createElement('div');
            element.id = "nl";
            element.className = "button nl";
            element.textContent = browser.i18n.getMessage("dutchName");
            popup.appendChild(element);
        }
        
        if (res.show_en || typeof res.show_en === 'undefined') {
            element = document.createElement('div');
            element.id = "en";
            element.className = "button en";
            element.textContent = browser.i18n.getMessage("englishName");
            popup.appendChild(element);
        }
        
        if (res.show_fr || typeof res.show_fr === 'undefined') {
            element = document.createElement('div');
            element.id = "fr";
            element.className = "button fr";
            element.textContent = browser.i18n.getMessage("frenchName");
            popup.appendChild(element);
        }
        
        if (res.show_de || typeof res.show_de === 'undefined') {
            element = document.createElement('div');
            element.id = "de";
            element.className = "button de";
            element.textContent = browser.i18n.getMessage("germanName");
            popup.appendChild(element);
        }
        
        if (res.show_el || typeof res.show_el === 'undefined') {
            element = document.createElement('div');
            element.id = "el";
            element.className = "button el";
            element.textContent = browser.i18n.getMessage("greekName");
            popup.appendChild(element);
        }
        
        if (res.show_he || typeof res.show_he === 'undefined') {
            element = document.createElement('div');
            element.id = "he";
            element.className = "button he";
            element.textContent = browser.i18n.getMessage("hebrewName");
            popup.appendChild(element);
        }
        
        if (res.show_hi || typeof res.show_hi === 'undefined') {
            element = document.createElement('div');
            element.id = "hi";
            element.className = "button hi";
            element.textContent = browser.i18n.getMessage("hindiName");
            popup.appendChild(element);
        }
        
        if (res.show_it || typeof res.show_it === 'undefined') {
            element = document.createElement('div');
            element.id = "it";
            element.className = "button it";
            element.textContent = browser.i18n.getMessage("italianName");
            popup.appendChild(element);
        }
        
        if (res.show_ja || typeof res.show_ja === 'undefined') {
            element = document.createElement('div');
            element.id = "ja";
            element.className = "button ja";
            element.textContent = browser.i18n.getMessage("japaneseName");
            popup.appendChild(element);
        }
        
        if (res.show_ko || typeof res.show_ko === 'undefined') {
            element = document.createElement('div');
            element.id = "ko";
            element.className = "button ko";
            element.textContent = browser.i18n.getMessage("koreanName");
            popup.appendChild(element);
        }
        
        if (res.show_pt || typeof res.show_pt === 'undefined') {
            element = document.createElement('div');
            element.id = "pt";
            element.className = "button pt";
            element.textContent = browser.i18n.getMessage("portugueseName");
            popup.appendChild(element);
        }
        
        if (res.show_ru || typeof res.show_ru === 'undefined') {
            element = document.createElement('div');
            element.id = "ru";
            element.className = "button ru";
            element.textContent = browser.i18n.getMessage("russianName");
            popup.appendChild(element);
        }
        
        if (res.show_es || typeof res.show_es === 'undefined') {
            element = document.createElement('div');
            element.id = "es";
            element.className = "button es";
            element.textContent = browser.i18n.getMessage("spanishName");
            popup.appendChild(element);
        }
    });
});
