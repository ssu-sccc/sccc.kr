import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAC, traceAC, suffixData } from '../src/lib/tutorial/algorithms.mjs';
import { acScanExplanation, suffixBlockExplanation } from '../src/lib/tutorial/explanations.mjs';

test('Each theorem appears once, expanded, at the concept it proves', () => {
  const maps = {
    'aho-corasick': {idea:[1],failure:[2],transition:[3],construction:[4],output:[5],count:[6],implementation:[7]},
    'suffix-array-lcp': {suffix:[1],doubling:[2],kasai:[3,4,5],rmq:[6,7],applications:[8],search:[9],generalized:[10]},
  };
  for(const [slug,mapping] of Object.entries(maps)) {
    const html=fs.readFileSync(`dist/tutorial/${slug}/index.html`,'utf8');
    assert.ok(!html.includes('id="proofs"'));
    const prefix=slug==='aho-corasick'?'aho':'suffix';
    const seen=[...html.matchAll(/data-theorem="(\d+)"/g)].map(m=>Number(m[1]));
    assert.deepEqual(seen,Object.values(mapping).flat());
    for(const [section,ids] of Object.entries(mapping)) {
      const match=html.match(new RegExp(`<section id="${section}"[\\s\\S]*?</section>`));
      assert.ok(match,section);
      for(const id of ids) assert.ok(match[0].includes(`id="${prefix}-theorem-${id}"`));
    }
    const details=[...html.matchAll(/<details([^>]*data-theorem[^>]*)>/g)];
    assert.ok(details.every(m=>/\bopen(?:\s|=|$)/.test(m[1])));
    assert.ok(html.includes('data-reason'));
    assert.ok(html.includes('data-lab-mode'));
    // Internal proof links emitted by controllers all target real, unique anchors.
    const source=fs.readFileSync(`src/scripts/tutorial/${prefix}.ts`,'utf8');
    for(const link of source.matchAll(/href="#([a-z]+-theorem-\d+)"/g)) assert.ok(html.includes(`id="${link[1]}"`));
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
