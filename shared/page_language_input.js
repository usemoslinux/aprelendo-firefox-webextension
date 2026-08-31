const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export function isYouTubeVideoUrl(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (_error) {
    return false;
  }

  if (!YOUTUBE_HOSTS.has(parsedUrl.hostname)) return false;
  if (parsedUrl.hostname === "youtu.be") return true;

  return parsedUrl.pathname === "/watch";
}

export function getYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    if (!isYouTubeVideoUrl(parsedUrl.toString())) return null;

    return parsedUrl.hostname === "youtu.be"
      ? parsedUrl.pathname.slice(1) || null
      : parsedUrl.searchParams.get("v");
  } catch (_error) {
    return null;
  }
}

export function getYouTubeMetadataText(document) {
  const selectors = [
    'meta[property="og:title"]',
    'meta[name="title"]',
    'meta[property="og:description"]',
    'meta[name="description"]',
  ];
  const values = selectors
    .map((selector) => document.querySelector(selector)?.content?.trim())
    .filter(Boolean);

  if (!values.length && document.title) values.push(document.title.trim());

  return values.join(" ").slice(0, 5000);
}
