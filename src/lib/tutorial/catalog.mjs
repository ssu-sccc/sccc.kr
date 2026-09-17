export const categories = [
  { slug: 'math', title: '수학', english: 'Mathematics', description: '정수의 성질, 조합과 수학적 계산.' },
  { slug: 'graph', title: '그래프', english: 'Graph', description: '정점과 간선으로 표현하는 연결과 경로.' },
  { slug: 'dp', title: 'DP', english: 'Dynamic Programming', description: '상태와 전이에서 출발해 집합·경계·트리로 확장하는 여섯 강의. 번호 순서로 읽는다.' },
  { slug: 'data-structures', title: '자료구조', english: 'Data Structures', description: '데이터의 저장, 탐색과 효율적인 질의.' },
  { slug: 'string', title: '문자열', english: 'String', description: '문자열의 탐색, 정렬과 공통 부분.' },
  { slug: 'geometry', title: '기하학', english: 'Geometry', description: '점, 선과 도형의 위치 관계 및 계산.' },
  { slug: 'greedy', title: '그리디', english: 'Greedy', description: '선택의 기준과 최적해를 보장하는 증명.' },
];

// Keep existing article URLs when organizing their navigation.
export const tutorials = [
  { slug: 'dp-basics', category: 'dp', title: 'DP · 상태와 DAG', subtitle: '01 / STATE & DEPENDENCY', description: '계단, 최소 비용, 격자에서 상태와 간선을 찾고 계산 순서를 결정한다.', topics: '상태 · 전이 · 위상 순서 · Top-down', cover: ['state', '→', 'state'], coverLabel: '선행 상태에서 다음 상태로 향하는 의존 간선' },
  { slug: 'bit-dp', category: 'dp', title: 'Bit DP · TSP', subtitle: '02 / SUBSET AS A STATE', description: '방문 집합과 현재 위치를 함께 기억한다. 부분집합의 크기가 만드는 DAG를 따라간다.', topics: '집합 · Bitmask · TSP', cover: ['0101, 2', '→', '0111, 1'], coverLabel: '도시 1을 추가하는 TSP 상태 전이' },
  { slug: 'profile-dp', category: 'dp', title: 'Profile DP · 경계만 남기기', subtitle: '03 / THE MOVING FRONTIER', description: '격자의 과거와 미래를 가르는 절단선. 미래가 볼 수 있는 정보만 상태에 남긴다.', topics: 'Frontier · Broken profile · 비트 이동', cover: ['1011', '→', '011?'], coverLabel: '경계를 한 칸 옮기고 새 상태를 덧붙인다' },
  { slug: 'tree-dp', category: 'dp', title: 'Tree DP · 부분문제의 병합', subtitle: '04 / SUBTREE & MERGE', description: '독립 집합과 Tree Knapsack으로 배우는 자식 부분트리의 결합.', topics: 'Postorder · 선택 DP · Knapsack', cover: ['child', '→ merge ←', 'child'], coverLabel: '부모에서 자식 부분문제를 병합한다' },
  { slug: 'rerooting-dp', category: 'dp', title: 'Rerooting · 모든 방향의 답', subtitle: '05 / GATHER & DISTRIBUTE', description: '자식의 정보를 모으고 부모 방향 정보를 돌려준다. 방향별 메시지와 prefix/suffix 병합.', topics: 'Down · Up · 방향 메시지 · 제외 병합', cover: ['↑ gather', '↓ distribute'], coverLabel: '한 번 모으고 한 번 배분하는 두 방향 흐름' },
  { slug: 'dp-reconstruction', category: 'dp', title: 'DP · 선택과 역추적', subtitle: '06 / FROM VALUE TO SOLUTION', description: '최적값을 만든 선택을 기록하고, 마지막 상태에서 실제 해를 복원한다.', topics: 'Parent · Choice · 복원 · 통합 정리', cover: ['5', '← 3 ← 2 ←', '0'], coverLabel: '선택된 이전 상태를 거꾸로 따라간다' },
  {
    slug: 'aho-corasick', category: 'string', title: '아호-코라식',
    subtitle: 'MULTIPLE PATTERN MATCHING',
    description: '다중 패턴 매칭 알고리즘. Trie, failure link, output link와 failure tree의 구성 및 활용.',
    topics: 'Trie · Failure Link · Output · 등장 횟수',
    cover: ['she', 'fail → he'], coverLabel: 'she의 접미사 he도 함께 매칭',
  },
  {
    slug: 'suffix-array-lcp', category: 'string', title: 'Suffix Array · LCP',
    subtitle: 'SUFFIX ORDER & COMMON PREFIX',
    description: '접미사 배열과 공통 접두사 배열. Doubling, Kasai 알고리즘과 RMQ 질의의 원리 및 구현.',
    topics: 'SA · Rank · LCP · RMQ',
    cover: ['a', 'ana', 'anana'], coverLabel: 'banana의 접미사 정렬 예시',
  },
];
export const categoryUrl = (slug) => `/tutorial/category/${slug}/`;
export const tutorialUrl = (slug) => `/tutorial/${slug}/`;
export const tutorialsFor = (category) => tutorials.filter(item => item.category === category);
