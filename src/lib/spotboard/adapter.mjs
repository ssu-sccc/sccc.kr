// DOMjudge Contest API v4 -> Spotboard 0.7. Never use jury runs in live mode.
export class BoardError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function seconds(value) {
  if (typeof value === 'number') return value;
  const match = /^(-?)(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value || '');
  return match ? (match[1] ? -1 : 1) * (+match[2] * 3600 + +match[3] * 60 + +match[4]) : NaN;
}
export function phase(contest, state, now = Date.now()) {
  const passed = value => value != null && Number.isFinite(Date.parse(value)) && Date.parse(value) <= now;
  const ended = passed(state.ended) || passed(contest.end_time);
  const thawed = passed(state.thawed);
  const frozen = !thawed && passed(state.frozen);
  return { ended, frozen, thawed, label: ended ? (frozen ? '종료 · 프리즈 유지' : '종료 · 공개 결과') : frozen ? '진행 중 · 프리즈' : passed(state.started) ? '진행 중' : '시작 전' };
}
export function metadata(contest, problems, teams, board) {
  if (contest.scoreboard_type && contest.scoreboard_type !== 'pass-fail') throw new BoardError('Spotboard는 ICPC 방식 대회를 지원합니다.');
  if (!Array.isArray(board.rows) || !board.state) throw new BoardError('공개 스코어보드 형식을 확인할 수 없습니다.', 502);
  const visible = new Set(board.rows.map(r => String(r.team_id)));
  const selectedTeams = teams.filter(t => visible.has(String(t.id)));
  if (selectedTeams.length !== visible.size) throw new BoardError('팀 목록과 스코어보드가 일치하지 않습니다. 다시 시도해 주세요.', 502);
  const palette = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'skyblue'];
  const balloons = new Set(['red','blue','yellow','purple','orange','pink','skyblue','white','brown','darkgreen','gold','gray','ivory','lime','deeppink','lightblue','turquoise','violet','darkorange']);
  return {
    title: String(contest.name || contest.formal_name || contest.id), systemName: 'DOMjudge · SCCC', systemVersion: 'Contest API v4',
    penalty: Number.isFinite(Number(contest.penalty_time)) ? Number(contest.penalty_time) : 20,
    problems: [...problems].sort((a,b) => (a.ordinal ?? 0) - (b.ordinal ?? 0)).map((p,i) => ({ id:i, externalId:String(p.id), name:String(p.label || String.fromCharCode(65+i)), title:String(p.name || p.label), color: balloons.has(p.color) ? p.color : palette[i % palette.length] === 'green' ? 'darkgreen' : palette[i % palette.length] })),
    teams: selectedTeams.map((t,i) => ({ id:i+1, externalId:String(t.id), name:String(t.display_name || t.name), group:String(t.organization_name || t.affiliation || '') }))
  };
}
export function liveSnapshot(contest, problems, teams, board, now = Date.now()) {
  const meta = metadata(contest, problems, teams, board);
  const rows = new Map(board.rows.map(r => [String(r.team_id), r]));
  const runs = [];
  for (const team of meta.teams) {
    const row = rows.get(team.externalId);
    team.rank = row.rank;
    team.solved = row.score.num_solved;
    team.penalty = row.score.total_time;
    for (const problem of meta.problems) {
      const cell = row.problems.find(p => String(p.problem_id) === problem.externalId);
      if (!cell) continue;
      const judged = Math.max(0, Number(cell.num_judged) || 0);
      const pending = Math.max(0, Number(cell.num_pending) || 0);
      if (judged + pending > 10000) throw new BoardError('제출 수가 지원 범위를 초과합니다.', 502);
      for (let i=0; i<judged; i++) runs.push({ id:runs.length+1, team:team.id, problem:problem.id, submissionTime:cell.solved ? cell.time : 0, result:cell.solved && i === judged-1 ? 'Yes' : 'No' });
      // Empty result is the upstream's pending marker (not a failed submission).
      if (!cell.solved) for (let i=0; i<pending; i++) runs.push({ id:runs.length+1, team:team.id, problem:problem.id, submissionTime:0, result:'' });
    }
  }
  const status = phase(contest, board.state, now);
  const elapsed = Math.max(0, (now - Date.parse(board.state.started || contest.start_time)) / 1000) || 0;
  return { contest:meta, feed:{ runs, time:{ contestTime:Math.min(elapsed, seconds(contest.duration) || elapsed), noMoreUpdate:false, timestamp:now } }, status, fetchedAt:new Date(now).toISOString() };
}
