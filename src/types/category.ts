/**
 * 카테고리 타입 정의
 */

export type CategoryType = 'income' | 'expense'

/**
 * 손익분기점 계산을 위한 비용 성격 구분
 */
export type CostType = 'fixed' | 'variable' | 'semi'

export interface Category {
  /** 고유 식별자 */
  id: string
  /** 카테고리 유형 */
  type: CategoryType
  /** 카테고리 이름 */
  name: string
  /** 표시 순서 */
  order: number
  /** 아이콘 이름 (선택) */
  icon?: string
  /** 비용 성격 (비용 카테고리 전용) */
  costType?: CostType
}
