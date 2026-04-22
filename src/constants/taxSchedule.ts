/**
 * 세금 신고 일정 정적 데이터
 * 부가세 및 종합소득세 신고 기간
 */

export type TaxType = '부가세' | '종합소득세' | '원천세'

export interface TaxScheduleItem {
  /** 고유 ID */
  id: string
  /** 세금 종류 */
  taxType: TaxType
  /** 신고 제목 */
  title: string
  /** 신고 대상 기간 */
  targetPeriod: string
  /** 신고 시작일 (MM-DD) */
  periodStart: string
  /** 신고 마감일 (MM-DD) */
  periodEnd: string
  /** 설명 */
  description: string
}

/** 연간 세금 신고 일정 (2025년 기준) */
export const TAX_SCHEDULE: TaxScheduleItem[] = [
  // 부가가치세
  {
    id: 'vat-2024-2h',
    taxType: '부가세',
    title: '부가가치세 확정신고 (2024년 2기)',
    targetPeriod: '2024.07.01 ~ 2024.12.31',
    periodStart: '01-01',
    periodEnd: '01-25',
    description: '일반과세자 2기 확정신고. 간이과세자는 연 1회 신고(1월)',
  },
  {
    id: 'vat-2025-1h-preliminary',
    taxType: '부가세',
    title: '부가가치세 예정신고 (2025년 1기)',
    targetPeriod: '2025.01.01 ~ 2025.03.31',
    periodStart: '04-01',
    periodEnd: '04-25',
    description: '일반과세자 1기 예정신고 (법인은 의무, 개인은 예정고지로 대체 가능)',
  },
  {
    id: 'vat-2025-1h',
    taxType: '부가세',
    title: '부가가치세 확정신고 (2025년 1기)',
    targetPeriod: '2025.01.01 ~ 2025.06.30',
    periodStart: '07-01',
    periodEnd: '07-25',
    description: '일반과세자 1기 확정신고',
  },
  {
    id: 'vat-2025-2h-preliminary',
    taxType: '부가세',
    title: '부가가치세 예정신고 (2025년 2기)',
    targetPeriod: '2025.07.01 ~ 2025.09.30',
    periodStart: '10-01',
    periodEnd: '10-25',
    description: '일반과세자 2기 예정신고 (개인은 예정고지로 대체 가능)',
  },
  {
    id: 'vat-2025-2h',
    taxType: '부가세',
    title: '부가가치세 확정신고 (2025년 2기)',
    targetPeriod: '2025.07.01 ~ 2025.12.31',
    periodStart: '01-01',
    periodEnd: '01-25',
    description: '일반과세자 2기 확정신고 (2026년 1월)',
  },

  // 종합소득세
  {
    id: 'income-tax-2024',
    taxType: '종합소득세',
    title: '종합소득세 확정신고 (2024년 귀속)',
    targetPeriod: '2024년 귀속',
    periodStart: '05-01',
    periodEnd: '05-31',
    description: '전년도 소득에 대한 종합소득세 신고 및 납부',
  },
  {
    id: 'income-tax-2025',
    taxType: '종합소득세',
    title: '종합소득세 확정신고 (2025년 귀속)',
    targetPeriod: '2025년 귀속',
    periodStart: '05-01',
    periodEnd: '05-31',
    description: '전년도 소득에 대한 종합소득세 신고 및 납부 (2026년 5월)',
  },

  // 원천세
  {
    id: 'withholding-tax-monthly',
    taxType: '원천세',
    title: '원천세 납부 (매월)',
    targetPeriod: '매월',
    periodStart: '10-01',
    periodEnd: '10-10',
    description: '전월 지급한 급여/프리랜서 용역비에 대한 원천세 신고 및 납부 (매월 10일)',
  },
]

/**
 * 특정 월의 신고 일정 조회
 * @param month MM 형식 (예: "01", "05")
 */
export function getScheduleByMonth(month: string): TaxScheduleItem[] {
  return TAX_SCHEDULE.filter((item) => item.periodEnd.startsWith(month))
}

/**
 * 세무 일정 D-Day 계산 (오늘 기준)
 * periodEnd 형식: "MM-DD" → 올해 날짜 기준
 */
export function getDDaySchedules(): Array<TaxScheduleItem & { dday: number }> {
  const today = new Date()
  const year = today.getFullYear()

  return TAX_SCHEDULE.map((item) => {
    const [mm, dd] = item.periodEnd.split('-').map(Number)
    let due = new Date(year, mm! - 1, dd!)
    if (due < today) due = new Date(year + 1, mm! - 1, dd!)
    const dday = Math.ceil((due.getTime() - today.setHours(0, 0, 0, 0)) / 86_400_000)
    return { ...item, dday }
  })
    .sort((a, b) => a.dday - b.dday)
    .slice(0, 3)
}

/**
 * 다가오는 신고 일정 조회 (현재 월 및 다음 달 기준)
 */
export function getUpcomingSchedule(): typeof TAX_SCHEDULE {
  const now = new Date()
  const currentMM = String(now.getMonth() + 1).padStart(2, '0')
  const nextMM = String(((now.getMonth() + 1) % 12) + 1).padStart(2, '0')
  const seen = new Set<string>()
  return TAX_SCHEDULE.filter(
    (item) => item.periodEnd.startsWith(currentMM) || item.periodEnd.startsWith(nextMM),
  ).filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

