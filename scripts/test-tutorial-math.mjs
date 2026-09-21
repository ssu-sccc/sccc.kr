import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMath } from '../src/lib/tutorial/math.mjs';

test('LaTeX is prerendered with accessible MathML; invalid formulas fail closed', () => {
  const html = renderMath(String.raw`\frac{N(N+1)}2-\sum_{r=0}^{N-1}\mathrm{LCP}[r]`, true);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<math/);
  assert.match(html, /encoding="application\/x-tex"/);
  assert.throws(() => renderMath(String.raw`\frac{1}`));
});
