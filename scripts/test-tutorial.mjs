import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAC, traceAC, countAC, suffixData, queryLCP } from '../src/lib/tutorial/algorithms.mjs';

function bruteLCP(s, i, j) { let h = 0; while (i + h < s.length && j + h < s.length && s[i + h] === s[j + h]) h++; return h; }
function binaryStrings(max) {
  const all = [];
  for (let n = 1; n <= max; n++) for (let m = 0; m < 2 ** n; m++) all.push(m.toString(2).padStart(n, '0').replaceAll('0', 'a').replaceAll('1', 'b'));
  return all;
}

test('Suffix arrays, inverse ranks, Kasai and every RMQ agree with brute force', () => {
  for (const s of [...binaryStrings(7), 'banana', 'mississippi', 'zyxwvuts', 'abcdefghijklmnopqr']) {
    const d = suffixData(s), expected = Array.from({ length: s.length }, (_, i) => i).sort((a, b) => s.slice(a) < s.slice(b) ? -1 : 1);
    assert.deepEqual(d.sa, expected, s);
    d.sa.forEach((i, r) => assert.equal(d.rank[i], r));
    assert.deepEqual(d.lcp, expected.map((i, r) => r ? bruteLCP(s, expected[r - 1], i) : 0));
    for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) assert.equal(queryLCP(d, i, j).value, bruteLCP(s, i, j));
    for (const k of d.kasai) assert.ok(k.seed <= k.h);
  }
});

test('AC failures are longest proper suffixes; completed transitions preserve invariant', () => {
  for (const patterns of [['he','she','his','hers'], ['a','aa','aaa'], ['ab','bab','bc','bca','c','caa'], ['a','a','ab']]) {
    const ac = buildAC(patterns);
    for (const [i, n] of ac.nodes.entries()) {
      const suffix = ac.nodes.filter(x => x.prefix.length < n.prefix.length && n.prefix.endsWith(x.prefix)).sort((a,b) => b.prefix.length-a.prefix.length)[0];
      assert.equal(ac.nodes[n.fail].prefix, suffix?.prefix ?? '');
      for (const c of [...ac.alphabet, 'z']) {
        const expected = ac.nodes.filter(x => (n.prefix + c).endsWith(x.prefix)).sort((a,b) => b.prefix.length-a.prefix.length)[0];
        assert.equal(ac.nodes[n.go[c] ?? 0].prefix, expected.prefix, `${i} ${c}`);
      }
    }
    for (const text of ['', 'ushers', 'aaaaaa', 'zzzz', 'abccabcaab', ...binaryStrings(5)]) {
      const steps = traceAC(ac, text), last = steps.at(-1), expected = [];
      for (let end = 0; end < text.length; end++) patterns.forEach((p,id) => { const start = end-p.length+1; if (start>=0 && text.slice(start,end+1)===p) expected.push({id,pattern:p,start,end}); });
      const order = (a,b) => a.end-b.end || a.id-b.id;
      assert.deepEqual([...last.matches].sort(order), expected.sort(order));
      const count = countAC(ac, last.visits).at(-1).counts;
      patterns.forEach((_,id) => assert.equal(count[ac.ends[id]], expected.filter(m => m.id===id).length));
      for (const step of steps.filter(s=>s.kind==='read')) {
        const prefix = text.slice(0,step.pos+1);
        const expectedState = ac.nodes.filter(x=>prefix.endsWith(x.prefix)).sort((a,b)=>b.prefix.length-a.prefix.length)[0];
        assert.equal(ac.nodes[step.v].prefix, expectedState.prefix);
      }
    }
  }
});
