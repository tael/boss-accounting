/**
 * 책 챕터 매핑 데이터
 * "사장님이 알면 돈버는 회계" 책의 각 챕터와 앱 기능을 연결
 *
 * 실제 책 내용은 추후 사용자가 채울 것 (현재는 placeholder)
 */

export interface BookReference {
  /** 챕터 번호 */
  chapter: number
  /** 챕터 제목 */
  title: string
  /** 핵심 내용 요약 */
  summary: string
  /** 관련 페이지 (선택) */
  page?: number
}

export type BookReferenceKey =
  | 'dashboard.profitMargin'
  | 'dashboard.revenue'
  | 'dashboard.expenses'
  | 'dashboard.netProfit'
  | 'dashboard.taxSchedule'
  | 'statements.incomeStatement'
  | 'statements.cashFlow'
  | 'statements.balanceSheet'
  | 'analysis.breakEven'
  | 'analysis.expenseStructure'
  | 'analysis.trend'
  | 'tax.vat'
  | 'tax.incomeTax'
  | 'tax.taxSaving'
  | 'transactions.expenseDeduction'
  | 'transactions.categories'
  | 'transactions.fixedVariable'

/** 앱 기능 → 책 챕터 매핑 */
export const BOOK_REFERENCES: Record<BookReferenceKey, BookReference> = {
  'dashboard.profitMargin': {
    chapter: 4,
    title: '이익률로 경영 상태 파악하기',
    summary: '이익률은 매출 대비 순이익의 비율로, 사업의 수익성을 한눈에 보여줍니다. 업종별 평균 이익률과 비교하여 경영 상태를 진단할 수 있습니다.',
  },
  'dashboard.revenue': {
    chapter: 2,
    title: '매출이란 무엇인가',
    summary: '매출은 사업 활동으로 벌어들인 총 수입입니다. 용역매출, 상품매출 등으로 구분하여 관리합니다.',
  },
  'dashboard.expenses': {
    chapter: 3,
    title: '비용의 종류와 관리',
    summary: '사업에 들어가는 모든 지출을 카테고리별로 분류하여 관리합니다. 고정비와 변동비를 구분하는 것이 중요합니다.',
  },
  'dashboard.netProfit': {
    chapter: 4,
    title: '순이익 = 매출 - 비용',
    summary: '순이익은 매출에서 모든 비용을 차감한 금액입니다. 사업주의 실질 소득과 연결됩니다.',
  },
  'dashboard.taxSchedule': {
    chapter: 8,
    title: '세금 신고 캘린더',
    summary: '부가세는 1년에 2회(1월, 7월) 확정신고, 종합소득세는 5월에 신고합니다. 신고 기한을 놓치면 가산세가 발생합니다.',
  },
  'statements.incomeStatement': {
    chapter: 5,
    title: '손익계산서 읽는 법',
    summary: '손익계산서는 일정 기간의 수익과 비용을 보여주는 재무제표입니다. 매출 → 매출원가 → 매출총이익 → 판관비 → 영업이익 순으로 구성됩니다.',
  },
  'statements.cashFlow': {
    chapter: 6,
    title: '현금흐름이 중요한 이유',
    summary: '장부상 이익이 있어도 현금이 없으면 사업이 어려워집니다. 현금흐름을 별도로 관리해야 합니다.',
  },
  'statements.balanceSheet': {
    chapter: 7,
    title: '재무상태표 기초',
    summary: '재무상태표는 특정 시점의 자산, 부채, 자본을 보여줍니다. 자산 = 부채 + 자본 공식이 기본입니다.',
  },
  'analysis.breakEven': {
    chapter: 7,
    title: '손익분기점 계산하기',
    summary: '손익분기점(BEP)은 매출이 비용과 같아지는 지점입니다. BEP = 고정비 ÷ (1 - 변동비율). BEP 이상 매출이 되어야 이익이 발생합니다.',
  },
  'analysis.expenseStructure': {
    chapter: 3,
    title: '비용 구조 분석',
    summary: '카테고리별 비용 비중을 파악하면 절감 가능한 항목을 발견할 수 있습니다. 인건비, 임차료 등 고정비 비중이 높을수록 사업 리스크가 커집니다.',
  },
  'analysis.trend': {
    chapter: 4,
    title: '월별 트렌드로 성장 확인',
    summary: '매월 매출과 비용 추이를 보면 계절성과 성장 여부를 파악할 수 있습니다.',
  },
  'tax.vat': {
    chapter: 9,
    title: '부가가치세 기본 개념',
    summary: '부가세 = 매출세액 - 매입세액. 매출의 10%가 매출세액이고, 사업 관련 구입비용의 10%가 매입세액으로 공제됩니다. 세금계산서 수취가 중요합니다.',
  },
  'tax.incomeTax': {
    chapter: 10,
    title: '종합소득세 계산 구조',
    summary: '종합소득세 = 과세표준 × 세율 - 누진공제. 과세표준이 높을수록 높은 세율이 적용됩니다. 각종 공제 항목을 활용하여 과세표준을 줄이는 것이 절세의 핵심입니다.',
  },
  'tax.taxSaving': {
    chapter: 11,
    title: '합법적 절세 전략',
    summary: '사업 관련 비용을 적극적으로 경비 처리하고, 연금보험료 공제, 노란우산공제 등을 활용하면 세금을 합법적으로 줄일 수 있습니다.',
  },
  'transactions.expenseDeduction': {
    chapter: 3,
    title: '필요경비로 인정받는 비용',
    summary: '사업과 직접 관련된 지출은 필요경비로 처리할 수 있습니다. 증빙(세금계산서, 카드 영수증)을 반드시 보관해야 합니다.',
  },
  'transactions.categories': {
    chapter: 2,
    title: '매출과 비용의 분류',
    summary: '매출과 비용을 카테고리별로 정확히 분류하면 재무제표 자동 생성이 가능합니다. 국세청 간편장부 항목 기준으로 분류하면 신고가 편리합니다.',
  },
  'transactions.fixedVariable': {
    chapter: 3,
    title: '고정비 vs 변동비',
    summary: '고정비(임차료, 인건비 등)는 매출과 관계없이 발생하고, 변동비(재료비, 수수료 등)는 매출에 따라 달라집니다. 이 구분이 손익분기점 계산의 기초입니다.',
  },
}

/** 특정 기능의 책 참조 정보 조회 */
export function getBookReference(key: BookReferenceKey): BookReference | undefined {
  return BOOK_REFERENCES[key]
}
