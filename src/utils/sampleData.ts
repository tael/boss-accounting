import type { TransactionInput } from '@/types/transaction'

/** 오늘 기준 상대 날짜 (YYYY-MM-DD) */
function relativeDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/**
 * 소규모 서비스업 사장님 기준 약 3개월치 예시 거래 데이터.
 * 실제 사업 패턴(월정액 고정비 + 불규칙 변동비 + 월 1-2회 매출)을 반영.
 */
export function buildSampleTransactions(): TransactionInput[] {
  return [
    // ── 3개월 전 ──────────────────────────────────────────────
    { type: 'income',  date: relativeDate(88), amountKRW: 3200000, categoryId: 'income-service',       memo: '웹사이트 개발 프로젝트 착수금', isVatDeductible: true },
    { type: 'expense', date: relativeDate(87), amountKRW: 1800000, categoryId: 'expense-labor',        memo: '아르바이트 급여 (3월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(86), amountKRW: 550000,  categoryId: 'expense-rent',         memo: '사무실 임차료 (3월)', isVatDeductible: true },
    { type: 'expense', date: relativeDate(84), amountKRW: 87000,   categoryId: 'expense-communication', memo: '인터넷·전화 요금', isVatDeductible: true },
    { type: 'expense', date: relativeDate(82), amountKRW: 43000,   categoryId: 'expense-transport',    memo: '거래처 방문 교통비', isVatDeductible: true },
    { type: 'income',  date: relativeDate(79), amountKRW: 1500000, categoryId: 'income-goods',         memo: '사무용 소모품 재판매', isVatDeductible: true },
    { type: 'expense', date: relativeDate(78), amountKRW: 124000,  categoryId: 'expense-supplies',     memo: '프린터 잉크·A4 용지', isVatDeductible: true },
    { type: 'expense', date: relativeDate(76), amountKRW: 195000,  categoryId: 'expense-entertainment', memo: '거래처 식사 접대', isVatDeductible: true },
    { type: 'income',  date: relativeDate(73), amountKRW: 2800000, categoryId: 'income-service',       memo: '웹사이트 개발 2차 납품', isVatDeductible: true },
    { type: 'expense', date: relativeDate(72), amountKRW: 200000,  categoryId: 'expense-depreciation', memo: '노트북 감가상각 (월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(70), amountKRW: 56000,   categoryId: 'expense-other',        memo: '은행 수수료·기타', isVatDeductible: false },

    // ── 2개월 전 ──────────────────────────────────────────────
    { type: 'income',  date: relativeDate(58), amountKRW: 4500000, categoryId: 'income-service',       memo: '앱 UI 디자인 계약금', isVatDeductible: true },
    { type: 'expense', date: relativeDate(57), amountKRW: 1800000, categoryId: 'expense-labor',        memo: '아르바이트 급여 (4월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(56), amountKRW: 550000,  categoryId: 'expense-rent',         memo: '사무실 임차료 (4월)', isVatDeductible: true },
    { type: 'expense', date: relativeDate(55), amountKRW: 87000,   categoryId: 'expense-communication', memo: '인터넷·전화 요금', isVatDeductible: true },
    { type: 'expense', date: relativeDate(53), amountKRW: 320000,  categoryId: 'expense-supplies',     memo: '헤드셋·마우스 구입', isVatDeductible: true },
    { type: 'income',  date: relativeDate(51), amountKRW: 800000,  categoryId: 'income-other',         memo: '강의 출연료', isVatDeductible: false },
    { type: 'expense', date: relativeDate(49), amountKRW: 67000,   categoryId: 'expense-transport',    memo: '세미나 참석 교통비', isVatDeductible: true },
    { type: 'expense', date: relativeDate(47), amountKRW: 280000,  categoryId: 'expense-entertainment', memo: '클라이언트 미팅 식사', isVatDeductible: true },
    { type: 'income',  date: relativeDate(44), amountKRW: 3000000, categoryId: 'income-service',       memo: '앱 UI 디자인 잔금', isVatDeductible: true },
    { type: 'expense', date: relativeDate(43), amountKRW: 200000,  categoryId: 'expense-depreciation', memo: '노트북 감가상각 (월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(41), amountKRW: 98000,   categoryId: 'expense-other',        memo: '클라우드 구독·소프트웨어', isVatDeductible: true },

    // ── 1개월 전 ──────────────────────────────────────────────
    { type: 'income',  date: relativeDate(28), amountKRW: 5200000, categoryId: 'income-service',       memo: '쇼핑몰 운영대행 월정액', isVatDeductible: true },
    { type: 'expense', date: relativeDate(27), amountKRW: 1800000, categoryId: 'expense-labor',        memo: '아르바이트 급여 (5월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(26), amountKRW: 550000,  categoryId: 'expense-rent',         memo: '사무실 임차료 (5월)', isVatDeductible: true },
    { type: 'expense', date: relativeDate(25), amountKRW: 87000,   categoryId: 'expense-communication', memo: '인터넷·전화 요금', isVatDeductible: true },
    { type: 'income',  date: relativeDate(23), amountKRW: 650000,  categoryId: 'income-goods',         memo: '재고 소모품 처분', isVatDeductible: true },
    { type: 'expense', date: relativeDate(21), amountKRW: 155000,  categoryId: 'expense-supplies',     memo: '명함·홍보물 인쇄', isVatDeductible: true },
    { type: 'expense', date: relativeDate(19), amountKRW: 420000,  categoryId: 'expense-entertainment', memo: '신규 거래처 환영 식사', isVatDeductible: true },
    { type: 'expense', date: relativeDate(17), amountKRW: 82000,   categoryId: 'expense-transport',    memo: '현장 방문 택시비', isVatDeductible: true },
    { type: 'income',  date: relativeDate(14), amountKRW: 1200000, categoryId: 'income-service',       memo: '컨설팅 자문료', isVatDeductible: true },
    { type: 'expense', date: relativeDate(13), amountKRW: 200000,  categoryId: 'expense-depreciation', memo: '노트북 감가상각 (월)', isVatDeductible: false },
    { type: 'expense', date: relativeDate(11), amountKRW: 74000,   categoryId: 'expense-other',        memo: '우편·택배 비용', isVatDeductible: true },
    { type: 'income',  date: relativeDate(7),  amountKRW: 3800000, categoryId: 'income-service',       memo: '랜딩페이지 제작 완료', isVatDeductible: true },
    { type: 'expense', date: relativeDate(5),  amountKRW: 215000,  categoryId: 'expense-supplies',     memo: '외장하드 구입', isVatDeductible: true },
    { type: 'expense', date: relativeDate(3),  amountKRW: 110000,  categoryId: 'expense-other',        memo: '세무 자문료', isVatDeductible: false },
    { type: 'income',  date: relativeDate(1),  amountKRW: 900000,  categoryId: 'income-other',         memo: '공동작업 수수료 수입', isVatDeductible: false },
  ]
}
