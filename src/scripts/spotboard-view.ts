import { normalizeApiURL, contestURL, fetchPublicBoard } from '../lib/spotboard/clics.mjs';
const frame = document.getElementById('spotboard-frame') as HTMLIFrameElement;
const status = document.getElementById('viewer-status')!;
const button = document.getElementById('viewer-refresh') as HTMLButtonElement;
let api = '', id = '', ready = false, snapshot: any = null, revision = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let request: AbortController | undefined;
function send() {
  if (ready && snapshot) frame.contentWindow?.postMessage({ type: 'sccc:board', snapshot }, location.origin);
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
  if (event.data?.type === 'sccc:ready') { ready = true; send(); }
  if (event.data?.type === 'sccc:error') {
    status.textContent = '전광판을 표시하지 못했습니다. 페이지를 새로고침해 주세요.';
    status.dataset.error = 'true';
  }
});
// Also handshake if the cached iframe became ready before this module loaded.
frame.addEventListener('load', () => {
  ready = false;
  frame.contentWindow?.postMessage({ type: 'sccc:hello' }, location.origin);
});
frame.contentWindow?.postMessage({ type: 'sccc:hello' }, location.origin);
async function refresh() {
  clearTimeout(timer); request?.abort();
  const current = ++revision;
  const controller = request = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), 15000);
  button.disabled = true;
  try {
    const data = await fetchPublicBoard(api, id, { signal: controller.signal });
    if (current !== revision) return;
    snapshot = data; send();
    document.getElementById('viewer-title')!.textContent = data.contest.title;
    document.title = `${data.contest.title} — Spotboard`;
    status.textContent = `${data.status.label} · ${new Date(data.fetchedAt).toLocaleTimeString('ko-KR')} 갱신 · 10초마다 자동 갱신`;
    status.dataset.error = 'false';
  } catch (error) {
    if (current === revision && error.name !== 'AbortError') {
      status.textContent = `${error.message}${snapshot ? ' 마지막으로 받은 결과를 표시하고 있습니다.' : ''}`;
      status.dataset.error = 'true';
    }
  } finally {
    clearTimeout(timeout);
    if (current === revision) { button.disabled = false; timer = setTimeout(refresh, 10000); }
  }
}
try {
  const params = new URLSearchParams(location.search);
  api = normalizeApiURL(params.get('api') || ''); id = params.get('contest') || '';
  contestURL(api, id);
  button.addEventListener('click', refresh);
  refresh();
} catch (error) {
  status.textContent = `${error.message} ‘대회 선택’에서 실행 링크를 다시 만들어 주세요.`;
  status.dataset.error = 'true'; button.disabled = true; frame.hidden = true;
}
window.addEventListener('pagehide', () => { revision++; clearTimeout(timer); request?.abort(); });
