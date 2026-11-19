'use strict';

// Runs the userscript in a sandbox with stand-ins for the few page APIs it touches,
// then checks which posts it marks. Rendering on x.com is checked by hand (docs/testing.md).

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SOURCE = readFileSync(path.join(__dirname, '..', 'x-quran-font.user.js'), 'utf8');
const FONT_BYTES = Buffer.from('stand-in woff2 bytes');
const FONT_DATA_URL = `data:font/woff2;base64,${FONT_BYTES.toString('base64')}`;
const MARK = 'data-quran-font';

const TEXT = {
    uthmani: 'ٱلَّذِي جَعَلَ لَكُم مِّنَ ٱلشَّجَرِ ٱلۡأَخۡضَرِ نَارٗا فَإِذَآ أَنتُم مِّنۡهُ تُوقِدُونَ (80)',
    quranicSukunOnly: 'فَإِذَآ أَنتُم مِّنۡهُ تُوقِدُونَ',
    // Kept under 20 harakat so only the Uthmani mark can trigger detection.
    pauseMarkOnly: 'أَوَّلَ مَرَّةٍۖ',
    vocalisedVerses: 'قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    plainArabic: 'صار حادث امام البيت وتكسر الجدار وما عرفت طريقة المطالبة بالتعويض',
    lightTashkeel: 'الحمدُ لله على كل حال، اللهم اجعلنا من الشاكرين',
    shortVocalisedWord: 'شُكْرًا لَكَ',
    english: 'A normal English post with no Arabic at all.',
};

function loadScript() {
    const posts = [];
    const fonts = [];
    const styles = [];
    const resourceCalls = [];
    let observer;
    let pendingFrame;
    let framesRequested = 0;

    const context = {
        atob,
        Uint8Array,
        GM_getResourceURL: (...args) => {
            resourceCalls.push(args);
            return FONT_DATA_URL;
        },
        FontFace: class {
            constructor(family, source, descriptors) {
                Object.assign(this, { family, source, descriptors });
            }
        },
        MutationObserver: class {
            constructor(callback) {
                this.callback = callback;
                observer = this;
            }
            observe(target, options) {
                this.options = options;
            }
        },
        requestAnimationFrame: (callback) => {
            framesRequested += 1;
            pendingFrame = callback;
        },
        document: {
            documentElement: { append: (element) => styles.push(element) },
            createElement: () => ({ textContent: '' }),
            fonts: { add: (face) => fonts.push(face) },
            querySelectorAll: (selector) => {
                assert.equal(selector, '[data-testid="tweetText"]');
                return posts;
            },
        },
    };
    vm.runInNewContext(SOURCE, context);

    function addPost(text) {
        const attributes = new Set();
        const post = {
            textContent: text,
            hasAttribute: (name) => attributes.has(name),
            toggleAttribute: (name, force) => (force ? attributes.add(name) : attributes.delete(name)),
        };
        posts.push(post);
        return post;
    }

    // X changes the page: the observer fires and the scan runs on the next frame.
    function pageChanged() {
        observer.callback([]);
        const frame = pendingFrame;
        pendingFrame = undefined;
        if (frame) frame();
    }

    return { addPost, pageChanged, fonts, styles, resourceCalls, observer, framesRequested: () => framesRequested };
}

test('loads the bundled font from its bytes, not from a URL', () => {
    const page = loadScript();
    assert.deepEqual(page.resourceCalls, [['quranFont', false]]);
    assert.equal(page.fonts.length, 1);
    const [face] = page.fonts;
    assert.equal(face.family, 'X Quran Font');
    assert.deepEqual(Buffer.from(face.source), FONT_BYTES);
    assert.equal(face.descriptors.display, 'swap');
    // X's CSP blocks every font URL, so the stylesheet must not load one.
    assert.equal(page.styles.length, 1);
    assert.doesNotMatch(page.styles[0].textContent, /@font-face|url\(/);
});

test('styles only marked post text, in the bundled font', () => {
    const [style] = loadScript().styles;
    assert.match(style.textContent, /\[data-testid="tweetText"\]\[data-quran-font\]\s*\{/);
    assert.match(style.textContent, /font-family: "X Quran Font"/);
});

test('marks Quran posts and leaves other posts alone', () => {
    const expected = {
        uthmani: true,
        quranicSukunOnly: true,
        pauseMarkOnly: true,
        vocalisedVerses: true,
        plainArabic: false,
        lightTashkeel: false,
        shortVocalisedWord: false,
        english: false,
    };
    const page = loadScript();
    const posts = Object.fromEntries(Object.keys(expected).map((name) => [name, page.addPost(TEXT[name])]));
    page.pageChanged();
    for (const [name, marked] of Object.entries(expected)) {
        assert.equal(posts[name].hasAttribute(MARK), marked, name);
    }
});

test('marks posts that load after the script starts', () => {
    const page = loadScript();
    page.pageChanged();
    const late = page.addPost(TEXT.uthmani);
    page.pageChanged();
    assert.equal(late.hasAttribute(MARK), true);
});

test('rechecks a post when X swaps its text in place', () => {
    const page = loadScript();
    // Spread copies the sandbox's object into this realm so deepEqual compares values only.
    assert.deepEqual({ ...page.observer.options }, { childList: true, subtree: true, characterData: true });
    const post = page.addPost(TEXT.plainArabic);
    page.pageChanged();
    assert.equal(post.hasAttribute(MARK), false);
    post.textContent = TEXT.uthmani;
    page.pageChanged();
    assert.equal(post.hasAttribute(MARK), true);
    post.textContent = TEXT.plainArabic;
    page.pageChanged();
    assert.equal(post.hasAttribute(MARK), false);
});

test('scans at most once per frame however many changes arrive', () => {
    const page = loadScript();
    page.observer.callback([]);
    page.observer.callback([]);
    page.observer.callback([]);
    assert.equal(page.framesRequested(), 1);
});
