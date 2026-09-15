import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiURL, contestURL, launchURL, discoverContests, publicJSON, fetchPublicBoard } from '../src/lib/spotboard/clics.mjs';
import { phase } from '../src/lib/spotboard/adapter.mjs';
const json = value => new Response(JSON.stringify(value), {headers:{'Content-Type':'application/json'}});

test('DOMjudge roots and explicit CLICS API roots normalize without losing subpaths', () => {
  for (const suffix of ['', '/', '/jury/', '/public/']) assert.equal(normalizeApiURL(`https://judge.example/domjudge${suffix}`), 'https://judge.example/domjudge/api/v4/');
  assert.equal(normalizeApiURL('https://judge.example/domjudge/api'), 'https://judge.example/domjudge/api/');
  assert.equal(normalizeApiURL('https://judge.example/domjudge/api/v4/'), 'https://judge.example/domjudge/api/v4/');
  for (const value of ['javascript:alert(1)', 'https://jury:secret@judge.example', 'https://judge.example?password=x', 'https://judge.example#secret']) assert.throws(() => normalizeApiURL(value));
});
test('launch links round-trip API and special-character contest IDs with no extra fields', () => {
  const id = '한글 / A&B?#';
  const url = new URL(launchURL('https://sccc.kr', 'https://judge.example/domjudge', id));
  assert.equal(url.pathname, '/contest/spotboard/view/');
  assert.equal(url.searchParams.get('contest'), id);
  assert.equal(url.searchParams.get('api'), 'https://judge.example/domjudge/api/v4/');
  assert.deepEqual([...url.searchParams.keys()], ['api','contest']);
  assert.equal(new URL(contestURL(url.searchParams.get('api'), id)).pathname, '/domjudge/api/v4/contests/'+encodeURIComponent(id));
  for (const id of ['', '.', '..', '\n']) assert.throws(() => contestURL('https://judge.example', id));
});
test('discovery makes one anonymous request and handles duplicates, closed and empty contests', async () => {
  const requests=[];
  const fetcher=async(url,options)=>{requests.push({url,options});return json([{id:7,name:'공개 대회'},{id:7,name:'중복'},{id:'closed',closed:true},{id:'..'},null]);};
  const data=await discoverContests('https://judge.example', {fetcher});
  assert.equal(data.contests.length,1);assert.equal(data.contests[0].id,'7');
  assert.equal(requests[0].url,'https://judge.example/api/v4/contests');
  assert.equal(requests[0].options.credentials,'omit');assert.equal(requests[0].options.mode,'cors');
  assert.deepEqual(requests[0].options.headers,{Accept:'application/json'});
  assert.equal((await discoverContests('https://judge.example',{fetcher:async()=>json([])})).contests.length,0);
});
test('API failures explain public-access, CORS, malformed data, and cancellations', async () => {
  const url='https://judge.example/api/v4/contests';
  await assert.rejects(publicJSON(url,{fetcher:async()=>new Response('',{status:403})}),/공개 조회/);
  await assert.rejects(publicJSON(url,{fetcher:async()=>{throw new TypeError('Failed to fetch');}}),/CORS/);
  await assert.rejects(publicJSON(url,{fetcher:async()=>new Response('<html>login</html>')}),/JSON/);
  await assert.rejects(discoverContests('https://judge.example',{fetcher:async()=>json({})}),/목록 형식/);
  await assert.rejects(publicJSON(url,{fetcher:async()=>{throw new DOMException('cancelled','AbortError');}}),{name:'AbortError'});
});
test('standalone viewer reads only public CLICS endpoints and keeps frozen results pending', async () => {
  const contest={id:'1',name:'Public',duration:'5:00:00',start_time:'2026-01-01T01:00:00Z',end_time:'2026-01-01T06:00:00Z'};
  const state={started:contest.start_time,ended:contest.end_time,frozen:'2026-01-01T05:00:00Z',thawed:null};
  const row={team_id:'team-x',rank:1,score:{num_solved:0,total_time:0},problems:[{problem_id:'a',solved:false,num_judged:1,num_pending:1}]};
  const data={'1':contest,problems:[{id:'a',label:'A',name:'A'}],teams:[{id:'team-x',name:'Team'}],scoreboard:{state,rows:[row]}};
  const calls=[];
  const fetcher=async(url,opts)=>{calls.push(url);assert.equal(opts.credentials,'omit');assert.equal(opts.headers.Authorization,undefined);return json(data[url.split('/').at(-1)]);};
  const snapshot=await fetchPublicBoard('https://judge.example','1',{fetcher});
  assert.equal(calls.length,4);assert.ok(calls.every(x=>!x.includes('?')&&!/user|session|judgements|submissions/.test(x)));
  assert.equal(snapshot.status.frozen,true);assert.deepEqual(snapshot.feed.runs.map(x=>x.result),['No','']);assert.equal(snapshot.contest.teams[0].solved,0);
  state.thawed='2026-01-01T07:00:00Z';row.score={num_solved:1,total_time:280};row.problems[0]={problem_id:'a',solved:true,num_judged:2,num_pending:0,time:260};
  const thawed=await fetchPublicBoard('https://judge.example','1',{fetcher});assert.equal(thawed.status.frozen,false);assert.equal(thawed.contest.teams[0].solved,1);
  row.score={num_solved:0,total_time:0};row.problems[0]={problem_id:'a',solved:false,num_judged:2,num_pending:0};
  const rejudged=await fetchPublicBoard('https://judge.example','1',{fetcher});assert.equal(rejudged.contest.teams[0].solved,0);assert.ok(rejudged.feed.runs.every(x=>x.result!=='Yes'));
});
test('future thaw times do not prematurely reveal the frozen status', () => {
  const now=Date.parse('2026-09-01T10:00:00Z');
  assert.equal(phase({}, {ended:'2026-09-01T09:00:00Z',frozen:'2026-09-01T08:00:00Z',thawed:'2026-09-01T11:00:00Z'}, now).frozen,true);
});
