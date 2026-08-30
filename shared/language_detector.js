// shared/language_detector.js

// This is a lightweight, dependency-free language detector.
// Its accuracy will not be perfect, but it serves as a starting point.

const scriptDetectors = {
  ar: /[\u0600-\u06FF]/,
  zh: /[\u4E00-\u9FFF]/,
  el: /[\u0370-\u03FF]/,
  he: /[\u0590-\u05FF]/,
  hi: /[\u0900-\u097F]/,
  ja: /[\u3040-\u309F\u30A0-\u30FF]/, // Hiragana/Katakana
  ko: /[\uAC00-\uD7AF]/, // Hangul
  cyrillic: /[\u0400-\u04FF]/,
};

const languageData = {
  // Languages with unique character sets
  ar: {},
  zh: {},
  el: {},
  he: {},
  hi: {},
  ja: {},
  ko: {},
  bg: {
    words: [
      "и",
      "в",
      "на",
      "се",
      "че",
      "за",
      "не",
      "са",
      "с",
      "по",
      "как",
      "от",
      "е",
      "ще",
      "като",
      "той",
      "тя",
      "това",
    ],
  },
  ca: {
    words: [
      "el",
      "la",
      "els",
      "les",
      "de",
      "del",
      "un",
      "una",
      "i",
      "que",
      "és",
      "en",
      "per",
      "amb",
      "aquesta",
      "aquest",
    ],
  },
  ru: {
    words: [
      "и",
      "в",
      "не",
      "на",
      "что",
      "я",
      "с",
      "он",
      "как",
      "это",
      "по",
      "но",
      "к",
      "из",
      "у",
      "за",
      "от",
      "так",
    ],
  },

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

function tokenize(text) {
  return Array.from(text.toLowerCase().matchAll(/\p{L}+/gu), (match) => match[0]);
}

function getCandidateLanguages(text) {
  if (scriptDetectors.ar.test(text)) return ["ar"];
  if (scriptDetectors.ja.test(text)) return ["ja"];
  if (scriptDetectors.zh.test(text)) return ["zh"];
  if (scriptDetectors.el.test(text)) return ["el"];
  if (scriptDetectors.he.test(text)) return ["he"];
  if (scriptDetectors.hi.test(text)) return ["hi"];
  if (scriptDetectors.ko.test(text)) return ["ko"];
  if (scriptDetectors.cyrillic.test(text)) return ["bg", "ru"];

  return Object.keys(languageData).filter((langCode) => languageData[langCode].words);
}

export function detectLang(text) {
  if (!text) return null;

  const candidateLanguages = getCandidateLanguages(text);
  if (candidateLanguages.length === 1 && !languageData[candidateLanguages[0]].words) {
    return candidateLanguages[0];
  }

  const words = tokenize(text);
  if (!words.length) return null;

  const wordCounts = new Map();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  let bestLang = null;
  let bestScore = 0;
  let secondBestScore = 0;
  const needsHigherConfidence = candidateLanguages.length > 2;

  for (const langCode of candidateLanguages) {
    const langWords = languageData[langCode].words;
    if (!langWords) continue;

    let score = 0;
    for (const word of langWords) {
      score += wordCounts.get(word) || 0;
    }

    if (score > bestScore) {
      secondBestScore = bestScore;
      bestScore = score;
      bestLang = langCode;
    } else if (score > secondBestScore) {
      secondBestScore = score;
    }
  }

  // Return null if confidence is too low or the best score is tied.
  if (bestScore < 1) return null;
  if (bestScore === secondBestScore) return null;
  if (needsHigherConfidence && bestScore < 2 && words.length < 10) return null;

  return bestLang;
}
