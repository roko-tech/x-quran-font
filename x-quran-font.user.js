// ==UserScript==
// @name         X Quran Font
// @namespace    https://github.com/roko-tech
// @version      1.0.2
// @description  Shows posts with Quran verses on X in a Naskh font, larger and with taller lines, so the diacritics are readable.
// @author       roko-tech
// @license      MIT
// @homepageURL  https://github.com/roko-tech/x-quran-font
// @supportURL   https://github.com/roko-tech/x-quran-font/issues
// @updateURL    https://raw.githubusercontent.com/roko-tech/x-quran-font/main/x-quran-font.user.js
// @downloadURL  https://raw.githubusercontent.com/roko-tech/x-quran-font/main/x-quran-font.user.js
// @match        https://x.com/*
// @match        https://twitter.com/*
// @resource     quranFont https://cdn.jsdelivr.net/npm/@fontsource/scheherazade-new@5.3.0/files/scheherazade-new-arabic-400-normal.woff2
// @grant        GM_getResourceURL
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    // Brave hides installed fonts from x.com, so the font ships with the script. X's CSP (logged in)
    // blocks font URLs, data: and blob: included, but a FontFace built from bytes loads no URL.
    const fontDataUrl = GM_getResourceURL('quranFont', false);
    const fontBytes = Uint8Array.from(atob(fontDataUrl.slice(fontDataUrl.indexOf(',') + 1)), (c) => c.charCodeAt(0));
    document.fonts.add(new FontFace('X Quran Font', fontBytes, { display: 'swap' }));

    const FONT_SIZE = '1.5rem'; // X's normal post text is 1rem (15px by default)
    const LINE_HEIGHT = '1.9';

    // Uthmani script: alef wasla and the Quranic annotation marks. Ordinary Arabic posts never use them.
    const QURAN_MARKS = /[\u0671\u06D6-\u06ED\u08F0-\u08F2]/;
    const HARAKAT = /[\u064B-\u0652]/g;
    const ARABIC_LETTERS = /[\u0621-\u064A]/g;

    // Uthmani text, or fully vocalised text (verses typed in ordinary spelling with every haraka).
    function isQuran(text) {
        if (QURAN_MARKS.test(text)) return true;
        const marks = (text.match(HARAKAT) || []).length;
        return marks >= 20 && marks >= 0.5 * (text.match(ARABIC_LETTERS) || []).length;
    }

    const style = document.createElement('style');
    style.textContent = `
        [data-testid="tweetText"][data-quran-font] {
            font-family: "X Quran Font", TwitterChirp, "Segoe UI", sans-serif !important;
            font-size: ${FONT_SIZE} !important;
            line-height: ${LINE_HEIGHT} !important;
        }`;
    document.documentElement.append(style);

    // X re-renders posts and swaps their text (e.g. "Show more"), so every batch of changes re-checks all posts.
    let queued = false;
    function scan() {
        queued = false;
        for (const el of document.querySelectorAll('[data-testid="tweetText"]')) {
            el.toggleAttribute('data-quran-font', isQuran(el.textContent));
        }
    }
    new MutationObserver(() => {
        if (!queued) {
            queued = true;
            requestAnimationFrame(scan);
        }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
