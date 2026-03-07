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
  fr: {
    words: [
      "le",
      "la",
      "les",
      "de",
      "du",
      "des",
      "un",
      "une",
      "et",
      "à",
      "pour",
      "que",
      "est",
      "ce",
      "il",
      "elle",
      "en",
      "dans",
    ],
  },
  es: {
    words: [
      "el",
      "la",
      "los",
      "las",
      "de",
      "del",
      "un",
      "una",
      "y",
      "a",
      "en",
      "que",
      "es",
      "por",
      "con",
      "para",
    ],
  },
  de: {
    words: [
      "der",
      "die",
      "das",
      "und",
      "ist",
      "ein",
      "eine",
      "in",
      "zu",
      "mit",
      "den",
      "von",
      "nicht",
      "sie",
    ],
  },
  it: {
    words: [
      "il",
      "la",
      "le",
      "di",
      "un",
      "una",
      "e",
      "a",
      "che",
      "in",
      "per",
      "non",
      "sono",
      "del",
    ],
  },
  pt: {
    words: [
      "o",
      "a",
      "os",
      "as",
      "de",
      "do",
      "da",
      "um",
      "uma",
      "e",
      "em",
      "que",
      "é",
      "com",
      "não",
      "para",
    ],
  },
  nl: {
    words: [
      "de",
      "het",
      "een",
      "en",
      "van",
      "in",
      "op",
      "is",
      "te",
      "niet",
      "dat",
      "ik",
    ],
  },
  sv: {
    words: [
      "en",
      "ett",
      "den",
      "det",
      "och",
      "i",
      "att",
      "är",
      "på",
      "för",
      "inte",
      "som",
    ],
  },
  da: {
    words: [
      "en",
      "et",
      "den",
      "det",
      "og",
      "i",
      "at",
      "er",
      "på",
      "for",
      "ikke",
      "som",
    ],
  },
  no: {
    words: [
      "en",
      "et",
      "den",
      "det",
      "og",
      "i",
      "at",
      "er",
      "på",
      "for",
      "ikke",
      "som",
    ],
  },
  pl: {
    words: [
      "i",
      "w",
      "z",
      "na",
      "się",
      "jest",
      "to",
      "nie",
      "dla",
      "o",
      "jak",
      "ale",
    ],
  },
  tr: {
    words: [
      "bir",
      "ve",
      "bu",
      "için",
      "ile",
      "ama",
      "çok",
      "olarak",
      "da",
      "de",
      "en",
    ],
  },
  ro: {
    words: [
      "și",
      "o",
      "un",
      "pe",
      "cu",
      "la",
      "din",
      "este",
      "pentru",
      "nu",
      "să",
      "în",
    ],
  },
  cs: {
    words: ["a", "je", "se", "na", "v", "to", "z", "do", "pro", "s", "že", "o"],
  },
  hu: {
    words: [
      "és",
      "a",
      "az",
      "egy",
      "hogy",
      "nem",
      "van",
      "is",
      "csak",
      "meg",
      "el",
    ],
  },
  vi: {
    words: [
      "và",
      "là",
      "của",
      "có",
      "một",
      "cho",
      "không",
      "trong",
      "để",
      "người",
      "khi",
    ],
  },
  hr: {
    words: [
      "i",
      "u",
      "je",
      "se",
      "na",
      "za",
      "su",
      "s",
      "od",
      "da",
      "ne",
      "kako",
    ],
  },
  sk: {
    words: ["a", "je", "sa", "na", "v", "to", "z", "do", "pre", "s", "že", "o"],
  },
  sl: {
    words: [
      "in",
      "je",
      "se",
      "na",
      "v",
      "za",
      "so",
      "z",
      "od",
      "da",
      "ne",
      "kako",
    ],
  },
  en: {
    words: [
      "the",
      "a",
      "an",
      "is",
      "are",
      "in",
      "on",
      "of",
      "and",
      "to",
      "that",
      "this",
      "it",
      "with",
      "as",
      "for",
      "be",
      "was",
      "not",
    ],
  },
};

export function detectLang(text) {
  if (!text) return null;

  // First, check for languages with unique character sets
  for (const langCode of ["ar", "ja", "zh", "el", "he", "hi", "ko"]) {
    if (languageData[langCode].regex.test(text)) {
      return langCode;
    }
  }
  if (languageData["ru"].regex.test(text)) {
    return "ru";
  }

  // For Latin-script languages, count common word occurrences
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const scores = {};
  let bestLang = null;
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

  // Return null if confidence is too low.
  if (maxScore < 1) return null;
  if (maxScore < 2 && words.length < 10) return null;

  return bestLang;
}
