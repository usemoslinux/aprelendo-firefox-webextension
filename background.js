
function redirect(tabs) {
    let tab = tabs[0]; // Safe to assume there will only be one result
    
    let aprelendo_url = 'https://www.aprelendo.com/addtext.php?url='+encodeURIComponent(tab.url);
    
    var is_yt_url = false;
    var yt_urls = new Array('https://www.youtube.com/watch',
                            'https://m.youtube.com/watch',
                            'https://youtu.be/');
                
    for (let i = 0; i < yt_urls.length; i++) {
       	if (tab.url.lastIndexOf(yt_urls[i]) === 0) {
	       	    aprelendo_url = 'https://www.aprelendo.com/addvideo.php?url='+encodeURIComponent(tab.url);
                is_yt_url = true;
                break;
        	}
        }

    browser.tabs.update({url: aprelendo_url});
}

function onError(err){
    console.error(err);
}

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({currentWindow: true, active: true}).then(redirect, onError);
});
