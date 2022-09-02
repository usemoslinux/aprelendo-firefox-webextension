/**
 * Listen for clicks on the buttons, and redirect to the appropriate page
 */
document.addEventListener("click", (e) => {

    function redirect(tabs) {
        let tab = tabs[0]; // Safe to assume there will only be one result

        let aprelendo_url = 'https://www.aprelendo.com/addtext.php?lang=' + e.target.id + '&url=' + encodeURIComponent(tab.url);

        let is_yt_url = false;
        let yt_urls = new Array('https://www.youtube.com/watch',
            'https://m.youtube.com/watch',
            'https://youtu.be/');

        for (let i = 0; i < yt_urls.length; i++) {
            if (tab.url.lastIndexOf(yt_urls[i]) === 0) {
                aprelendo_url = 'https://www.aprelendo.com/addvideo.php?lang=' + e.target.id + '&url=' + encodeURIComponent(tab.url);
                is_yt_url = true;
                break;
            }
        }

        browser.tabs.update({
            url: aprelendo_url
        });
        window.close();
    }

    function onError(err) {
        console.error(err);
    }

    if(e.target.classList.contains('button')) {
        browser.tabs.query({
            currentWindow: true,
            active: true
        }).then(redirect, onError);
    }    
});

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
            element.textContent = "Arabic";
            popup.appendChild(element);
        }
        
        if (res.show_zh || typeof res.show_zh === 'undefined') {
            element = document.createElement('div');
            element.id = "zh";
            element.className = "button zh";
            element.textContent = "Chinese";
            popup.appendChild(element);
        }
        
        if (res.show_nl || typeof res.show_nl === 'undefined') {
            element = document.createElement('div');
            element.id = "nl";
            element.className = "button nl";
            element.textContent = "Dutch";
            popup.appendChild(element);
        }
        
        if (res.show_en || typeof res.show_en === 'undefined') {
            element = document.createElement('div');
            element.id = "en";
            element.className = "button en";
            element.textContent = "English";
            popup.appendChild(element);
        }
        
        if (res.show_fr || typeof res.show_fr === 'undefined') {
            element = document.createElement('div');
            element.id = "fr";
            element.className = "button fr";
            element.textContent = "French";
            popup.appendChild(element);
        }
        
        if (res.show_de || typeof res.show_de === 'undefined') {
            element = document.createElement('div');
            element.id = "de";
            element.className = "button de";
            element.textContent = "German";
            popup.appendChild(element);
        }
        
        if (res.show_el || typeof res.show_el === 'undefined') {
            element = document.createElement('div');
            element.id = "el";
            element.className = "button el";
            element.textContent = "Greek";
            popup.appendChild(element);
        }
        
        if (res.show_he || typeof res.show_he === 'undefined') {
            element = document.createElement('div');
            element.id = "he";
            element.className = "button he";
            element.textContent = "Hebrew";
            popup.appendChild(element);
        }
        
        if (res.show_hi || typeof res.show_hi === 'undefined') {
            element = document.createElement('div');
            element.id = "hi";
            element.className = "button hi";
            element.textContent = "Hindi";
            popup.appendChild(element);
        }
        
        if (res.show_it || typeof res.show_it === 'undefined') {
            element = document.createElement('div');
            element.id = "it";
            element.className = "button it";
            element.textContent = "Italian";
            popup.appendChild(element);
        }
        
        if (res.show_ja || typeof res.show_ja === 'undefined') {
            element = document.createElement('div');
            element.id = "ja";
            element.className = "button ja";
            element.textContent = "Japanese";
            popup.appendChild(element);
        }
        
        if (res.show_ko || typeof res.show_ko === 'undefined') {
            element = document.createElement('div');
            element.id = "ko";
            element.className = "button ko";
            element.textContent = "Korean";
            popup.appendChild(element);
        }
        
        if (res.show_pt || typeof res.show_pt === 'undefined') {
            element = document.createElement('div');
            element.id = "pt";
            element.className = "button pt";
            element.textContent = "Portuguese";
            popup.appendChild(element);
        }
        
        if (res.show_ru || typeof res.show_ru === 'undefined') {
            element = document.createElement('div');
            element.id = "ru";
            element.className = "button ru";
            element.textContent = "Russian";
            popup.appendChild(element);
        }
        
        if (res.show_es || typeof res.show_es === 'undefined') {
            element = document.createElement('div');
            element.id = "es";
            element.className = "button es";
            element.textContent = "Spanish";
            popup.appendChild(element);
        }
    });
});
