import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = name => readFileSync(resolve(root,name),'utf8');
const pages = ['index.html','catalog.html','about.html','account.html','privacy.html','returns.html'];

test('all six HTML pages have one consistent theme system', () => {
  for (const name of pages) {
    const html=read(name);
    assert.match(html, /data-theme-toggle/,name);
    assert.match(html, /css\/theme-polish\.css/,name);
    assert.match(html, /js\/theme\.js/,name);
    assert.match(html, /theme-prepaint/,name);
  }
});
test('dark mode persists and uses Tailwind dark: utilities',()=>{
  assert.match(read('js/theme.js'),/localStorage\.setItem\(key, theme\)/);
  assert.match(read('js/theme.js'),/classList\.toggle\('dark'/);
  assert.match(read('tailwind-source.css'),/@custom-variant dark/);
  assert.match(read('about.html'),/dark:bg-neutral-900/);
});
test('provided dark banner images are present and referenced',()=>{
  assert.ok(existsSync(resolve(root,'assets/images/hero-dark.jpg')));
  assert.ok(existsSync(resolve(root,'assets/images/about-dark.jpg')));
  const css=read('css/theme-polish.css');
  assert.match(css,/hero-dark\.jpg/);assert.match(css,/about-dark\.jpg/);
});
test('all six pages include valid SEO descriptions and Open Graph cards',()=>{
  for(const page of pages){
    const html=read(page);
    assert.match(html,/<meta content="[^"]+" name="description"\s*\/>/,page);
    assert.match(html,/property="og:title"/,page);
    assert.match(html,/property="og:image"/,page);
  }
});
test('relative HTML, CSS, JS and image references point to local files',()=>{
  for (const name of pages){
    const html=read(name);
    const refs=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
    for(const ref of refs){
      if (!ref || ref.startsWith('#') || /^(https?:|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
      const target=ref.split(/[?#]/)[0];
      if (!target || target==='/')continue;
      assert.ok(existsSync(resolve(root,target)), `${name}: missing ${target}`);
    }
  }
});
test('two independent CDN plugins and defensive style finder survive refactoring',()=>{
  const html=read('index.html');
  assert.match(html,/swiper@11/);
  assert.match(html,/@fancyapps\/ui@5/);
  assert.match(html,/js\/style-finder\.mjs/);
  assert.match(read('js/lookbook.js'),/lumiere-fallback-dot/);
});
test('mock JSON is valid and uses safe async text rendering with graceful fallback',()=>{
  const data=JSON.parse(read('data.json'));
  assert.equal(data.brandHighlights.length,3);
  for(const item of data.brandHighlights){assert.ok(item.value && item.label)}
  const js=read('js/mock-content.js');
  assert.match(js,/await fetch\('data.json'/);
  assert.match(js,/\.textContent/);
  assert.match(js,/catch \(error\)/);
});
test('forms and interaction scripts still included',()=>{
  assert.match(read('index.html'),/js\/validation\.js/);
  assert.match(read('js/app.js'),/openModal\('quickview'/);
  assert.match(read('js/app.js'),/closeModal\(/);
});
