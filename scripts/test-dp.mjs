import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dpProblems} from '../src/lib/tutorial/dp-problems.mjs';
import {frogExample,vacationExample,knapsackExample,lcsExample,matchingExample} from '../src/lib/tutorial/dp-worked.mjs';
import {stairs,dagCosts,gridPaths,tsp,profileCount,treeIndependent,treeKnapsack,reroot,restore,COST_EDGES,TSP_COST,TREE,WEIGHTS,experimentOptions,experimentFrames} from '../src/lib/tutorial/dp.mjs';

test('Basic examples and reconstruction agree exactly',()=>{
  assert.deepEqual(stairs(5),[1,1,2,3,5,8]);
  assert.deepEqual(gridPaths(3,4),[[1,1,1,1],[1,2,3,4],[1,3,6,10]]);
  const result=dagCosts(6,COST_EDGES);
  assert.deepEqual(result.dp,[0,3,1,2,3,3]);
  assert.deepEqual(result.parent,[-1,0,0,2,2,3]);
  const path=restore(result.parent,5);assert.deepEqual(path,[0,2,3,5]);
  assert.equal(path.slice(1).reduce((s,v,i)=>s+COST_EDGES.find(e=>e[0]===path[i]&&e[1]===v)[2],0),result.dp[5]);
  const events=experimentFrames('basics','topdown');
  for(const {state:s} of events)if(s.type==='finish')for(const u of [s.v-1,s.v-2].filter(x=>x>=0))assert.ok(s.done.includes(u));
  assert.equal(events.at(-1).state.v,5);
});

function bruteTsp(c){let best=Infinity;function dfs(v,seen,cost){if(seen.size===c.length){best=Math.min(best,cost+c[v][0]);return;}for(let u=1;u<c.length;u++)if(!seen.has(u)){seen.add(u);dfs(u,seen,cost+c[v][u]);seen.delete(u);}}if(c.length===1)return 0;dfs(0,new Set([0]),0);return best;}
test('Subset DP matches all permutations, including asymmetric negative edges',()=>{
  assert.equal(tsp(TSP_COST).answer,80);
  for(let n=1;n<=7;n++){const c=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:(i*13+j*17)%23-8));assert.equal(tsp(c).answer,bruteTsp(c));}
  const example=experimentFrames('tsp').find(f=>f.state.mask===5&&f.state.v===2);
  assert.ok(example.html.includes('0111,1'));assert.ok(example.html.includes('1101,3'));
});

function bruteGrid(n,m){let count=0;for(let mask=0;mask<1<<(n*m);mask++){let ok=true;for(let i=0;i<n*m;i++)if(mask>>i&1){if(i%m&&mask>>(i-1)&1)ok=false;if(i>=m&&mask>>(i-m)&1)ok=false;}if(ok)count++;}return count;}
test('Profile DP matches exhaustive grids; frontier bits and row boundaries are consistent',()=>{
  for(let n=1;n<=3;n++)for(let m=1;m<=4;m++)assert.equal(profileCount(n,m).answer,bruteGrid(n,m));
  for(const option of ['checker','empty'])for(const {state:s} of experimentFrames('profile',option))if(s.pos<12){const x=s.next&1;assert.equal(s.next,((s.mask<<1)&15)|x);if(x){assert.equal(s.mask>>3&1,0);if(s.pos%4)assert.equal(s.mask&1,0);}}
});

function bruteTree(g,w){const best=Array(g.length+1).fill(-Infinity);for(let mask=0;mask<1<<g.length;mask++){let ok=true,k=0,value=0;for(let v=0;v<g.length;v++)if(mask>>v&1){k++;value+=w[v];if(g[v].some(u=>mask>>u&1))ok=false;}if(ok)best[k]=Math.max(best[k],value);}return best;}
test('Tree selection and exact-k merges match exhaustive independent sets',()=>{
  for(let n=1;n<=10;n++){const g=Array.from({length:n},()=>[]),w=Array.from({length:n},(_,v)=>v*7%11-3);for(let v=1;v<n;v++){const p=Math.floor((v-1)/2);g[p].push(v);g[v].push(p);}const brute=bruteTree(g,w);assert.equal(treeIndependent(g,w).answer,Math.max(...brute));for(let k=0;k<=n;k++)assert.equal(treeKnapsack(g,w,k).answer,brute[k]);}
  assert.equal(treeIndependent(TREE,WEIGHTS).answer,17);
});

test('Reroot messages equal component sizes and BFS distance sums for every root',()=>{
  for(let n=1;n<=20;n++){const g=Array.from({length:n},()=>[]);for(let v=1;v<n;v++){const p=(v*7)%v || Math.floor((v-1)/3);g[p].push(v);g[v].push(p);}const result=reroot(g);assert.equal(result.messages.length,2*(n-1));for(let root=0;root<n;root++){const dist=Array(n).fill(-1),q=[root];dist[root]=0;for(const v of q)for(const u of g[v])if(dist[u]<0){dist[u]=dist[v]+1;q.push(u);}assert.deepEqual(result.all[root],[n,dist.reduce((a,b)=>a+b,0)]);}for(const msg of result.messages){const seen=new Set([msg.to]),q=[[msg.from,1]];let count=0,sum=0;for(const [v,d] of q){seen.add(v);count++;sum+=d;for(const u of g[v])if(!seen.has(u))q.push([u,d+1]);}assert.deepEqual(msg.value,[count,sum]);}}
});

test('Every experiment and option has complete deterministic frames',()=>{
  for(const [kind,options] of Object.entries(experimentOptions))for(const [option] of options){const frames=experimentFrames(kind,option);assert.ok(frames.length>1);for(const f of frames){assert.ok(f.html&&f.status);assert.ok(!/undefined|NaN|TODO/.test(f.html+f.status));}}
});

test('DP articles and their obsolete redirects are not published',()=>{
  for (const slug of ['dp-basics','bit-dp','tree-dp','dp-reconstruction','profile-dp','rerooting-dp']) {
    assert.equal(fs.existsSync(`dist/tutorial/${slug}/index.html`),false);
    const category=fs.readFileSync('dist/tutorial/category/dp/index.html','utf8');
    assert.ok(!category.includes(`href="/tutorial/${slug}/"`));
    assert.ok(category.includes('id="empty-title"'));
  }
});

test('Retained exercise source data uses the selected judges',()=>{
  const problems=Object.values(dpProblems).flat();
  assert.equal(problems.length,26);
  assert.equal(new Set(problems.map(p=>p.url)).size,26);
  assert.deepEqual([...new Set(problems.map(p=>p.judge))].sort(),['AtCoder','Codeforces','DOJ']);
  for(const p of problems)assert.ok(['atcoder.jp','codeforces.com','doj.kr'].includes(new URL(p.url).hostname));
  assert.ok(!fs.readFileSync('src/components/tutorial/DPWorkedExamples.astro','utf8').match(/BOJ|acmicpc\.net/));
  for(const p of problems.filter(p=>p.judge==='DOJ'))assert.match(p.url,/^https:\/\/doj\.kr\/ko\/problems\/\d+$/);
  for(const p of problems)assert.ok(p.title&&p.hint&&p.state&&p.formula&&p.complexity);
});

test('Worked example tables reproduce their stated results',()=>{
  assert.deepEqual(frogExample().dp,[0,7,2,8,5]);
  assert.deepEqual(vacationExample(),[[4,7,2],[13,7,15],[20,24,17]]);
  assert.deepEqual(knapsackExample().at(-1),[0,0,3,5,6,8]);
  assert.equal(lcsExample().at(-1).at(-1),3);
  assert.deepEqual(matchingExample(),[1,1,1,1,0,1,1,2]);
});
