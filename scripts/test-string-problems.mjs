import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stringProblems} from '../src/lib/tutorial/string-problems.mjs';
import {renderMath} from '../src/lib/tutorial/math.mjs';

test('each string tutorial has six verified-judge exercises with valid math and links',()=>{
  for(const [course,slug] of [['aho','aho-corasick'],['suffix','suffix-array-lcp']]){
    const problems=stringProblems[course];
    assert.equal(problems.length,6);
    const html=readFileSync(`dist/tutorial/${slug}/index.html`,'utf8');
    const section=html.slice(html.indexOf('id="exercises"'),html.indexOf('<footer class="t-sources"'));
    assert.equal((section.match(/<article /g)||[]).length,6);
    assert.equal((section.match(/<details>/g)||[]).length,6);
    assert.match(html,/href="#exercises"/);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length);
    for(const p of problems){
      for(const field of ['task','approach','reason','hint','complexity','costNote']) assert.ok(p[field],field);
      assert.ok(['atcoder.jp','codeforces.com','doj.kr'].includes(new URL(p.url).hostname));
      assert.ok(ids.includes(p.anchor),p.anchor);
      assert.ok(section.includes(p.url),p.url);
      assert.doesNotThrow(()=>renderMath(p.formula,true));
      assert.doesNotThrow(()=>renderMath(p.complexity));
    }
    assert.doesNotMatch(section,/acmicpc|BOJ|katex-error/);
  }
});

test('Match & Catch adjacent-pair formula agrees with exhaustive short binary strings',()=>{
  const words=[];
  for(let len=1;len<=4;len++) for(let mask=0;mask<2**len;mask++)
    words.push(Array.from({length:len},(_,i)=>mask>>i&1?'b':'a').join(''));
  const counts=s=>{
    const m=new Map();
    for(let i=0;i<s.length;i++) for(let j=i+1;j<=s.length;j++){
      const p=s.slice(i,j);m.set(p,(m.get(p)||0)+1);
    }
    return m;
  };
  for(const a of words) for(const b of words){
    const ca=counts(a),cb=counts(b);
    let expected=Infinity;
    for(const [p,n] of ca) if(n===1&&cb.get(p)===1) expected=Math.min(expected,p.length);
    const s=a+'#'+b+'$',sa=Array.from({length:s.length},(_,i)=>i).sort((i,j)=>s.slice(i)<s.slice(j)?-1:1);
    const owner=i=>i<a.length?0:i>a.length&&i<a.length+1+b.length?1:-1;
    const lcp=sa.map((i,r)=>{
      if(!r)return 0;
      let h=0;while(i+h<s.length&&sa[r-1]+h<s.length&&s[i+h]===s[sa[r-1]+h])h++;
      return h;
    });
    let actual=Infinity;
    for(let r=0;r+1<sa.length;r++){
      if(owner(sa[r])<0||owner(sa[r+1])<0||owner(sa[r])===owner(sa[r+1]))continue;
      const d=1+Math.max(lcp[r],lcp[r+2]||0);
      if(d<=lcp[r+1])actual=Math.min(actual,d);
    }
    assert.equal(actual,expected,`${a}, ${b}`);
  }
});
