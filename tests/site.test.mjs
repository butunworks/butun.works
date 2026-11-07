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
  assert.match(html, /href="https:\/\/gardro\.butun\.works\/privacy\/"/);
  assert.match(html, /href="https:\/\/gardro\.butun\.works\/delete-account\/"/);
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
