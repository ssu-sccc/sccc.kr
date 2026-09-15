# sccc.kr

숭실대학교 컴퓨터학부 문제해결 소모임 SCCC의 공식 웹사이트입니다.

## 기술 구성

- Astro 정적 사이트
- 기존 Markdown·HTML 콘텐츠와 YAML 기록 보존
- GitHub Pages 자동 배포

## 로컬 실행

```bash
pnpm install
pnpm dev
```

프로덕션 결과물은 `pnpm build` 실행 후 `dist`에 생성됩니다.

## Spotboard 실행기

`/contest/spotboard/`에서 DOMjudge URL로 공개 대회를 조회하고 Spotboard 실행 링크를 생성합니다.
브라우저가 CLICS API를 직접 읽으므로 별도 연동 서버가 필요하지 않습니다.
DOMjudge의 공개 API 및 CORS 허용 설정이 필요합니다.
자세한 사용법은 [Spotboard 안내](docs/spotboard.md)를 참고하세요.
