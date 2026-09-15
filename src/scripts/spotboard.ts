import { discoverContests, launchURL } from '../lib/spotboard/clics.mjs';

const input = document.getElementById('judge-url') as HTMLInputElement;
const select = document.getElementById('contest-select') as HTMLSelectElement;
const button = document.getElementById('discover-button') as HTMLButtonElement;
const result = document.getElementById('launch-result')!;
const output = document.getElementById('launch-url') as HTMLTextAreaElement;
const link = document.getElementById('launch-link') as HTMLAnchorElement;
const info = document.getElementById('contest-info')!;
const status = document.getElementById('sb-message')!;
let api = '';
let contests: { id: string; name: string; start: string | null; end: string | null }[] = [];
let version = 0;
let request: AbortController | undefined;
function message(text = '', error = false) {
  status.textContent = text; status.hidden = !text; status.dataset.error = String(error);
}
function clearResult() { result.hidden = true; output.value = ''; link.removeAttribute('href'); }
function reset() {
  version++; request?.abort(); button.disabled = false; api = ''; contests = [];
  clearResult(); select.disabled = true;
  select.replaceChildren(new Option('먼저 대회를 조회하세요', ''));
  info.textContent = 'API에서 공개한 대회 목록을 가져옵니다.'; message();
}
input.addEventListener('input', reset);
document.getElementById('discover-form')!.addEventListener('submit', async event => {
  event.preventDefault(); reset();
  const current = version;
  const controller = request = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), 15000);
  button.disabled = true; message('공개 대회를 조회하고 있습니다…');
  try {
    const data = await discoverContests(input.value, { signal: controller.signal });
    if (current !== version) return;
    api = data.api; contests = data.contests;
    select.replaceChildren(new Option(contests.length ? '대회를 선택하세요' : '공개 대회가 없습니다', ''));
    for (const contest of contests) select.add(new Option(contest.name, contest.id));
    select.disabled = !contests.length;
    message(contests.length ? `${contests.length}개 대회를 찾았습니다.` : '공개된 대회가 없습니다. DOMjudge의 대회 공개 설정을 확인해 주세요.');
  } catch (error) { if (current === version && error.name !== 'AbortError') message(error.message, true); }
  finally { clearTimeout(timeout); if (current === version) button.disabled = false; }
});
select.addEventListener('change', () => {
  clearResult(); const contest = contests.find(c => c.id === select.value);
  if (!contest) return;
  const url = launchURL(location.origin, api, contest.id);
  output.value = url; link.href = url; result.hidden = false;
  const start = contest.start && !Number.isNaN(Date.parse(contest.start)) ? new Date(contest.start).toLocaleString('ko-KR') : '시작 시간 미정';
  info.textContent = `${contest.name} · ${start}`; message('실행 링크를 생성했습니다.');
});
document.getElementById('copy-link')!.addEventListener('click', async () => {
  if (!output.value) return;
  const url = output.value;
  try { await navigator.clipboard.writeText(url); if (output.value === url) message('실행 링크를 복사했습니다.'); }
  catch { output.focus(); output.select(); message('링크를 선택했습니다. 복사 단축키로 복사해 주세요.'); }
});
window.addEventListener('pagehide', () => request?.abort());
