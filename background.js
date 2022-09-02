/**
 * Redirects user to Aprelendo to add the text/video shown in active tab
 */
function redirect(msg) {
        browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
            let tab = tabs[0]; // Safe to assume there will only be one result
            let lang = msg.lang;
            let aprelendo_url = 'https://www.aprelendo.com/addtext.php?lang=' + lang + '&url=' + encodeURIComponent(tab.url);

            let is_yt_url = false;
            let yt_urls = new Array('https://www.youtube.com/watch',
                'https://m.youtube.com/watch',
                'https://youtu.be/');

            for (let i = 0; i < yt_urls.length; i++) {
                if (tab.url.lastIndexOf(yt_urls[i]) === 0) {
                    aprelendo_url = 'https://www.aprelendo.com/addvideo.php?lang=' + lang + '&url=' + encodeURIComponent(tab.url);
                    is_yt_url = true;
                    break;
                }
            }

            browser.tabs.update({
                url: aprelendo_url
            });

        }, console.error);
    }

browser.runtime.onMessage.addListener(redirect);

/**
 * User pressed keyboard shortcut to add page to Aprelendo
 * The language used is defined in the Preferences
 */
browser.commands.onCommand.addListener((command) => {
    // add page to Aprelendo using
    if (command === "add-page") {
    browser.storage.sync.get(["shortcut_lang"], (res) => {
        redirect({"lang": res.shortcut_lang});
    });
  }
});
