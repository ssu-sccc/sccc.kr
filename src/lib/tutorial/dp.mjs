// Pure algorithms and deterministic teaching traces, shared by SSR, controls and tests.
export const COST_EDGES = [[0,1,3],[0,2,1],[1,2,1],[1,3,4],[2,3,1],[2,4,2],[3,4,3],[3,5,1],[4,5,3]];
export const TSP_COST = [[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]];
export const TREE = [[1,2,3],[0,4,5],[0],[0,6],[1],[1],[3]];
export const WEIGHTS = [4,3,5,2,2,4,6];
export const popcount = x => { let n=0; for(;x;x&=x-1)n++; return n; };
export const bits = (x,n) => x.toString(2).padStart(n,'0');
export function stairs(n) { const d=Array(n+1).fill(0); d[0]=1; for(let i=1;i<=n;i++)d[i]=d[i-1]+(i>1?d[i-2]:0); return d; }
export function dagCosts(n, edges) {
  const dp=Array(n).fill(Infinity),parent=Array(n).fill(-1);dp[0]=0;
  const incoming=Array.from({length:n},()=>[]);
  for(const [u,v,c] of edges)incoming[v].push([u,c]);
  for(let v=1;v<n;v++)for(const [u,c] of incoming[v])if(dp[u]+c<dp[v]){dp[v]=dp[u]+c;parent[v]=u;}
  return {dp,parent};
}
export function gridPaths(n,m) { const a=Array.from({length:n},()=>Array(m).fill(0));a[0][0]=1; for(let r=0;r<n;r++)for(let c=0;c<m;c++){if(r)a[r][c]+=a[r-1][c];if(c)a[r][c]+=a[r][c-1];}return a; }
export function tsp(cost) {
  const n=cost.length,dp=Array.from({length:1<<n},()=>Array(n).fill(Infinity));dp[1][0]=0;
  for(let mask=1;mask<1<<n;mask++)for(let v=0;v<n;v++)if(Number.isFinite(dp[mask][v]))for(let u=0;u<n;u++)if(!(mask>>u&1))dp[mask|1<<u][u]=Math.min(dp[mask|1<<u][u],dp[mask][v]+cost[v][u]);
  return {dp,answer:n===1?0:Math.min(...dp.at(-1).slice(1).map((x,i)=>x+cost[i+1][0]))};
}
export function profileCount(n,m) {
  let dp=Array(1<<m).fill(0);dp[0]=1;const snapshots=[dp.slice()];
  for(let pos=0;pos<n*m;pos++) { const next=dp.map(()=>0),col=pos%m;
    for(let mask=0;mask<dp.length;mask++)if(dp[mask]) {
      const shifted=(mask<<1)&(dp.length-1);next[shifted]+=dp[mask];
      if(!(mask>>(m-1)&1)&&(!col||!(mask&1)))next[shifted|1]+=dp[mask];
    }dp=next;snapshots.push(dp.slice());
  }return {snapshots,answer:dp.reduce((a,b)=>a+b,0)};
}
export function treeIndependent(g, weights) {
  const dp=weights.map(()=>[0,0]),order=[],parent=weights.map(()=>-1);
  function dfs(v,p) { parent[v]=p;dp[v]=[0,weights[v]];for(const c of g[v])if(c!==p){dfs(c,v);dp[v][0]+=Math.max(...dp[c]);dp[v][1]+=dp[c][0];}order.push(v); }
  dfs(0,-1);return {dp,order,parent,answer:Math.max(...dp[0])};
}
export function treeKnapsack(g,weights,K) {
  function dfs(v,p) { let a=Array.from({length:2},()=>Array(K+1).fill(-Infinity));a[0][0]=0;if(K)a[1][1]=weights[v];
    for(const c of g[v])if(c!==p){const b=dfs(c,v),next=a.map(row=>row.map(()=>-Infinity));for(let s=0;s<2;s++)for(let x=0;x<=K;x++)for(let y=0;x+y<=K;y++)next[s][x+y]=Math.max(next[s][x+y],a[s][x]+(s?b[0][y]:Math.max(b[0][y],b[1][y])));a=next;}return a;
  }const dp=dfs(0,-1);return {dp,answer:Math.max(dp[0][K],dp[1][K])};
}
export const mergeMessage = (a,b) => [a[0]+b[0],a[1]+b[1]];
export const liftMessage = a => [a[0],a[1]+a[0]];
export function reroot(g) {
  const n=g.length,down=Array(n),up=Array.from({length:n},()=>[0,0]),all=Array(n),parent=Array(n).fill(-1),post=[],pre=[],messages=[];
  function gather(v,p){parent[v]=p;down[v]=[1,0];for(const c of g[v])if(c!==p){gather(c,v);const msg=liftMessage(down[c]);down[v]=mergeMessage(down[v],msg);messages.push({from:c,to:v,value:msg});}post.push(v);}
  gather(0,-1);
  function distribute(v) {
    pre.push(v);const incoming=g[v].map(c=>c===parent[v]?up[v]:liftMessage(down[c]));
    const pref=[[0,0]],suff=Array(incoming.length+1);suff[incoming.length]=[0,0];
    for(let i=0;i<incoming.length;i++)pref.push(mergeMessage(pref[i],incoming[i]));
    for(let i=incoming.length-1;i>=0;i--)suff[i]=mergeMessage(incoming[i],suff[i+1]);
    all[v]=mergeMessage([1,0],pref.at(-1));
    g[v].forEach((c,i)=>{if(c!==parent[v]){const before=mergeMessage([1,0],mergeMessage(pref[i],suff[i+1]));up[c]=liftMessage(before);messages.push({from:v,to:c,value:up[c],excluded:c,prefix:pref[i],suffix:suff[i+1],before});distribute(c);}});
  }distribute(0);return {down,up,all,parent,post,pre,messages};
}
export function restore(parent,target) { const path=[];for(let v=target;v!==-1;v=parent[v]){if(path.length>parent.length)throw Error('Cyclic parent');path.push(v);}return path.reverse(); }
const esc = x => String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const chip=(s,active=false)=>`<span class="dp-chip${active?' active':''}">${esc(s)}</span>`;
const panel=(title,body)=>`<div class="dp-panel"><strong>${esc(title)}</strong>${body}</div>`;
const bitrow=(mask,n)=>`<div class="dp-bits">${Array.from({length:n},(_,i)=>n-1-i).map(i=>`<span class="dp-bit${mask>>i&1?' active':''}"><small>bit ${i}</small>${mask>>i&1}</span>`).join('')}</div>`;
const chips=a=>`<div class="dp-chips">${a.join('')}</div>`;
const edgeKey=(u,v)=>`${u}-${v}`;
function graph(id,nodes,edges,{current=-1,done=[],active=[],trace=[],height=260}={}) {
  const arrow=`dp-arrow-${id}`;
  return `<div class="dp-svg-scroll" tabindex="0" role="region" aria-label="상태 그래프 · 작은 화면에서 가로 스크롤"><svg class="dp-svg" viewBox="0 0 680 ${height}" role="img" aria-label="간선은 값이 필요한 선행 상태에서 다음 상태로 향한다"><defs><marker id="${arrow}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse" overflow="visible"><path d="M 2 1.8 L 8 5 L 2 8.2" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>${edges.map(([u,v,w])=>{const a=nodes[u],b=nodes[v],key=edgeKey(u,v),dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy),sx=a.x+dx/l*36,sy=a.y+dy/l*30,ex=b.x-dx/l*39,ey=b.y-dy/l*32;const bend=Math.abs(dx)>160&&Math.abs(dy)<30?-65:0;return `<path class="dp-edge ${active.includes(key)?'active':''} ${trace.includes(key)?'trace':''}" d="M ${sx} ${sy} Q ${(sx+ex)/2} ${(sy+ey)/2+bend} ${ex} ${ey}" marker-end="url(#${arrow})"/>${w!==undefined?`<text x="${(sx+ex)/2}" y="${(sy+ey)/2+bend/2-12}" class="dp-small">${esc(w)}</text>`:''}`;}).join('')}${nodes.map((n,i)=>`<g class="dp-vertex ${done.includes(i)?'done':''} ${current===i?'current':''}"><rect x="${n.x-34}" y="${n.y-28}" width="68" height="56"/><text x="${n.x}" y="${n.y-4}">${esc(n.label??i)}</text><text class="dp-small" x="${n.x}" y="${n.y+17}">${esc(n.value??'')}</text><text class="dp-small" x="${n.x}" y="${n.y+49}">${current===i?'현재':done.includes(i)?'완료':'미계산'}</text></g>`).join('')}</svg></div><p class="dp-caption">굵은 테두리: 현재 상태 · 옅은 면과 ‘완료’: 계산됨 · 굵은 화살표: 이번 전이. 작은 화면에서는 그림 안을 좌우로 스크롤한다.</p>`;
}
const lineNodes = values => values.map((x,i)=>({x:60+i*110,y:140,label:i,value:x}));
const treeNodes = values => [[340,55],[160,175],[340,175],[520,175],[75,295],[230,295],[520,295]].map(([x,y],i)=>({x,y,label:i,value:values[i]}));
const treeEdges = TREE.flatMap((a,v)=>a.filter(c=>c>v).map(c=>[v,c]));

export const experimentOptions = {
  basics:[['stairs','계단 · Bottom-up'],['topdown','계단 · Top-down'],['cost','최소 비용 · Bottom-up']],
  grid:[['grid','3 × 4 격자 경로']], tsp:[['tsp','4개 도시 · 상태별 보기']],
  profile:[['checker','선택/비선택이 교차하는 한 경로'],['empty','아무 칸도 선택하지 않는 경로']],
  tree:[['tree','최대 가중 독립 집합']], merge:[['merge','A × B의 모든 조합']],
  reroot:[['reroot','거리 합 · 두 방향 메시지']], reconstruction:[['reconstruction','최소 비용과 실제 경로']],
};
export function experimentFrames(kind,option=experimentOptions[kind][0][0]) {
  if(kind==='basics') {
    const isCost=option==='cost',d=isCost?dagCosts(6,COST_EDGES).dp:stairs(5),e=isCost?COST_EDGES:Array.from({length:5},(_,i)=>[[i,i+1],...(i<4?[[i,i+2]]:[])]).flat();
    const events=[];
    if(option==='topdown'){const seen=new Set();function visit(v,stack=[]){events.push({v,done:[...seen],stack:[...stack,v],type:'request'});if(seen.has(v)){events.push({v,done:[...seen],stack,type:'cache'});return;}if(v>0)visit(v-1,[...stack,v]);if(v>1)visit(v-2,[...stack,v]);seen.add(v);events.push({v,done:[...seen],stack,type:'finish'});}visit(5);}
    else for(let v=0;v<6;v++)events.push({v,done:Array.from({length:v+1},(_,i)=>i),type:'finish',stack:[]});
    return events.map(ev=>{
      const incoming=e.filter(x=>x[1]===ev.v),known=ev.done.includes(ev.v);
      let status;
      if(ev.type==='request') status=`dp[${ev.v}] 요청. ${known?'이미 계산된 상태이므로 다시 전개하지 않는다.':'요청과 값 확정은 다르다. 필요한 선행 상태부터 요청한다.'} 의존 간선의 방향은 여전히 이전 상태 → 현재 상태이다.`;
      else if(ev.type==='cache') status=`dp[${ev.v}] = ${d[ev.v]}를 캐시에서 반환한다. 재귀 호출은 다시 펼치지 않는다.`;
      else if(ev.v===0) status=isCost?'dp[0] = 0: 아무 간선도 지나지 않은 출발점의 비용은 0이다.':'dp[0] = 1: 아무 이동도 하지 않는 빈 경로 하나를 센다.';
      else status=`dp[${ev.v}] = ${isCost?'min('+incoming.map(([u,,w])=>`${d[u]} + ${w}`).join(', ')+')':incoming.map(([u])=>d[u]).join(' + ')} = ${d[ev.v]}. ${option==='topdown'?'필요한 값이 반환된 뒤에야 현재 값이 확정된다.':'모든 선행 상태가 이미 계산되었다.'}`;
      return {state:ev,status,html:graph(`basic-${option}`,lineNodes(d.map((x,i)=>ev.done.includes(i)?x:'?')),e,{current:ev.v,done:ev.done,active:incoming.map(x=>edgeKey(...x))})+panel(option==='topdown'?'호출 스택 · 목표에서 필요한 값으로 내려간다':'들어오는 간선 · 작은 인덱스부터 계산',option==='topdown'?esc(ev.stack.length?ev.stack.join(' → '):'반환 완료'):chips(incoming.map(([u,v,w])=>chip(`${u} → ${v}${w!==undefined?` · 비용 ${w}`:''}`))))};
    });
  }
  if(kind==='grid') {const d=gridPaths(3,4),nodes=d.flatMap((row,r)=>row.map((x,c)=>({x:100+c*155,y:55+r*120,label:`${r},${c}`,value:x}))),edges=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++){const v=r*4+c;if(r)edges.push([v-4,v]);if(c)edges.push([v-1,v]);}
    return nodes.map((_,v)=>({html:graph('grid',nodes.map((x,i)=>({...x,value:i<=v?x.value:'?'})),edges,{current:v,done:Array.from({length:v+1},(_,i)=>i),active:edges.filter(e=>e[1]===v).map(e=>edgeKey(...e)),height:370}),status:v===0?'(0,0)은 빈 경로 하나로 초기화한다.':`(${Math.floor(v/4)},${v%4})로 들어오는 길은 위/왼쪽에서 오는 경우뿐. ${edges.filter(e=>e[1]===v).map(([u])=>nodes[u].value).join(' + ')} = ${nodes[v].value}. 서로 다른 마지막 이동이므로 중복 없이 더한다.`}));
  }
  if(kind==='tsp') {const result=tsp(TSP_COST),states=[];for(let k=1;k<=4;k++)for(let mask=1;mask<16;mask++)if(popcount(mask)===k)for(let v=0;v<4;v++)if(Number.isFinite(result.dp[mask][v]))states.push({mask,v});
    return states.map(({mask,v})=>{const next=Array.from({length:4},(_,i)=>i).filter(i=>!(mask>>i&1));return {state:{mask,v},label:`${bits(mask,4)}, ${v}`,html:bitrow(mask,4)+panel(`현재 상태 (${bits(mask,4)}, ${v}) · 최소 비용 ${result.dp[mask][v]}`,`방문 집합 {${[0,1,2,3].filter(i=>mask>>i&1).join(', ')}} · 끝점 ${v}`)+Array.from({length:4},(_,i)=>`<div class="dp-layer"><span>|S| = ${i+1}${i<3?' ↓':''}</span>${chips(states.filter(s=>popcount(s.mask)===i+1).map(s=>chip(`${bits(s.mask,4)},${s.v}`,s.mask===mask&&s.v===v)))}</div>`).join('')+panel('이 상태에서 나가는 간선',next.length?chips(next.map(u=>chip(`${bits(mask,4)},${v} → ${bits(mask|1<<u,4)},${u} · +${TSP_COST[v][u]}`))):`전부 방문했다. 끝점 ${v} → 시작 0의 비용 ${TSP_COST[v][0]}을 마지막에 더한다.`),status:next.length?`다음 후보: ${next.join(', ')}. 새 도시 하나를 추가하므로 popcount가 ${popcount(mask)}에서 ${popcount(mask)+1}로 증가한다. 표시된 값은 해당 상태까지의 최소 비용이며, 한 이전 상태의 후보 비용과 항상 같지는 않다.`:`이 끝점의 순회 비용은 ${result.dp[mask][v]} + ${TSP_COST[v][0]} = ${result.dp[mask][v]+TSP_COST[v][0]}. 모든 끝점 중 최솟값은 ${result.answer}.`};});
  }
  if(kind==='profile') {const {snapshots,answer}=profileCount(3,4),chosen=Array.from({length:12},(_,i)=>option==='checker'?Number((Math.floor(i/4)+i%4)%2===0):0);let mask=0;return Array.from({length:13},(_,pos)=>{const old=mask,bit=chosen[pos],shift=(old<<1)&15;let html='<div class="dp-grid">';for(let i=0;i<12;i++){const frontier=i<pos&&i>=pos-4;html+=`<div class="dp-cell ${i<pos?'past':''} ${frontier?'frontier':''} ${i===pos?'current':''}">${Math.floor(i/4)},${i%4}<br/>${i<pos?(chosen[i]?'■ 1':'□ 0'):'·'}<small>${i===pos?'현재 X':frontier?`경계 bit ${pos-1-i}`:i<pos?'잊어도 됨':'미처리'}</small></div>`;}html+='</div>'+bitrow(old,4)+panel(`처리 전 mask = ${bits(old,4)} · ${pos}/12칸 완료`,pos<12?`위 = bit 3 (${old>>3&1}), 왼쪽 = ${pos%4===0?'없음 · 행의 첫 칸':`bit 0 (${old&1})`}<br/>${bits(old,4)} → ${bits(shift,4).slice(0,3)}? → ${bits(shift|bit,4)} · 새 선택 ${bit}`:'모든 칸 처리 완료. 남은 경계가 어느 모양이든 유효한 배치이다.')+panel('한 경로와 전체 DP를 구분한다',`위 그림은 유효한 배치 한 가지를 따라간다. 전체 DP는 이 시점에 ${snapshots[pos].filter(x=>x>0).length}개 mask를 유지하며, 그 상태들의 경우의 수 합은 ${snapshots[pos].reduce((a,b)=>a+b,0)}이다.`);if(pos<12)mask=shift|bit;return {state:{pos,mask:old,next:pos<12?mask:null},html,status:pos===12?`3 × 4 격자의 독립 집합은 총 ${answer}가지. 빈 집합도 포함한다.`:`다음 칸의 과거 이웃은 위와 왼쪽뿐이다. 굵은 경계의 가장 오래된 칸은 현재 칸을 처리한 뒤 미래와 더 이상 맞닿지 않는다. 현재 칸의 선택을 끝에 추가한다.`};});}
  if(kind==='tree') {const r=treeIndependent(TREE,WEIGHTS);return r.order.map((v,i)=>({state:{v},html:graph('tree',treeNodes(r.dp.map((x,u)=>r.order.indexOf(u)<=i?x.join('/'):'?')),treeEdges.map(([p,c])=>[c,p]),{current:v,done:r.order.slice(0,i+1),active:TREE[v].filter(c=>c!==r.parent[v]).map(c=>edgeKey(c,v)),height:375})+panel(`정점 ${v} · 가중치 ${WEIGHTS[v]}`,`표시: 미선택 / 선택 = ${r.dp[v].join(' / ')}. ${TREE[v].filter(c=>c!==r.parent[v]).length?'자식 답을 합쳐 이 부분트리의 답을 완성한다.':'리프: 아무것도 고르지 않으면 0, 자신을 고르면 자신의 가중치.'}`),status:`후위 순서: ${r.order.join(' → ')}. 부모가 선택되면 자식은 미선택이어야 한다. 부모가 미선택이면 자식별로 더 좋은 상태를 고른다. 전체 최댓값 ${r.answer}.`}));}
  if(kind==='merge') {const A=[0,2,5],B=[0,1,4];return A.flatMap((a,i)=>B.map((b,j)=>({html:`<table class="dp-matrix"><caption>A의 원소 + B의 원소</caption><thead><tr><th>A ＼ B</th>${B.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${A.map((x,r)=>`<tr><th>${x}</th>${B.map((y,c)=>`<td class="${r===i&&c===j?'active':''}">${x+y}${r===i&&c===j?' ←':''}</td>`).join('')}</tr>`).join('')}</tbody></table>`+panel('새 상태 집합 C',chips([...new Set(A.flatMap(x=>B.map(y=>x+y)))].sort((x,y)=>x-y).map(x=>chip(x,x===a+b)))),status:`현재 조합: ${a} + ${b} = ${a+b}. 두 자식 묶음의 가능한 수량을 결합한다. 같은 합에 여러 조합이 도착할 수 있다. 가능 여부는 OR, 최대 가치 문제는 max로 합친다.`})));}
  if(kind==='reroot') {
    const r=reroot(TREE);
    return r.messages.map((msg,i)=>{
      const gather=i<TREE.length-1,computed=r.messages.slice(0,i+1),active=edgeKey(msg.from,msg.to);
      const done=gather?[...new Set(computed.map(m=>m.from))]:[0,...computed.slice(TREE.length-1).map(m=>m.to)];
      if(i===TREE.length-2)done.push(0);
      const values=TREE.map((_,v)=>done.includes(v)?gather?r.down[v].join(','):String(r.all[v][1]):'?');
      const neighbors=TREE[msg.from],excluded=neighbors.indexOf(msg.to);
      const prefix=neighbors.slice(0,excluded),suffix=neighbors.slice(excluded+1);
      const exclusion=panel(`받는 정점 ${msg.to} 방향을 제외`,
        chips([chip(`prefix: ${prefix.length?prefix.join(', '):'없음'}`),chip(`${msg.to} 제외`,true),chip(`suffix: ${suffix.length?suffix.join(', '):'없음'}`)])+
        (!gather?`prefix = (${msg.prefix.join(', ')}) · suffix = (${msg.suffix.join(', ')})<br/>self (1, 0)를 더하면 (${msg.before.join(', ')}). 간선을 건너면서 각 거리에 1을 더한다.`:''));
      return {state:msg,html:graph('reroot',treeNodes(values),gather?treeEdges.map(([p,c])=>[c,p]):treeEdges,{current:msg.to,done,active:[active],height:375})+
        panel(`${gather?'1차 · Gather ↑':'2차 · Distribute ↓'} : ${msg.from} → ${msg.to}`,`전달 메시지 (개수, 받는 정점까지 거리 합) = (${msg.value.join(', ')})`)+
        (gather?panel('노드 안의 값: 완성된 down의 (개수, 거리 합)','자신을 기준으로 구한 down을 간선 하나 건너 부모 기준으로 바꿔 보낸다. 아직 모든 자식이 모이지 않은 노드는 ?로 남는다.'):panel('노드 안의 값: 완성된 전체 거리 합','부모 방향 메시지를 받은 노드는 이미 준비된 자식 메시지와 합쳐 전체 답을 알 수 있다.')+exclusion)+
        (i===r.messages.length-1?panel('모든 정점의 전체 거리 합',chips(r.all.map((x,v)=>chip(`${v}: ${x[1]}`)))):''),
        status:gather?'화살표 반대편 성분의 정보를 받는 쪽의 거리 기준으로 전달한다. 재귀가 돌아오는 순서로 메시지가 준비된다.':'받는 쪽의 성분을 빼놓고 합쳐야 자기 정보가 되돌아가지 않는다. prefix/suffix는 역연산 없이 제외 병합을 수행한다. 두 DFS 전체에서 각 방향 간선을 한 번씩 전달한다.'};
    });
  }
  if(kind==='reconstruction') {const r=dagCosts(6,COST_EDGES),path=restore(r.parent,5),back=[...path].reverse(),selected=r.parent.flatMap((p,v)=>p<0?[]:[edgeKey(p,v)]);return Array.from({length:6+back.length},(_,step)=>{const tracing=step>=6,v=tracing?back[step-6]:step,visited=tracing?back.slice(0,step-5):[],traced=visited.slice(0,-1).map((x,i)=>edgeKey(visited[i+1],x));return {state:{step,v},html:graph('reconstruct',lineNodes(r.dp.map((d,i)=>tracing||i<=step?d:'?')),COST_EDGES,{current:v,done:tracing?[0,1,2,3,4,5]:Array.from({length:step+1},(_,i)=>i),active:tracing?selected:selected.filter(e=>Number(e.split('-')[1])<=step),trace:traced})+panel('값과 선택을 따로 기록한다',chips(r.dp.map((d,i)=>chip(`${i}: dp=${tracing||i<=step?d:'?'} / parent=${tracing||i<=step?r.parent[i]:'?'}`,i===v))))+panel(tracing?'뒤로 따라가는 parent':'최적값을 만든 간선',tracing?`${visited.join(' → ')}${step===9?`<br/>뒤집은 실제 경로: ${path.join(' → ')} · 비용 ${r.dp[5]}`:''}`:`정점 ${v}의 최적값은 ${r.dp[v]}. ${v?`parent[${v}] = ${r.parent[v]}를 함께 기록한다.`:'출발점의 parent는 −1.'}`),status:tracing?'초록색 굵은 선은 복원한 간선이다. 화살표는 원래 전이 방향을 유지하고, parent는 그 방향을 거슬러 읽는다.':'파란색 굵은 간선은 지금까지 선택한 최적 이전 상태를 나타낸다. 후보가 더 작을 때 값과 parent를 동시에 갱신한다.'};});}
  throw new Error(`Unknown DP experiment ${kind}`);
}
