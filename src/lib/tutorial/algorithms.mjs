// All indices are zero-based. Demonstrations accept lowercase ASCII only.
export function buildAC(patterns) {
  if (!patterns.length || patterns.some(p => !/^[a-z]+$/.test(p))) throw new Error('Nonempty lowercase patterns required');
  const nodes = [{ next: {}, go: {}, fail: 0, out: -1, terminal: [], prefix: '', parent: -1 }];
  const ends = [];
  patterns.forEach((p, id) => {
    let v = 0;
    for (const c of p) {
      if (nodes[v].next[c] === undefined) {
        nodes[v].next[c] = nodes.length;
        nodes.push({ next: {}, go: {}, fail: 0, out: -1, terminal: [], prefix: nodes[v].prefix + c, parent: v });
      }
      v = nodes[v].next[c];
    }
    nodes[v].terminal.push(id);
    ends.push(v);
  });
  const alphabet = [...new Set(patterns.join(''))].sort();
  const bfs = [0];
  for (const c of alphabet) {
    const u = nodes[0].next[c];
    nodes[0].go[c] = u ?? 0;
    if (u !== undefined) bfs.push(u);
  }
  for (let k = 1; k < bfs.length; k++) {
    const v = bfs[k], f = nodes[v].fail;
    nodes[v].out = nodes[f].terminal.length ? f : nodes[f].out;
    for (const c of alphabet) {
      const u = nodes[v].next[c];
      if (u === undefined) nodes[v].go[c] = nodes[f].go[c];
      else {
        nodes[v].go[c] = u;
        nodes[u].fail = nodes[f].go[c];
        bfs.push(u);
      }
    }
  }
  return { nodes, bfs, alphabet, patterns, ends };
}

export function traceAC(ac, text) {
  const { nodes, patterns } = ac;
  let v = 0;
  const matches = [], visits = nodes.map(() => 0);
  const steps = [{ kind: 'start', v: 0, from: 0, pos: -1, c: '', matches: [], visits: [...visits], note: 'root에서 시작한다. 아직 읽은 문자는 없다.' }];
  const snapshot = (kind, from, pos, c, note) => steps.push({ kind, v, from, pos, c, matches: [...matches], visits: [...visits], note });
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    while (v && nodes[v].next[c] === undefined) {
      const from = v; v = nodes[v].fail;
      snapshot('fail', from, i - 1, c, `문자 ${c}를 아직 소비하지 않는다. ${nodes[from].prefix} → ${nodes[v].prefix || 'root'}: failure link로 이동한다.`);
    }
    const from = v;
    v = nodes[v].next[c] ?? 0;
    visits[v]++;
    for (let u = v; u !== -1; u = nodes[u].out) {
      for (const id of nodes[u].terminal) matches.push({ id, pattern: patterns[id], start: i - patterns[id].length + 1, end: i });
    }
    snapshot('read', from, i, c, `T[${i}] = ${c} 소비. 상태는 ${nodes[v].prefix || 'root'}. terminal과 output link의 패턴을 보고한다.`);
  }
  return steps;
}

export function countAC(ac, visits) {
  const counts = [...visits];
  const steps = [{ v: 0, to: 0, counts: [...counts], note: '본문을 읽은 직후 각 상태에 도착한 횟수이다. 아직 failure ancestor에는 더하지 않았다.' }];
  for (const v of ac.bfs.slice(1).reverse()) {
    const to = ac.nodes[v].fail;
    counts[to] += counts[v];
    steps.push({ v, to, counts: [...counts], note: `${ac.nodes[v].prefix}의 ${counts[v]}회를 ${ac.nodes[to].prefix || 'root'}에 더한다. cnt[fail[v]] += cnt[v].` });
  }
  return steps;
}

export function suffixData(text) {
  if (!/^[a-z]+$/.test(text)) throw new Error('Nonempty lowercase string required');
  const n = text.length, ids = Array.from({ length: n }, (_, i) => i);
  const letters = [...new Set(text)].sort();
  let ranks = ids.map(i => letters.indexOf(text[i]));
  let sa = [...ids].sort((a, b) => ranks[a] - ranks[b] || a - b);
  const stages = [{ width: 1, k: 0, sa: [...sa], ranks: [...ranks], keys: ids.map(i => [ranks[i]]) }];
  for (let k = 1; k < n && new Set(ranks).size < n; k *= 2) {
    const keys = ids.map(i => [ranks[i], i + k < n ? ranks[i + k] : -1]);
    sa = [...ids].sort((a, b) => keys[a][0] - keys[b][0] || keys[a][1] - keys[b][1] || a - b);
    const next = Array(n).fill(0);
    for (let r = 1; r < n; r++) {
      const a = keys[sa[r - 1]], b = keys[sa[r]];
      next[sa[r]] = next[sa[r - 1]] + Number(a[0] !== b[0] || a[1] !== b[1]);
    }
    ranks = next;
    stages.push({ width: 2 * k, k, sa: [...sa], ranks: [...ranks], keys });
  }
  // Kasai: LCP[r] compares SA[r-1] and SA[r]; LCP[0] = 0.
  const rank = Array(n); sa.forEach((i, r) => { rank[i] = r; });
  const lcp = Array(n).fill(0), kasai = [];
  let h = 0;
  for (let i = 0; i < n; i++) {
    const r = rank[i];
    if (r === 0) {
      h = 0; kasai.push({ i, j: -1, r, seed: 0, h: 0, next: 0, lcp: [...lcp] }); continue;
    }
    const j = sa[r - 1], seed = h;
    while (i + h < n && j + h < n && text[i + h] === text[j + h]) h++;
    lcp[r] = h;
    kasai.push({ i, j, r, seed, h, next: Math.max(h - 1, 0), lcp: [...lcp] });
    h = Math.max(h - 1, 0);
  }
  return { text, n, stages, sa, rank, lcp, kasai };
}

export function queryLCP(data, i, j) {
  if (i === j) return { left: data.rank[i], right: data.rank[j], indices: [], value: data.n - i };
  const left = Math.min(data.rank[i], data.rank[j]), right = Math.max(data.rank[i], data.rank[j]);
  const indices = Array.from({ length: right - left }, (_, k) => left + 1 + k);
  return { left, right, indices, value: Math.min(...indices.map(k => data.lcp[k])) };
}
