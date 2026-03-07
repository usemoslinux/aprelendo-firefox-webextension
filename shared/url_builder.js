
export function buildAprelendoUrl(url, lang) {
    if (!url) throw new Error("No URL provided.");
    if (!lang) throw new Error("No language provided.");

    const yt = ['https://www.youtube.com/watch', 'https://m.youtube.com/watch', 'https://youtu.be/'];
    const isYouTube = yt.some(prefix => url.startsWith(prefix));

    if (isYouTube) {
        return `https://www.aprelendo.com/addvideo.php?lang=${lang}&url=${encodeURIComponent(url)}`;
    } else {
        return `https://www.aprelendo.com/addtext.php?lang=${lang}&url=${encodeURIComponent(url)}`;
    }
}
