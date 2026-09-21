import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAC, traceAC, suffixData } from '../src/lib/tutorial/algorithms.mjs';
import { acScanExplanation, suffixBlockExplanation } from '../src/lib/tutorial/explanations.mjs';

test('Removed string articles are not published; the category remains', () => {
  for (const slug of ['aho-corasick','suffix-array-lcp']) {
    assert.equal(fs.existsSync(`dist/tutorial/${slug}/index.html`), false);
    const category = fs.readFileSync('dist/tutorial/category/string/index.html','utf8');
    assert.ok(!category.includes(`href="/tutorial/${slug}/"`));
    assert.ok(category.includes('id="empty-title"'));
  }
});

test('Failure snapshots do not consume text or emit; stable state differs from fallback candidate', () => {
  for(const [patterns,text] of [[['he','she','his','hers'],'ushers'],[['a','aa','aaa'],'aaaa'],[['ab','bab','bc','bca','c','caa'],'abccabcaab']]) {
    const ac=buildAC(patterns),trace=traceAC(ac,text);
    for(let k=0;k<trace.length;k++) {
      const s=trace[k],e=acScanExplanation(ac,text,s);
      assert.equal(e.processed+e.remaining,text);
      assert.equal(e.pending,text[e.consumed]??null);
      const chain=[];
      for(let v=e.stable;;v=ac.nodes[v].fail){chain.push(v);if(v===0)break;}
      assert.deepEqual(e.candidates.map(n=>n.v),chain);
      if(s.kind==='fail') {
        assert.equal(e.consumed,trace[k-1].pos+1);
        assert.equal(e.newMatches.length,0);
        assert.equal(s.v,ac.nodes[s.from].fail);
      } else assert.equal(e.active,e.stable);
    }
  }
});

test('Block inspector uses previous-stage ranks and preserves ties, including absent second blocks', () => {
  for(const text of ['a','banana','aaaaaa','aabaa','zyxwvuts']) {
    const d=suffixData(text);
    for(let step=0;step<d.stages.length;step++) for(let i=0;i<d.n;i++) {
      const e=suffixBlockExplanation(d,step,i),s=d.stages[step];
      assert.equal(e.first+e.second,text.slice(i,i+s.width));
      if(step>0) {
        const prev=d.stages[step-1].ranks;
        assert.deepEqual(e.keys,[prev[i],i+s.k<d.n?prev[i+s.k]:-1]);
      }
      for(const j of e.tied) assert.equal(text.slice(j,j+s.width),text.slice(i,i+s.width));
    }
  }
});
