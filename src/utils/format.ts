/**
 * 포매팅 유틸리티
 * 금액 및 날짜 표시 함수
 */

/**
 * 원화 금액을 천단위 구분 문자열로 변환
 * @example formatKRW(1234567) → "₩1,234,567"
 */
export function formatKRW(amountKRW: number): string {
  return `₩${Math.round(amountKRW).toLocaleString('ko-KR')}`
}

/**
 * 원화 금액을 기호 없이 천단위 구분 문자열로 변환
 * @example formatKRWNoSymbol(1234567) → "1,234,567"
 */
export function formatKRWNoSymbol(amountKRW: number): string {
  return Math.round(amountKRW).toLocaleString('ko-KR')
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @example formatDate(new Date('2025-01-15')) → "2025-01-15"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜를 한국어 형식으로 변환
 * @example formatDateKo('2025-01-15') → "2025년 1월 15일"
 */
export function formatDateKo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 월을 한국어 형식으로 변환
 * @example formatMonthKo('2025-01') → "2025년 1월"
 */
export function formatMonthKo(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${year}년 ${parseInt(month, 10)}월`
}

/**
 * 원화 문자열을 정수 원 단위로 파싱
 * 쉼표, 공백, ₩ 기호 제거 후 정수로 변환
 * @example parseKRW("₩1,234,567") → 1234567
 * @example parseKRW("1,234,567") → 1234567
 * @returns 정수 원 단위. 파싱 실패 시 NaN 반환
 */
export function parseKRW(value: string): number {
  const cleaned = value.replace(/[₩,\s]/g, '')
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) return NaN
  return Math.round(parsed)
}

/**
 * 변화율을 퍼센트 문자열로 변환 (부호 포함)
 * @example formatChangeRate(12.5) → "+12.5%"
 * @example formatChangeRate(-5.3) → "-5.3%"
 */
export function formatChangeRate(rate: number): string {
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${rate.toFixed(1)}%`
}

/**
 * 이익률을 퍼센트 문자열로 변환
 * @example formatMargin(23.456) → "23.5%"
 */
export function formatMargin(marginPct: number): string {
  return `${marginPct.toFixed(1)}%`
}

/**
 * 로컬 시간 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * toISOString()은 UTC 기준이므로 사용 금지
 */
export function getTodayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
