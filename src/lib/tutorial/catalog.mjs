export const categories = [
  { slug: 'math', title: '수학', english: 'Mathematics', description: '정수의 성질, 조합과 수학적 계산.' },
  { slug: 'graph', title: '그래프', english: 'Graph', description: '정점과 간선으로 표현하는 연결과 경로.' },
  { slug: 'dp', title: 'DP', english: 'Dynamic Programming', description: '상태와 전이, 집합과 경계, 트리와 모든 방향. 세 강의로 배우는 동적 계획법.' },
  { slug: 'data-structures', title: '자료구조', english: 'Data Structures', description: '데이터의 저장, 탐색과 효율적인 질의.' },
  { slug: 'string', title: '문자열', english: 'String', description: '문자열의 탐색, 정렬과 공통 부분.' },
  { slug: 'geometry', title: '기하학', english: 'Geometry', description: '점, 선과 도형의 위치 관계 및 계산.' },
  { slug: 'greedy', title: '그리디', english: 'Greedy', description: '선택의 기준과 최적해를 보장하는 증명.' },
];

// Keep existing article URLs when organizing their navigation.
export const tutorials = [
  { slug: 'dp-basics', category: 'dp', title: 'DP 베이직', subtitle: '01 / FOUNDATIONS', description: '상태 DAG에서 실제 해의 복원까지. 작은 예제를 직접 계산하며 DP의 설계 순서를 익힌다.', topics: '상태 · 전이 · 계산 순서 · 역추적', cover: ['state', 'transition', 'solution'], coverLabel: '상태에서 전이를 거쳐 해의 복원까지' },
  { slug: 'bit-dp', category: 'dp', title: 'Bit DP', subtitle: '02 / SUBSETS & FRONTIERS', description: '집합을 담는 TSP, 경계만 남기는 Profile DP. 무엇을 기억하고 무엇을 잊을지 결정한다.', topics: '부분집합 · TSP · Profile DP', cover: ['0101', '0111', '1111'], coverLabel: '방문 집합과 경계 정보를 비트로 표현' },
  { slug: 'tree-dp', category: 'dp', title: 'Tree DP', subtitle: '03 / MERGE & REROOT', description: '자식 부분트리의 병합에서 모든 정점의 답까지. 선택 DP, Knapsack과 Rerooting을 연결한다.', topics: '부분트리 · Knapsack · Rerooting', cover: ['subtree', 'merge', 'all'], coverLabel: '부분트리를 병합하고 모든 방향의 답 계산' },
];
export const categoryUrl = (slug) => `/tutorial/category/${slug}/`;
export const tutorialUrl = (slug) => `/tutorial/${slug}/`;
export const tutorialsFor = (category) => tutorials.filter(item => item.category === category);
