import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { categories, tutorials, tutorialsFor, categoryUrl, tutorialUrl } from '../src/lib/tutorial/catalog.mjs';

test('Seven categories in requested order, unique slugs, and correct article membership', () => {
  assert.deepEqual(categories.map(c => c.title), ['수학','그래프','DP','자료구조','문자열','기하학','그리디']);
  assert.equal(new Set(categories.map(c=>c.slug)).size,7);
  assert.equal(new Set(tutorials.map(t=>t.slug)).size,tutorials.length);
  for(const item of tutorials) assert.ok(categories.some(c=>c.slug===item.category));
  assert.deepEqual(tutorialsFor('string').map(t=>t.slug), ['aho-corasick','suffix-array-lcp']);
  assert.deepEqual(tutorialsFor('dp').map(t=>t.slug), ['dp-basics','bit-dp','profile-dp','tree-dp','rerooting-dp','dp-reconstruction']);
  for(const c of categories.filter(c=>!['string','dp'].includes(c.slug))) assert.deepEqual(tutorialsFor(c.slug),[]);
});

test('Built category routes, counts, empty states, and stable article back-links', () => {
  const read = url => fs.readFileSync(`dist${url}index.html`,'utf8');
  const home = read('/tutorial/');
  for(const category of categories) {
    assert.ok(home.includes(`href="${categoryUrl(category.slug)}"`));
    const html = read(categoryUrl(category.slug));
    const items = tutorialsFor(category.slug);
    assert.ok(html.includes(`${items.length}편의 튜토리얼`));
    assert.equal(html.includes('id="empty-title"'),items.length===0);
    for(const item of tutorials) {
      assert.equal(html.includes(`href="${tutorialUrl(item.slug)}"`),item.category===category.slug);
    }
    for(const other of categories) assert.ok(html.includes(`href="${categoryUrl(other.slug)}"`));
  }
  for(const item of tutorials) {
    const html=read(tutorialUrl(item.slug));
    assert.ok(html.includes(`href="${categoryUrl(item.category)}"`));
    assert.ok(html.includes('aria-label="현재 위치"'));
  }
});
