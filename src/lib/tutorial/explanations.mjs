// These models describe snapshots, not extra automaton transitions.
export function acScanExplanation(ac, text, snapshot) {
  const consumed = snapshot.pos + 1;
  const processed = text.slice(0, consumed);
  const candidates = ac.nodes.map((n, v) => ({ v, prefix: n.prefix }))
    .filter(n => processed.endsWith(n.prefix))
    .sort((a,b) => b.prefix.length-a.prefix.length);
  return {
    consumed, processed, remaining: text.slice(consumed),
    pending: consumed < text.length ? text[consumed] : null,
    candidates, stable: candidates[0].v,
    active: snapshot.v,
    isFailure: snapshot.kind === 'fail',
    newMatches: snapshot.kind === 'read' ? snapshot.matches.filter(m=>m.end===snapshot.pos) : [],
  };
}

export function suffixBlockExplanation(data, step, i) {
  const stage=data.stages[step], k=stage.k;
  return {
    first:data.text.slice(i,i+(k||1)),
    second:k ? data.text.slice(i+k,i+2*k) : '',
    keys:stage.keys[i], rank:stage.ranks[i], width:stage.width,
    tied:stage.sa.filter(j=>stage.ranks[j]===stage.ranks[i]),
    complete:new Set(stage.ranks).size===data.n,
  };
}
