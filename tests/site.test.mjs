// Checks the page against the approved content. Run: node --test tests/site.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');

// Words that must never appear on the site live outside this public repo, one per line.
const PRIVATE = '/root/.config/butunworks/private-words';
test('no private words anywhere on the page', { skip: !existsSync(PRIVATE) && 'no private word list on this machine' }, () => {
  for (const word of readFileSync(PRIVATE, 'utf8').split('\n').map((w) => w.trim()).filter(Boolean)) {
    assert.ok(!html.toLowerCase().includes(word.toLowerCase()), 'a private word is on the page');
  }
});

test('logo with the wordmark to its right', () => {
  assert.match(html, /<img[^>]+src="mark\.png"[^>]+alt="bütün Works"/);
  assert.match(html, /class="word"[^>]*>bütün<span>Works<\/span>/);
  assert.match(html, /\.brand\s*\{[^}]*display:\s*flex/);  // logo and wordmark side by side
});

test('studio lines, the app and its legal links', () => {
  assert.match(text, /We build apps and agentic AI systems\./);
  assert.match(text, /A small studio in Istanbul\. Each app does one job, carefully\./);
  assert.match(text, /Gardro/);
  assert.match(html, /<img class="tile" src="apps\/gardro\.png"/);
  assert.ok(existsSync(new URL('../apps/gardro.png', import.meta.url)));
  assert.match(text, /Screenshot any outfit, save the pieces, mix them with yours and try the look on\./);
  assert.match(text, /Android · coming to Google Play/);
  assert.match(html, /href="https:\/\/getgardro\.com\/privacy\/"/);
  assert.match(html, /href="https:\/\/getgardro\.com\/delete-account\/"/);
});

test('contact and footer', () => {
  assert.match(html, /href="mailto:hello@butun\.works"[^>]*>hello@butun\.works</);
  assert.match(text, /© 2026 bütün Works · Istanbul/);
  assert.match(html, /href="\/privacy\/"/);
  assert.ok(existsSync(new URL('../privacy/index.html', import.meta.url)));
});

test('the points never block the logo', () => {
  // The real logo is in the page from the start; the script only hides it while the points gather.
  assert.match(html, /prefers-reduced-motion/);
  assert.doesNotMatch(html, /<img[^>]+mark\.png[^>]+style="[^"]*opacity:\s*0/);
  assert.doesNotMatch(html, /addEventListener\(["'](click|pointerdown)/);  // no re-scatter on touch
});

test('no tracking and no third-party scripts, as the privacy page says', () => {
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /analytics|gtag|plausible/i);
});

test('share preview and icons', () => {
  assert.match(html, /<meta property="og:image" content="https:\/\/butun\.works\/og\.png">/);
  assert.match(html, /<link rel="icon" href="mark\.png"/);
  assert.ok(existsSync(new URL('../og.png', import.meta.url)));
  assert.ok(existsSync(new URL('../apple-touch-icon.png', import.meta.url)));
});

// in-1129: the opening covers the whole screen and every rendered thing joins it, as on the personal site.
test('the points cover the whole screen, not the content column', () => {
  assert.match(html, /#points\s*\{[^}]*position:\s*fixed[^}]*inset:\s*0/);
  assert.doesNotMatch(html, /top\.prepend\(canvas\)/);
});

test('every rendered thing joins the opening: text, pictures and lines', () => {
  assert.match(html, /createTreeWalker\([^)]*SHOW_TEXT/);          // every text node, word by word
  assert.match(html, /querySelectorAll\("img"\)/);                 // the logo and the app tile
  assert.match(html, /border(Top|Bottom)Width/);                   // the hairlines
  assert.match(html, /textTransform/);                              // uppercase labels drawn as shown
});

test('points scatter radially around their place, never from a box', () => {
  assert.doesNotMatch(html, /Math\.random\(\)\s*\*\s*W/);
  assert.match(html, /vec2\(cos\(ang\), sin\(ang\)\)/);
});

test('the page is never left hidden', () => {
  // the content waits under a cover that lifts by itself after 2.5 s, whatever the script does
  assert.match(html, /\.pending \.wrap > \*\s*\{[^}]*animation:[^}]*2\.5s/);
  assert.match(html, /classList\.remove\("pending"/);
});
