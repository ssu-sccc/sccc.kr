import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { renderMath } from '../src/lib/tutorial/math.mjs';

test('LaTeX is prerendered with accessible MathML; invalid formulas fail closed', () => {
  const html = renderMath(String.raw`\frac{N(N+1)}2-\sum_{r=0}^{N-1}\mathrm{LCP}[r]`, true);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<math/);
  assert.match(html, /encoding="application\/x-tex"/);
  assert.throws(() => renderMath(String.raw`\frac{1}`));
  for (const slug of ['aho-corasick', 'suffix-array-lcp']) {
    const page = fs.readFileSync(`dist/tutorial/${slug}/index.html`, 'utf8');
    assert.ok((page.match(/class="katex"/g) || []).length > 100, slug);
    assert.doesNotMatch(page, /katex-error/);
    assert.match(page, /class="t-math-display"[^>]*tabindex="0"/);
    assert.match(page, /github-dark/); // C++ syntax highlighting stays separate.
    for (const block of page.matchAll(/<pre\b[^>]*>[\s\S]*?<\/pre>/g)) {
      assert.doesNotMatch(block[0], /class="katex"/);
    }
  }
});

test('KaTeX stylesheet and every referenced font ship as local build assets', () => {
  const directory = 'dist/_astro';
  const styles = fs.readdirSync(directory).filter(f => f.endsWith('.css'));
  let fontCount = 0;
  for (const file of styles) {
    const css = fs.readFileSync(path.join(directory, file), 'utf8');
    if (!css.includes('KaTeX_Main')) continue;
    for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
      const url = match[1].replace(/["']/g, '');
      if (!/KaTeX.*\.(?:woff2?|ttf)/.test(url)) continue;
      assert.ok(!/^(?:https?:)?\/\//.test(url), url);
      const local = url.startsWith('/') ? path.join('dist', url) : path.join(directory, url);
      assert.ok(fs.existsSync(local), local);
      fontCount++;
    }
  }
  assert.ok(fontCount > 10);
});
