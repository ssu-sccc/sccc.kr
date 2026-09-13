import { suffixData, queryLCP } from '../../lib/tutorial/algorithms.mjs';
import { suffixBlockExplanation } from '../../lib/tutorial/explanations.mjs';
import { player } from './player';

const root = document.querySelector<HTMLElement>('[data-sa-lab]');
if (root) {
  const get = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  let data = suffixData('banana'), mode = 'sort', stepNow=0;
  const chars = (i: number, h: number, seed = 0) => [...data.text.slice(i)].map((c, k) => k < h ? `<mark class="${k < seed ? 'reused' : ''}">${c}</mark>` : `<span class="${k === h ? 'boundary' : ''}">${c}</span>`).join('') + (i + h === data.n ? '<span class="boundary">∅</span>' : '');
  function table(values: number[], computed?: Set<number>, query?: ReturnType<typeof queryLCP>) {
    get('[data-array-table]').innerHTML = data.sa.map((i: number, r: number) => `<tr><td>${r}</td><td>${i}</td><td>${data.text.slice(i)}</td><td class="${query?.indices.includes(r) ? (values[r] === query.value ? 'min-cell' : 'range-cell') : ''}">${!computed || computed.has(r) ? values[r] : '·'}</td></tr>`).join('');
  }
  function query() {
    const i = Number(get<HTMLSelectElement>('[data-query-i]').value), j = Number(get<HTMLSelectElement>('[data-query-j]').value), q = queryLCP(data, i, j);
    get('[data-answer]').textContent = String(q.value);
    get('[data-query-compare]').innerHTML = `<div>S[${i}…] = ${chars(i, q.value)}</div><div>S[${j}…] = ${chars(j, q.value)}</div>`;
    get('[data-range]').textContent = i === j ? `동일한 접미사: N − i = ${data.n} − ${i} = ${q.value}. RMQ를 하지 않는다.` : `rank[${i}] = ${data.rank[i]}, rank[${j}] = ${data.rank[j]} → min(LCP[${q.left + 1}…${q.right}]) = min(${q.indices.map((r: number) => data.lcp[r]).join(', ')}) = ${q.value}`;
    get('[data-reason]').innerHTML=`<h4>원문 좌표 → 정렬 좌표 → 사이의 간선</h4><div class="t-reason-grid"><div><small>첫 시작 위치 → 순위</small><strong>${i} → ${data.rank[i]}</strong></div><div><small>둘째 시작 위치 → 순위</small><strong>${j} → ${data.rank[j]}</strong></div><div><small>${i===j?'동일 접미사의 길이':'연결 구간 최솟값'}</small><strong>${q.value}</strong></div></div><p>${i===j?'같은 순위이므로 연결할 간선이 없다. N−i를 직접 반환한다.':`LCP[${q.left}]는 왼쪽 바깥으로 나가는 간선이므로 제외한다. ${q.left+1}부터 ${q.right}까지 연결을 통과하며 유지되는 길이는 최솟값 ${q.value}이다.`}</p><a href="#suffix-theorem-6">RMQ 동치의 증명 →</a>`;
    const ranks=Array.from({length:q.right-q.left+1},(_,k)=>q.left+k);
    get('[data-query-chain]').innerHTML=ranks.map((r:number,index:number)=>`${index?`<li class="${data.lcp[r]===q.value?'bottleneck':''}">LCP[${r}]=${data.lcp[r]} →</li>`:''}<li>r=${r} · 시작 ${data.sa[r]}<code>${data.text.slice(data.sa[r])}</code></li>`).join('');
    table(data.lcp, undefined, q);
  }
  function render(step: number) {
    stepNow=step;
    get('[data-sort-panel]').hidden = mode !== 'sort';
    get('[data-kasai-panel]').hidden = mode !== 'kasai';
    get('[data-query-panel]').hidden = mode !== 'query';
    get('[data-table-panel]').hidden = mode === 'sort';
    get('.t-controls').hidden = mode === 'query';
    if (mode === 'sort') {
      const stage = data.stages[step];
      const inspect=Number(get<HTMLSelectElement>('[data-inspect-suffix]').value);
      const e=suffixBlockExplanation(data,step,inspect);
      get('[data-reason]').innerHTML=`<h4>${stage.k?'이전 순위 두 개 → 새 동치류 번호':'초기 단계: 첫 문자가 같으면 같은 번호'}</h4><p>선택한 시작 위치 i=${inspect}. ${stage.k?`각 블록의 길이는 최대 ${stage.k}. 블록은 원문 순서대로 붙어 있다.`:'첫 문자만 비교한다.'}</p><div class="t-key-blocks"><div class="t-block-first"><small>첫 블록 · rank ${e.keys[0]}</small><code>${e.first}</code></div>${stage.k?`<div class="t-block-second"><small>둘째 블록 · rank ${e.keys[1]}</small><code>${e.second||'∅'}</code></div>`:''}<div><small>새 rank</small><code>${e.rank}</code></div></div><p>같은 새 rank를 가진 시작 위치: ${e.tied.join(', ')}. ${e.complete?'모든 동치류가 하나씩이므로 전체 순서가 결정됐다.':'동률은 앞부분만 같다는 뜻이다. 다음에는 비교 길이를 두 배로 늘린다.'}</p><a href="#suffix-theorem-2">두 블록 비교의 정당성 →</a>`;
      get('[data-status]').textContent = `${stage.k ? `앞 ${stage.width}글자 기준: 이전 ${stage.k}글자의 rank 두 개로 정렬한다.` : '첫 문자 기준으로 정렬하고 같은 문자에 같은 rank를 준다.'} ${new Set(stage.ranks).size === data.n ? '모든 rank가 달라졌으므로 SA 구성이 완료된다.' : '동률이 남아 있으므로 다음 단계에서 비교 길이를 두 배로 늘린다.'}`;
      data.sa.forEach((i: number) => {
        const row = get(`[data-suffix="${i}"]`);
        row.style.transform = `translateY(${stage.sa.indexOf(i) * 54}px)`;
        row.setAttribute('aria-posinset', String(stage.sa.indexOf(i) + 1));
        row.style.borderColor=i===inspect?'#086bdf':'';
        row.innerHTML = `<small>${i}</small><code><mark class="t-block-first">${data.text.slice(i,i+(stage.k||1))}</mark>${stage.k?`<mark class="t-block-second">${data.text.slice(i+stage.k,i+stage.width)}</mark>`:''}${data.text.slice(i + stage.width)}</code><small>${stage.keys[i].join(', ')}</small><b>${stage.ranks[i]}</b>`;
      });
      // Accessible ordered equivalent to the visually reordered rows.
      get('[data-sort]').setAttribute('aria-label', `현재 시작 인덱스 순서: ${stage.sa.join(', ')}. 앞 ${stage.width}글자 기준.`);
    } else if (mode === 'kasai') {
      const k = data.kasai[step];
      get('[data-reason]').innerHTML=`<h4>${k.r?'재사용 구간과 새 비교 구간을 분리':'이전 이웃이 없는 경계 경우'}</h4><div class="t-reason-grid"><div><small>원문 위치 → 저장할 순위</small><strong>i=${k.i} → r=${k.r}</strong></div><div><small>초록 · 비교 생략</small><strong>${k.seed}글자</strong></div><div><small>파랑 · 새로 확인</small><strong>${k.h-k.seed}글자</strong></div></div><p>${k.r?`재사용 길이 ${k.seed}는 하한이다. 실제 상대 j=${k.j}는 SA에서 다시 찾는다. 불일치 또는 한쪽 끝까지 추가로 확인한 뒤 LCP[${k.r}]=${k.h}를 기록한다.`:'rank=0에는 이전 이웃이 없다. LCP[0]=0으로 정의하고 h=0으로 초기화한다.'}</p><p>다음은 정렬상 다음 행이 아니라 원문 위치 i+1이다.</p><a href="#suffix-theorem-4">비교 상대가 바뀌어도 h−1이 유지되는 증명 →</a>`;
      get('[data-status]').textContent = k.r === 0 ? `i=${k.i}, rank[i]=0. 사전순 이전 접미사가 없으므로 LCP[0]=0, h=0으로 초기화한다.` : `i=${k.i}: 바로 이전 접미사는 j=SA[${k.r - 1}]=${k.j}. ${k.seed}글자는 재사용하고 ${k.h - k.seed}글자를 더 일치시킨다. LCP[${k.r}]=${k.h}. 다음 i에는 h=${k.next}부터 시작한다.`;
      get('[data-compare]').innerHTML = `<div>S[${k.i}…] = ${chars(k.i, k.h, k.seed)}</div>` + (k.j >= 0 ? `<div>S[${k.j}…] = ${chars(k.j, k.h, k.seed)}</div>` : '<div>이전 접미사 없음</div>');
      get('[data-kasai-detail]').innerHTML = `<div><dt>재사용한 h</dt><dd>${k.seed}</dd></div><div><dt>이번 LCP[${k.r}]</dt><dd>${k.h}</dd></div><div><dt>다음 시작 길이</dt><dd>${k.next}</dd></div>`;
      table(k.lcp, new Set([0, ...data.kasai.slice(0, step + 1).map((s: any) => s.r)]));
    } else {
      get('[data-status]').textContent = '두 접미사 사이의 LCP 구간을 파란색으로, 그중 최솟값을 진한 파란색으로 표시한다. 입력한 숫자는 SA 순위가 아니라 본문의 시작 위치이다.';
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
    get('[data-inspect-suffix]').innerHTML=options;
    get<HTMLSelectElement>('[data-inspect-suffix]').value=String(Math.min(1,data.n-1));
    get('[data-query-i]').innerHTML = options; get('[data-query-j]').innerHTML = options;
    get<HTMLSelectElement>('[data-query-i]').value = String(Math.min(1, data.n - 1));
    get<HTMLSelectElement>('[data-query-j]').value = String(Math.min(3, data.n - 1));
    playback.reset();
  }
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.onclick = () => {
    mode = b.dataset.mode!; root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); playback.reset();
  });
  get('[data-inspect-suffix]').onchange = () => render(stepNow);
  get('[data-query-i]').onchange = query; get('[data-query-j]').onchange = query;
  get<HTMLFormElement>('[data-sa-form]').onsubmit = e => {
    e.preventDefault(); const text = String(new FormData(e.currentTarget as HTMLFormElement).get('text'));
    if (!/^[a-z]{1,18}$/.test(text)) { get('[data-error]').textContent = '영문 소문자 1–18자로 입력 필요.'; return; }
    data = suffixData(text); get('[data-error]').textContent = ''; init();
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-lab-mode]').forEach(link => {
    link.onclick = () => root.querySelector<HTMLButtonElement>(`[data-mode="${link.dataset.labMode}"]`)?.click();
  });
  init();
}
