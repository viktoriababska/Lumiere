import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8');
const script = readFileSync('js/hero-video.js', 'utf8');
const styles = readFileSync('css/hero-video.css', 'utf8');

test('The homepage contains a distinct decorative video for both themes', () => {
  assert.match(html, /data-hero-video="light"/);
  assert.match(html, /data-hero-video="dark"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /muted playsinline loop preload="none"/);
});
test('Videos are valid MP4 files, kept below 5 MB each', () => {
  for (const theme of ['light', 'dark']) {
    const path = `assets/video/hero-${theme}.mp4`;
    const info = statSync(path);
    assert.ok(info.size > 100_000 && info.size < 5_000_000);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
    assert.ok(statSync(`assets/video/hero-${theme}.webp`).size > 1_000);
  }
});
test('A no-motion fallback and muted autoplay fallback are present', () => {
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(script, /selected\.muted = true/);
  assert.match(script, /await selected\.play\(\)/);
  assert.match(script, /catch \(error\)/);
});
test('Theme changes and browser visibility changes update video playback', () => {
  assert.match(script, /lumiere:themechange/);
  assert.match(script, /visibilitychange/);
  assert.match(script, /IntersectionObserver/);
  assert.match(readFileSync('js/theme.js','utf8'), /CustomEvent\('lumiere:themechange'/);
});
