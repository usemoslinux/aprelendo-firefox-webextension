// shared/language_detector.js

// This is a lightweight, dependency-free language detector.
// Its accuracy will not be perfect, but it serves as a starting point.

const languageData = {
    // Languages with unique character sets
    ar: { regex: /[\u0600-\u06FF]/ },
    zh: { regex: /[\u4e00-\u9fa5]/ },
    el: { regex: /[\u0370-\u03FF]/ },
    he: { regex: /[\u0590-\u05FF]/ },
    hi: { regex: /[\u0900-\u097F]/ },
    ja: { regex: /[\u3040-\u309F\u30A0-\u30FF]/ }, // Hiragana/Katakana
    ko: { regex: /[\uAC00-\uD7AF]/ }, // Hangul
    ru: { regex: /[\u0400-\u04FF]/ }, // Cyrillic (covers ru, bg)
    bg: { regex: /[\u0400-\u04FF]/ },

    // Languages sharing Latin script - check for common words
    // Word lists are not exhaustive, just a few high-frequency words.
    fr: { words: ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'à', 'pour', 'que'] },
    es: { words: ['el', 'la', 'los', 'las', 'de', 'del', 'un', 'una', 'y', 'a', 'en', 'que'] },
    de: { words: ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'in', 'zu', 'mit'] },
    it: { words: ['il', 'la', 'le', 'di', 'un', 'una', 'e', 'a', 'che', 'in'] },
    pt: { words: ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'um', 'uma', 'e', 'em', 'que'] },
    nl: { words: ['de', 'het', 'een', 'en', 'van', 'in', 'op', 'is', 'te'] },
    sv: { words: ['en', 'ett', 'den', 'det', 'och', 'i', 'att', 'är', 'på', 'för'] },
    da: { words: ['en', 'et', 'den', 'det', 'og', 'i', 'at', 'er', 'på', 'for'] },
    no: { words: ['en', 'et', 'den', 'det', 'og', 'i', 'at', 'er', 'på', 'for'] },
    pl: { words: ['i', 'w', 'z', 'na', 'się', 'jest', 'to', 'nie', 'dla', 'o'] },
    tr: { words: ['bir', 've', 'bu', 'için', 'ile', 'ama', 'çok', 'olarak'] },
    ro: { words: ['și', 'o', 'un', 'pe', 'cu', 'la', 'din', 'este', 'pentru'] },
    cs: { words: ['a', 'je', 'se', 'na', 'v', 'to', 'z', 'do', 'pro', 's'] },
    hu: { words: ['és', 'a', 'az', 'egy', 'hogy', 'nem', 'van', 'is', 'csak'] },
    vi: { words: ['và', 'là', 'của', 'có', 'một', 'cho', 'không', 'trong', 'để'] },
    hr: { words: ['i', 'u', 'je', 'se', 'na', 'za', 'su', 's', 'od', 'da'] },
    sk: { words: ['a', 'je', 'sa', 'na', 'v', 'to', 'z', 'do', 'pre', 's'] },
    sl: { words: ['in', 'je', 'se', 'na', 'v', 'za', 'so', 'z', 'od', 'da'] },
    en: { words: ['the', 'a', 'an', 'is', 'are', 'in', 'on', 'of', 'and', 'to', 'that'] },
};

export function detectLang(text) {
    if (!text) return null;

    // First, check for languages with unique character sets for a quick and reliable detection
    for (const langCode of ['ar', 'zh', 'el', 'he', 'hi', 'ja', 'ko']) {
        if (languageData[langCode].regex.test(text)) {
            return langCode;
        }
    }
    if (languageData['ru'].regex.test(text)) {
        // Could be 'ru' or 'bg'. Defaulting to 'ru' is a simplification.
        return 'ru';
    }

    // For Latin-script languages, count common word occurrences
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const scores = {};
    let bestLang = 'en'; // Default to English
    let maxScore = 0;

    for (const langCode in languageData) {
        if (languageData[langCode].words) {
            scores[langCode] = 0;
            for (const word of languageData[langCode].words) {
                if (words.includes(word)) {
                    scores[langCode]++;
                }
            }
        }
    }

    for (const langCode in scores) {
        if (scores[langCode] > maxScore) {
            maxScore = scores[langCode];
            bestLang = langCode;
        }
    }

    // Return null if confidence is too low (e.g., short text)
    if (maxScore < 2 && words.length < 20) {
        return null;
    }

    return bestLang;
}
