# 2026 숭고한 결과 원본

출처: https://drive.google.com/drive/folders/19ihgHOWDQs2-AEPe8zaADrvyrRY2mGjY

각 division의 `award/data/{contest,meta,runs}.json`을 그대로 보관한다.
2026-09-27 수집. JSON 들여쓰기만 정규화했다.
`mode = award`, `live_frozen = false`, `noMoreUpdate = true`인 최종 결과다.
Div.1 / Div.2는 300분, Div.3는 240분이다.

공식 Spotboard v0.6.0이 직접 데이터를 읽고 순위를 계산한다.
`submissionTime`은 분, `duration_seconds`는 초다.
`public/contest/2026-skh/data/`의 화면용 복사본에서 `#violet`, `#purple`의 불필요한 `#`만 제거해 원본 풍선 파일 이름과 맞춘다.
순위, 팀 이름, 제출 기록은 변경하지 않는다.
배포본 정보와 적용 범위는 `third-party/spotboard/README.md` 참고.
빌드 후 `node scripts/test-spotboard.mjs`로 복사본 일치와 원본 무결성을 검증한다.
