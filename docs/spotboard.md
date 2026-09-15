# 정적 Spotboard 실행기

대회 → **Spotboard 실행** (`/contest/spotboard/`)에서 사용합니다.

1. DOMjudge URL 또는 CLICS API 기본 주소 입력
2. 브라우저에서 공개 `contests` 조회
3. 대회 선택 → 실행 URL 생성·복사·새 탭 열기

실행 URL 예시:

```text
https://sccc.kr/contest/spotboard/view/?api=https%3A%2F%2Fjudge.example%2Fapi%2Fv4%2F&contest=1
```

주소에는 공개 API 기본 주소와 대회 ID만 포함됩니다. 입력 주소를 수정하면 이전 대회와 생성 링크를 초기화합니다. 계정, 비밀번호, 토큰, 서버 세션, 저장소, 시상 입력 기능은 사용하지 않습니다.

## 구조

```text
SCCC 정적 실행기 ── GET /contests ──→ DOMjudge CLICS API
       │
       └─ Spotboard launch URL 생성
                      │
                      ▼
             정적 Spotboard 실행 페이지
                      │
                      └─ 공개 CLICS API 직접 조회 → Spotboard 표시
```

Spotboard 원본 0.7은 `contest.json` / `runs.json` 형식을 사용하므로,
실행 페이지의 JavaScript가 공개 스코어보드 셀을 Spotboard 표시 형식으로 변환합니다.
프록시나 백엔드 변환 서버는 없습니다. 실행기 화면 자체에서는 점수 조회를 하지 않습니다.

실행 페이지는 대회별 `contests/{id}`, `problems`, `teams`, `scoreboard`를 익명 GET으로 읽습니다.
`credentials: omit`으로 쿠키와 인증을 보내지 않으며, 제출·채점·jury API는 호출하지 않습니다.
10초마다 공개 점수와 프리즈 상태를 갱신하고 재채점을 반영하도록 모델을 다시 만듭니다.
실시간 첫 정답·제출 타임라인은 공개 스코어보드만으로 정확히 복원할 수 없어 사용하지 않습니다.

## DOMjudge 요구 사항

- 대회와 점수가 인증 없이 공개 조회 가능해야 합니다.
- API 응답에서 SCCC의 실제 출처를 CORS로 허용해야 합니다. 예: `Access-Control-Allow-Origin: https://sccc.kr`.
- 공개 데이터 전용 API라면 `Access-Control-Allow-Origin: *`도 가능합니다. 이 실행기는 인증 쿠키를 요청하지 않습니다.
- HTTPS 사이트에서는 DOMjudge API도 HTTPS여야 합니다.
- CORS 차단을 우회하지 않습니다. 차단 시 운영자가 DOMjudge 웹 서버의 공개 API CORS 설정을 수정해야 합니다.
- 공개 ICPC 방식 CLICS 스코어보드가 필요합니다. DOMjudge `/api/v4/` 또는 명시한 `/api/` 주소를 사용합니다.

## 실행·배포

```sh
pnpm install
pnpm dev
# 또는
pnpm build
pnpm preview
```

`dist/` 전체를 기존 GitHub Pages 또는 정적 호스팅에 배포하면 됩니다.
별도 Node 연동 서버, 환경 변수, 비밀 키는 필요하지 않습니다.

```sh
pnpm test:spotboard
pnpm build
pnpm verify
```

테스트는 주소 정규화, 실행 링크 인코딩, 익명 요청, 대회 목록, CORS·인증 오류,
프리즈·해제·재채점을 확인합니다.

## 출처

- [Spotboard 원본](https://github.com/spotboard/spotboard), MIT, 0.7.0
- [CLICS Contest API](https://ccs-specs.icpc.io/2023-06/contest_api)
- 원본 자산과 수정 내역: `public/spotboard/NOTICE.md`
