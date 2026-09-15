import { liveSnapshot } from './adapter.mjs';

export function normalizeApiURL(input) {
  let url;
  try { url = new URL(String(input).trim()); } catch { throw new Error('올바른 DOMjudge URL을 입력해 주세요.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('계정 정보나 쿼리가 없는 HTTP(S) DOMjudge URL을 입력해 주세요.');
  }
  let pathname = url.pathname.replace(/\/+$/, '').replace(/\/(?:jury|public|team)(?:\/.*)?$/, '');
  if (!/\/api(?:\/v\d+)?$/.test(pathname)) pathname += '/api/v4';
  url.pathname = pathname + '/';
  return url.href;
}
export function contestURL(api, id) {
  if (typeof id !== 'string' || !id || id.length > 200 || /[\u0000-\u001f]/.test(id) || id === '.' || id === '..') throw new Error('대회 ID를 확인해 주세요.');
  return new URL(`contests/${encodeURIComponent(id)}`, normalizeApiURL(api)).href;
}
export function launchURL(origin, api, id) {
  contestURL(api, id);
  const url = new URL('/contest/spotboard/view/', origin);
  url.searchParams.set('api', normalizeApiURL(api));
  url.searchParams.set('contest', id);
  return url.href;
}
export async function publicJSON(url, { signal, fetcher = fetch } = {}) {
  if (globalThis.location?.protocol === 'https:' && new URL(url).protocol === 'http:') throw new Error('HTTPS 사이트에서는 HTTP API를 읽을 수 없습니다. DOMjudge HTTPS 주소를 사용해 주세요.');
  let response;
  try {
    response = await fetcher(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json' }, signal: signal || AbortSignal.timeout(15000) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    if (error.name === 'TimeoutError') throw new Error('DOMjudge 응답 시간이 초과되었습니다. 다시 시도해 주세요.');
    throw new Error('API에 연결할 수 없습니다. 주소·네트워크와 DOMjudge의 CORS 허용 설정을 확인해 주세요.');
  }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new Error('이 API는 공개 조회가 허용되지 않습니다. DOMjudge에서 공개 대회 접근을 허용해 주세요.');
    throw new Error(`대회를 조회하지 못했습니다 (HTTP ${response.status}). DOMjudge 또는 CLICS API 기본 주소를 확인해 주세요.`);
  }
  try { return await response.json(); } catch { throw new Error('API가 JSON을 반환하지 않았습니다. DOMjudge API 주소를 확인해 주세요.'); }
}
export async function discoverContests(input, options = {}) {
  const api = normalizeApiURL(input);
  const data = await publicJSON(new URL('contests', api).href, options);
  if (!Array.isArray(data)) throw new Error('CLICS API 대회 목록 형식이 아닙니다. API 기본 주소를 확인해 주세요.');
  const seen = new Set();
  const contests = data.filter(c => c && c.closed !== true && (typeof c.id === 'string' || typeof c.id === 'number')).map(c => ({
    id: String(c.id), name: String(c.name || c.formal_name || c.id), start: c.start_time || null, end: c.end_time || null
  })).filter(c => {
    try { contestURL(api, c.id); } catch { return false; }
    if (seen.has(c.id)) return false;
    seen.add(c.id); return true;
  });
  return { api, contests };
}
export async function fetchPublicBoard(api, id, options = {}) {
  const base = contestURL(api, id);
  // Anonymous CLICS requests only. No submissions, judgements, or jury credentials.
  const [contest, problems, teams, board] = await Promise.all([
    base, `${base}/problems`, `${base}/teams`, `${base}/scoreboard`
  ].map(url => publicJSON(url, options)));
  if (!contest || !Array.isArray(problems) || !Array.isArray(teams)) throw new Error('대회 정보를 읽을 수 없습니다.');
  return liveSnapshot(contest, problems, teams, board);
}
