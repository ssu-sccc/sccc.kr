import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const output = process.argv[2] || 'dist';
const checksums = read('third-party/spotboard/checksums.json');
for (const [file, expected] of Object.entries(checksums)) {
  const location = file === 'index.html' ? 'third-party/spotboard/index.html' : path.join('public/vendor/spotboard', file);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(location)).digest('hex'), expected, `Modified upstream file: ${file}`);
}
const sizes = [[23, 12, 442], [23, 8, 239], [22, 8, 146]];
for (let id = 1; id <= 3; id++) {
  for (const file of ['contest', 'runs', 'meta']) {
    const original = read(`content/data/contest/2026-skh/div${id}-${file}.json`);
    const served = read(`public/contest/2026-skh/data/div${id}/${file}.json`);
    if (file === 'contest') {
      original.problems.forEach(p => { if (['#violet', '#purple'].includes(p.color)) p.color = p.color.slice(1); });
      assert.equal(served.teams.length, sizes[id - 1][0]);
      assert.equal(served.problems.length, sizes[id - 1][1]);
      for (const p of served.problems) assert.ok(fs.existsSync(`public/vendor/spotboard/assets/balloons/${p.color}.png`), `Missing balloon: ${p.color}`);
    }
    if (file === 'runs') assert.equal(served.runs.length, sizes[id - 1][2]);
    assert.deepEqual(served, original, `Data changed: div${id}/${file}`);
    assert.deepEqual(read(`${output}/contest/2026-skh/data/div${id}/${file}.json`), served);
  }
  const html = fs.readFileSync(`${output}/contest/2026-skh/div${id}/index.html`, 'utf8');
  assert.ok(html.includes(`config.apiBase = '/contest/2026-skh/data/div${id}/'`));
  assert.ok(html.includes('text/x-handlebar-template'));
  assert.ok(html.includes('<base href="/vendor/spotboard/">'));
  for (const [, relative] of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g)) {
    assert.ok(fs.existsSync(path.join(output, 'vendor/spotboard', relative)), `Missing asset: ${relative}`);
  }
}
console.log(`Verified ${Object.keys(checksums).length} unmodified Spotboard release files, 3 divisions and 827 submissions.`);
