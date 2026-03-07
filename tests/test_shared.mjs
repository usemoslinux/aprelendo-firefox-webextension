import { detectLang } from '../shared/language_detector.js';
import { buildAprelendoUrl } from '../shared/url_builder.js';
import assert from 'assert';

console.log("Running tests...");

// Test Language Detector
console.log("Testing Language Detector...");
assert.strictEqual(detectLang("This is a simple English sentence."), "en");
assert.strictEqual(detectLang("Ceci est une phrase française simple."), "fr");
assert.strictEqual(detectLang("Dies ist ein einfacher deutscher Satz."), "de");
assert.strictEqual(detectLang("Esta es una oración simple en español."), "es");
assert.strictEqual(detectLang("这是一个简单的中文句子。"), "zh"); // Chinese
assert.strictEqual(detectLang("Это простое русское предложение."), "ru"); // Russian
assert.strictEqual(detectLang("こんにちは、これは日本語です。"), "ja"); // Japanese

// Test URL Builder
console.log("Testing URL Builder...");
const textUrl = "https://example.com/article";
const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const shortVideoUrl = "https://youtu.be/dQw4w9WgXcQ";

assert.strictEqual(
    buildAprelendoUrl(textUrl, "en"),
    "https://www.aprelendo.com/addtext.php?lang=en&url=https%3A%2F%2Fexample.com%2Farticle"
);

assert.strictEqual(
    buildAprelendoUrl(videoUrl, "fr"),
    "https://www.aprelendo.com/addvideo.php?lang=fr&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ"
);

assert.strictEqual(
    buildAprelendoUrl(shortVideoUrl, "es"),
    "https://www.aprelendo.com/addvideo.php?lang=es&url=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ"
);

console.log("All tests passed!");
