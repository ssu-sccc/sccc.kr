import { buildAC, traceAC, countAC } from '../../lib/tutorial/algorithms.mjs';
import { player } from './player';

const root = document.querySelector<HTMLElement>('[data-ac-lab]');
if (root) {
  const get = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const presets = { classic: ['he', 'she', 'his', 'hers'], overlap: ['a', 'aa', 'aaa'], branch: ['ab', 'bab', 'bc', 'bca', 'c', 'caa'] };
  let ac = buildAC(presets.classic), text = 'ushers', trace = traceAC(ac, text), counts = countAC(ac, trace.at(-1).visits);
  let mode = 'scan', selected = 0, stepNow = 0;
  const label = (v: number) => ac.nodes[v].prefix || 'ε';
  const length = () => mode === 'trie' ? ac.nodes.length : mode === 'failure' ? ac.bfs.length : mode === 'count' ? counts.length : trace.length;
  function detail() {
    const n = ac.nodes[selected];
    const output: string[] = [];
    for (let u = selected; u !== -1; u = ac.nodes[u].out) for (const id of ac.nodes[u].terminal) output.push(ac.patterns[id]);
    const known = mode !== 'trie' && (mode !== 'failure' || ac.bfs.indexOf(selected) <= stepNow);
    get('[data-details]').innerHTML = `<div><dt>선택 상태</dt><dd>${label(selected)} · #${selected}</dd></div><div><dt>fail / 가장 긴 유효 접미사</dt><dd>${known ? label(n.fail) : '아직 구성 전'}</dd></div><div><dt>${known ? 'terminal + output link' : '현재 terminal'}</dt><dd>${known ? output.join(', ') || '없음' : n.terminal.map((id: number) => ac.patterns[id]).join(', ') || '없음'}</dd></div>`;
    const c = get<HTMLSelectElement>('[data-transition]').value;
    get('[data-transition-info]').textContent = `next[${label(selected)}][${c}] = ${n.next[c] === undefined ? '없음' : label(n.next[c])} · go = ${known && mode !== 'failure' ? label(n.go[c] ?? 0) : '구성 완료 후 확인'}`;
  }
  function graph(active: number, from: number, visible: number, countValues?: number[]) {
    const nodes = ac.nodes;
    const groups: number[][] = [];
    const depth = (v: number): number => v === 0 ? 0 : (mode === 'count' ? depth(nodes[v].fail) + 1 : nodes[v].prefix.length);
    nodes.forEach((_: unknown, i: number) => { const d = depth(i); (groups[d] ??= []).push(i); });
    const height = Math.max(320, Math.max(...groups.map(g => g.length)) * 82 + 40);
    const coords = nodes.map((_: unknown, i: number) => { const d = depth(i); return { x: 65 + d * (670 / Math.max(1, groups.length - 1)), y: (groups[d].indexOf(i) + 1) * height / (groups[d].length + 1) }; });
    const svg = root!.querySelector<SVGElement>('[data-graph]')!;
    svg.setAttribute('viewBox', `0 0 800 ${height}`);
    let html = '<defs><marker id="ac-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" style="fill:#8e43a0;stroke:none"/></marker></defs>';
    nodes.forEach((n: any, i: number) => {
      if (!i || i > visible) return;
      const p = mode === 'count' ? n.fail : n.parent, a = coords[p], b = coords[i];
      html += `<path class="${mode === 'count' && i === active ? 'active-edge' : ''}" d="M${a.x + 26},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x - 26},${b.y}"/>`;
      if (mode !== 'count') html += `<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 12}">${n.prefix.at(-1)}</text>`;
    });
    const showFail = selected > 0 && mode !== 'trie' && mode !== 'count' && (mode !== 'failure' || ac.bfs.indexOf(selected) <= stepNow);
    if (showFail) {
      const a = coords[selected], b = coords[nodes[selected].fail];
      html += `<path class="fail-edge ${mode === 'scan' && trace[stepNow].kind === 'fail' ? 'active-edge' : ''}" marker-end="url(#ac-arrow)" d="M${a.x},${a.y - 27} Q${(a.x + b.x) / 2},${Math.max(12, Math.min(a.y, b.y) - 80)} ${b.x},${b.y - 29}"/>`;
    }
    if (mode === 'scan' && from !== active && trace[stepNow].kind !== 'start') {
      const a = coords[from], b = coords[active];
      html += `<path class="active-edge" d="M${a.x},${a.y} Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - 35} ${b.x},${b.y}"/>`;
    }
    nodes.forEach((n: any, i: number) => {
      if (i > visible) return;
      const { x, y } = coords[i];
      html += `<g class="${n.terminal.length ? 'terminal' : ''} ${i === selected ? 'focused' : ''}"><circle cx="${x}" cy="${y}" r="27"/><text x="${x}" y="${y}">${label(i)}</text></g>${countValues ? `<text class="node-count" x="${x}" y="${y + 43}">cnt=${countValues[i]}</text>` : ''}`;
    });
    svg.innerHTML = html;
  }
  function render(step: number, retain = false) {
    stepNow = step;
    const snapshot = mode === 'scan' ? trace[step] : null;
    const active = mode === 'trie' ? step : mode === 'failure' ? ac.bfs[step] : mode === 'count' ? counts[step].v : snapshot.v;
    if (!retain) selected = active;
    const visible = mode === 'trie' ? step : ac.nodes.length - 1;
    let note = '';
    if (mode === 'trie') note = step === 0 ? 'root는 빈 문자열 ε이다. 다음을 눌러 패턴의 접두사 노드를 삽입.' : `새 접두사 ${label(step)} 삽입. 부모 ${label(ac.nodes[step].parent)}와 실제 Trie 간선으로 연결된다.${ac.nodes[step].terminal.length ? ' 패턴이 끝나므로 terminal이다.' : ''}`;
    else if (mode === 'failure') note = active === 0 ? 'fail[root] = root. BFS는 얕은 노드부터 진행한다.' : `BFS ${step}: fail[${label(active)}] = ${label(ac.nodes[active].fail)}. 처리 순서: ${ac.bfs.slice(0, step + 1).map(label).join(' → ')}`;
    else note = mode === 'count' ? counts[step].note : snapshot.note;
    get('[data-status]').textContent = note;
    get('.t-legend').innerHTML = mode === 'count' ? '<span>실선: fail[v]를 부모로 둔 트리</span><b>초록 숫자: 현재 누적 횟수</b><span>파랑: 선택 상태</span>' : '<span>실선: Trie 간선</span><em>점선: 선택 상태의 failure link</em><b>초록 테두리: terminal</b><span>파랑: 선택 상태</span>';
    get('[data-text]').innerHTML = [...text].map((c, i) => `<span class="t-char ${snapshot && i <= snapshot.pos ? 'is-read' : ''} ${snapshot && i === snapshot.pos ? 'is-current' : ''}"><small>${i}</small>${c}</span>`).join('');
    graph(active, snapshot?.from ?? active, visible, mode === 'count' ? counts[step].counts : undefined);
    get('[data-nodes]').innerHTML = ac.nodes.slice(0, visible + 1).map((_: unknown, i: number) => `<button type="button" data-node="${i}" aria-pressed="${i === selected}">${label(i)}</button>`).join('');
    detail();
    get('[data-result-title]').textContent = mode === 'count' ? (step === counts.length - 1 ? '누적 완료 · 패턴별 총 등장 횟수' : '누적 진행 중 · 패턴 끝 노드의 현재 값') : '발견한 패턴 · [시작, 끝]';
    get('[data-results]').innerHTML = mode === 'count' ? ac.patterns.map((p: string, id: number) => `<span class="t-pill">${p}: ${counts[step].counts[ac.ends[id]]}회</span>`).join('') : (snapshot?.matches.length ? snapshot.matches.map((m: any) => `<span class="t-pill">${m.pattern} [${m.start}, ${m.end}]</span>`).join('') : '<span class="t-number">아직 출력된 매칭이 없다.</span>');
    get('[data-transition]').closest('.t-query')!.toggleAttribute('hidden', mode === 'count');
  }
  const playback = player(root, length, render);
  function init() {
    trace = traceAC(ac, text); counts = countAC(ac, trace.at(-1).visits);
    get('[data-transition]').innerHTML = [...new Set([...ac.alphabet, 'z'])].map(c => `<option>${c}</option>`).join('');
    playback.reset();
  }
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.onclick = () => {
    mode = b.dataset.mode!;
    root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    playback.reset();
  });
  get('[data-nodes]').onclick = e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-node]');
    if (b) { selected = Number(b.dataset.node); render(stepNow, true); }
  };
  get('[data-transition]').onchange = detail;
  get<HTMLFormElement>('[data-ac-form]').onsubmit = e => {
    e.preventDefault(); const form = new FormData(e.currentTarget as HTMLFormElement), nextText = String(form.get('text'));
    if (!/^[a-z]{1,32}$/.test(nextText)) { get('[data-error]').textContent = '본문은 영문 소문자 1–32자로 입력 필요.'; return; }
    text = nextText; ac = buildAC(presets[String(form.get('patterns')) as keyof typeof presets]); get('[data-error]').textContent = ''; init();
  };
  init();
}
