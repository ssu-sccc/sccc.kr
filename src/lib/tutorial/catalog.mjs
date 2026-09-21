export const categories = [
  { slug: 'math', title: '수학', english: 'Mathematics', description: '정수의 성질, 조합과 수학적 계산.' },
  { slug: 'graph', title: '그래프', english: 'Graph', description: '정점과 간선으로 표현하는 연결과 경로.' },
  { slug: 'dp', title: 'DP', english: 'Dynamic Programming', description: '상태와 전이로 나누어 푸는 동적 계획법.' },
  { slug: 'data-structures', title: '자료구조', english: 'Data Structures', description: '데이터의 저장, 탐색과 효율적인 질의.' },
  { slug: 'string', title: '문자열', english: 'String', description: '문자열의 탐색, 정렬과 공통 부분.' },
  { slug: 'geometry', title: '기하학', english: 'Geometry', description: '점, 선과 도형의 위치 관계 및 계산.' },
  { slug: 'greedy', title: '그리디', english: 'Greedy', description: '선택의 기준과 최적해를 보장하는 증명.' },
];

// Categories remain available while no articles are published.
export const tutorials = [];
export const categoryUrl = (slug) => `/tutorial/category/${slug}/`;
export const tutorialUrl = (slug) => `/tutorial/${slug}/`;
export const tutorialsFor = (category) => tutorials.filter(item => item.category === category);
