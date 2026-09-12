import { suffixData, queryLCP } from '../../lib/tutorial/algorithms.mjs';
import { player } from './player';

const root = document.querySelector<HTMLElement>('[data-sa-lab]');
if (root) {
  const get = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  let data = suffixData('banana'), mode = 'sort';
  const chars = (i: number, h: number, seed = 0) => [...data.text.slice(i)].map((c, k) => k < h ? `<mark class="${k < seed ? 'reused' : ''}">${c}</mark>` : `<span class="${k === h ? 'boundary' : ''}">${c}</span>`).join('') + (i + h === data.n ? '<span class="boundary">∅</span>' : '');
  function table(values: number[], computed?: Set<number>, query?: ReturnType<typeof queryLCP>) {
    get('[data-array-table]').innerHTML = data.sa.map((i: number, r: number) => `<tr><td>${r}</td><td>${i}</td><td>${data.text.slice(i)}</td><td class="${query?.indices.includes(r) ? (values[r] === query.value ? 'min-cell' : 'range-cell') : ''}">${!computed || computed.has(r) ? values[r] : '·'}</td></tr>`).join('');
  }
  function query() {
    const i = Number(get<HTMLSelectElement>('[data-query-i]').value), j = Number(get<HTMLSelectElement>('[data-query-j]').value), q = queryLCP(data, i, j);
    get('[data-answer]').textContent = String(q.value);
    get('[data-query-compare]').innerHTML = `<div>S[${i}…] = ${chars(i, q.value)}</div><div>S[${j}…] = ${chars(j, q.value)}</div>`;
    get('[data-range]').textContent = i === j ? `동일한 접미사: N − i = ${data.n} − ${i} = ${q.value}. RMQ를 하지 않습니다.` : `rank[${i}] = ${data.rank[i]}, rank[${j}] = ${data.rank[j]} → min(LCP[${q.left + 1}…${q.right}]) = min(${q.indices.map((r: number) => data.lcp[r]).join(', ')}) = ${q.value}`;
    table(data.lcp, undefined, q);
  }
  function render(step: number) {
    get('[data-sort-panel]').hidden = mode !== 'sort';
    get('[data-kasai-panel]').hidden = mode !== 'kasai';
    get('[data-query-panel]').hidden = mode !== 'query';
    get('[data-table-panel]').hidden = mode === 'sort';
    get('.t-controls').hidden = mode === 'query';
    if (mode === 'sort') {
      const stage = data.stages[step];
      get('[data-status]').textContent = `${stage.k ? `앞 ${stage.width}글자 기준: 이전 ${stage.k}글자의 rank 두 개로 정렬합니다.` : '첫 문자 기준으로 정렬하고 같은 문자에 같은 rank를 줍니다.'} ${new Set(stage.ranks).size === data.n ? '모든 rank가 달라졌습니다. SA 완성!' : '동률이 남아 있으므로 다음 단계에서 비교 길이를 두 배로 늘립니다.'}`;
      data.sa.forEach((i: number) => {
        const row = get(`[data-suffix="${i}"]`);
        row.style.transform = `translateY(${stage.sa.indexOf(i) * 54}px)`;
        row.setAttribute('aria-posinset', String(stage.sa.indexOf(i) + 1));
        row.innerHTML = `<small>${i}</small><code><mark>${data.text.slice(i, i + stage.width)}</mark>${data.text.slice(i + stage.width)}</code><small>${stage.keys[i].join(', ')}</small><b>${stage.ranks[i]}</b>`;
      });
      // Accessible ordered equivalent to the visually reordered rows.
      get('[data-sort]').setAttribute('aria-label', `현재 시작 인덱스 순서: ${stage.sa.join(', ')}. 앞 ${stage.width}글자 기준.`);
    } else if (mode === 'kasai') {
      const k = data.kasai[step];
      get('[data-status]').textContent = k.r === 0 ? `i=${k.i}, rank[i]=0. 사전순 이전 접미사가 없으므로 LCP[0]=0, h=0으로 초기화합니다.` : `i=${k.i}: 바로 이전 접미사는 j=SA[${k.r - 1}]=${k.j}. ${k.seed}글자는 재사용하고 ${k.h - k.seed}글자를 더 일치시킵니다. LCP[${k.r}]=${k.h}. 다음 i에는 h=${k.next}부터 시작합니다.`;
      get('[data-compare]').innerHTML = `<div>S[${k.i}…] = ${chars(k.i, k.h, k.seed)}</div>` + (k.j >= 0 ? `<div>S[${k.j}…] = ${chars(k.j, k.h, k.seed)}</div>` : '<div>이전 접미사 없음</div>');
      get('[data-kasai-detail]').innerHTML = `<div><dt>재사용한 h</dt><dd>${k.seed}</dd></div><div><dt>이번 LCP[${k.r}]</dt><dd>${k.h}</dd></div><div><dt>다음 시작 길이</dt><dd>${k.next}</dd></div>`;
      table(k.lcp, new Set([0, ...data.kasai.slice(0, step + 1).map((s: any) => s.r)]));
    } else {
      get('[data-status]').textContent = '두 접미사 사이의 LCP 구간을 파란색으로, 그중 최솟값을 진한 파란색으로 표시합니다. 입력한 숫자는 SA 순위가 아니라 본문의 시작 위치입니다.';
      query();
    }
  }
  const playback = player(root, () => mode === 'kasai' ? data.kasai.length : data.stages.length, render);
  function init() {
    get('[data-text]').innerHTML = [...data.text].map((c, i) => `<span class="t-char"><small>${i}</small>${c}</span>`).join('');
    get('[data-sort]').style.height = `${data.n * 54}px`;
    get('[data-sort]').setAttribute('role', 'list');
    get('[data-sort]').innerHTML = Array.from({ length: data.n }, (_, i) => `<div class="t-suffix-row" role="listitem" aria-setsize="${data.n}" data-suffix="${i}" style="transform:translateY(${i * 54}px)"></div>`).join('');
    const options = Array.from({ length: data.n }, (_, i) => `<option value="${i}">${i}: ${data.text.slice(i)}</option>`).join('');
    get('[data-query-i]').innerHTML = options; get('[data-query-j]').innerHTML = options;
    get<HTMLSelectElement>('[data-query-i]').value = String(Math.min(1, data.n - 1));
    get<HTMLSelectElement>('[data-query-j]').value = String(Math.min(3, data.n - 1));
    playback.reset();
  }
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.onclick = () => {
    mode = b.dataset.mode!; root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); playback.reset();
  });
  get('[data-query-i]').onchange = query; get('[data-query-j]').onchange = query;
  get<HTMLFormElement>('[data-sa-form]').onsubmit = e => {
    e.preventDefault(); const text = String(new FormData(e.currentTarget as HTMLFormElement).get('text'));
    if (!/^[a-z]{1,18}$/.test(text)) { get('[data-error]').textContent = '영문 소문자 1–18자로 입력하세요.'; return; }
    data = suffixData(text); get('[data-error]').textContent = ''; init();
  };
  init();
}
