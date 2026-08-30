export const DEFAULT_APRELENDO_BASE_URL = "https://www.aprelendo.com";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);
const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
]);

function parseSupportedPageUrl(url) {
    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch (_error) {
        throw new Error("The current page URL is invalid.");
    }

    if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol)) {
        throw new Error(
            "This page cannot be sent to Aprelendo. Open a regular website page and try again."
        );
    }

    return parsedUrl;
}

function isYouTubeUrl(parsedUrl) {
    if (!YOUTUBE_HOSTS.has(parsedUrl.hostname)) return false;
    if (parsedUrl.hostname === "youtu.be") return true;

    return parsedUrl.pathname === "/watch";
}

export function normalizeAprelendoBaseUrl(baseUrl = DEFAULT_APRELENDO_BASE_URL) {
    const candidate = typeof baseUrl === "string" ? baseUrl.trim() : "";
    if (!candidate) return DEFAULT_APRELENDO_BASE_URL;

    let parsedBaseUrl;

    try {
        parsedBaseUrl = new URL(candidate);
    } catch (_error) {
        throw new Error("The Aprelendo server URL is invalid.");
    }

    if (!SUPPORTED_PROTOCOLS.has(parsedBaseUrl.protocol)) {
        throw new Error("The Aprelendo server URL must use http:// or https://.");
    }

    parsedBaseUrl.hash = "";
    parsedBaseUrl.search = "";

    const trimmedPath = parsedBaseUrl.pathname.replace(/\/+$/, "");
    parsedBaseUrl.pathname = trimmedPath || "/";

    let normalizedBaseUrl = parsedBaseUrl.toString();
    if (trimmedPath) {
        normalizedBaseUrl = normalizedBaseUrl.replace(/\/$/, "");
    }

    return normalizedBaseUrl;
}

export function buildAprelendoUrl(
    url,
    lang,
    baseUrl = DEFAULT_APRELENDO_BASE_URL
) {
    if (!url) throw new Error("No URL provided.");
    if (!lang) throw new Error("No language provided.");

    const parsedUrl = parseSupportedPageUrl(url);
    const path = isYouTubeUrl(parsedUrl) ? "addvideo.php" : "addtext.php";
    const normalizedBaseUrl = normalizeAprelendoBaseUrl(baseUrl);
    const destination = new URL(
        path,
        normalizedBaseUrl.endsWith("/") ? normalizedBaseUrl : `${normalizedBaseUrl}/`
    );

    destination.searchParams.set("lang", lang);
    destination.searchParams.set("url", parsedUrl.toString());

    return destination.toString();
}
