/**
 * 카테고리 타입 정의
 */

export type CategoryType = 'income' | 'expense'

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
}
