# 사장님 회계 도우미 (Boss Accounting Helper)

> "사장님이 알면 돈버는 회계" 책 기반 소규모 사업자용 회계 관리 웹 서비스

React 19 + TypeScript + Vite + Zustand + Tailwind CSS 4로 구현된 로컬 전용 회계 대시보드입니다. 모든 데이터는 브라우저 localStorage에만 저장되며 서버로 전송되지 않습니다.

## 주요 기능

- **거래 기록**: 매출/비용 CRUD, 카테고리 분류, 검색/필터
- **재무제표**: 월별/분기별/연간 손익계산서, 현금흐름 차트
- **분석 도구**: 손익분기점 계산기, 비용 구조 파이차트, 월별 추이
- **세금 시뮬레이터**: 부가세, 2025년 종합소득세 누진세율 계산 (면책 고지 포함)
- **데이터 관리**: JSON export/import로 백업/복원
- **책 챕터 참조**: 각 기능마다 관련 책 개념 툴팁 표시

## 기술 스택

- React 19 + TypeScript
- Vite 6 (빌드)
- Zustand 5 (상태 관리, persist middleware + migrate)
- Tailwind CSS 4 (CSS-first 설정)
- react-router 7 (HashRouter)
- Recharts (차트)
- Vitest + Testing Library (테스트)

## 실행

```bash
npm install
npm run dev       # 개발 서버
npm test          # 단위 테스트
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 주의사항

- **재무 데이터는 로컬에만 저장됩니다.** 브라우저 데이터를 지우면 사라지므로 정기적으로 JSON export로 백업하세요.
- **세금 계산은 2025년 세율 기준 참고용입니다.** 실제 신고 시 세무사 상담을 권장합니다.
- 모든 금액은 정수 원(KRW) 단위로 처리됩니다.
