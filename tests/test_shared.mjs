import { detectLang } from '../shared/language_detector.js';
import {
  DEFAULT_APRELENDO_BASE_URL,
  buildAprelendoUrl,
  normalizeAprelendoBaseUrl,
} from '../shared/url_builder.js';
import {
  getYouTubeMetadataText,
  getYouTubeVideoId,
  isYouTubeVideoUrl,
} from '../shared/page_language_input.js';
import assert from 'assert';

console.log("Running tests...");

const textUrl = "https://example.com/article";
const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const shortVideoUrl = "https://youtu.be/dQw4w9WgXcQ";

// Test Language Detector
console.log("Testing Language Detector...");
assert.strictEqual(detectLang("This is a simple English sentence."), "en");
assert.strictEqual(detectLang("Ceci est une phrase française simple."), "fr");
assert.strictEqual(detectLang("Dies ist ein einfacher deutscher Satz."), "de");
assert.strictEqual(detectLang("Esta es una oración simple en español."), "es");
assert.strictEqual(
  detectLang("Aquesta és una frase senzilla en català amb paraules comunes."),
  "ca",
);
assert.strictEqual(detectLang("هذا نص عربي بسيط للاختبار."), "ar");
assert.strictEqual(detectLang("Αυτή είναι μια απλή ελληνική πρόταση."), "el");
assert.strictEqual(detectLang("זה משפט פשוט בעברית לבדיקה."), "he");
assert.strictEqual(detectLang("यह परीक्षण के लिए एक सरल हिंदी वाक्य है।"), "hi");
assert.strictEqual(detectLang("이것은 간단한 한국어 문장입니다."), "ko");
assert.strictEqual(
  detectLang("Este é um texto em português com não, para e palavras comuns."),
  "pt",
);
assert.strictEqual(
  detectLang("To jest prosty tekst po polsku i nie tylko dla testu."),
  "pl",
);
assert.strictEqual(
  detectLang("Bu çok basit bir Türkçe cümle ve bu test için yazıldı."),
  "tr",
);
assert.strictEqual(detectLang("这是一个简单的中文句子。"), "zh");
assert.strictEqual(
  detectLang("Това е просто българско изречение на български език."),
  "bg",
);
assert.strictEqual(detectLang("Это простое русское предложение."), "ru");
assert.strictEqual(detectLang("こんにちは、これは日本語です。"), "ja");
assert.strictEqual(
  detectLang("Tiếng Việt có dấu và đây là một câu đơn giản để kiểm tra."),
  "vi",
);
assert.strictEqual(detectLang("???"), null);

// Test YouTube language input
console.log("Testing YouTube language input...");
assert.strictEqual(isYouTubeVideoUrl(videoUrl), true);
assert.strictEqual(isYouTubeVideoUrl(shortVideoUrl), true);
assert.strictEqual(isYouTubeVideoUrl("https://www.youtube.com/results?search_query=test"), false);
assert.strictEqual(isYouTubeVideoUrl(textUrl), false);
assert.strictEqual(getYouTubeVideoId(videoUrl), "dQw4w9WgXcQ");
assert.strictEqual(getYouTubeVideoId(shortVideoUrl), "dQw4w9WgXcQ");
assert.strictEqual(getYouTubeVideoId("https://www.youtube.com/results?search_query=test"), null);

const metadata = new Map([
  ['meta[property="og:title"]', "Une video francaise"],
  ['meta[property="og:description"]', "Une description en francais."],
]);
const mockDocument = {
  querySelector(selector) {
    const content = metadata.get(selector);
    return content ? { content } : null;
  },
  title: "YouTube title fallback",
};
assert.strictEqual(
  getYouTubeMetadataText(mockDocument),
  "Une video francaise Une description en francais.",
);
assert.strictEqual(
  getYouTubeMetadataText({
    querySelector() {
      return null;
    },
    title: "A French video title",
  }),
  "A French video title",
);

// Test URL Builder
console.log("Testing URL Builder...");

assert.strictEqual(normalizeAprelendoBaseUrl(""), DEFAULT_APRELENDO_BASE_URL);
assert.strictEqual(
  normalizeAprelendoBaseUrl(" https://self-hosted.example/aprelendo/// "),
  "https://self-hosted.example/aprelendo",
);

assert.strictEqual(
  buildAprelendoUrl(textUrl, "en"),
  "https://www.aprelendo.com/addtext.php?lang=en&url=https%3A%2F%2Fexample.com%2Farticle",
);

assert.strictEqual(
  buildAprelendoUrl(videoUrl, "fr"),
  "https://www.aprelendo.com/addvideo.php?lang=fr&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ",
);

assert.strictEqual(
  buildAprelendoUrl(shortVideoUrl, "es"),
  "https://www.aprelendo.com/addvideo.php?lang=es&url=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ",
);

assert.strictEqual(
  buildAprelendoUrl(textUrl, "en", "https://self-hosted.example/aprelendo/"),
  "https://self-hosted.example/aprelendo/addtext.php?lang=en&url=https%3A%2F%2Fexample.com%2Farticle",
);

assert.throws(
  () => normalizeAprelendoBaseUrl("ftp://self-hosted.example"),
  /must use http:\/\/ or https:\/\//,
);

assert.throws(
  () => buildAprelendoUrl("about:addons", "en"),
  /cannot be sent to Aprelendo/,
);

assert.throws(
  () => buildAprelendoUrl("moz-extension://abc/options.html", "en"),
  /cannot be sent to Aprelendo/,
);

assert.throws(
  () => buildAprelendoUrl("not a valid url", "en"),
  /page URL is invalid/,
);

console.log("All tests passed!");
