import type { Category } from '@/types/category'

/** 기본 매출 카테고리 */
export const INCOME_CATEGORIES: Category[] = [
  { id: 'income-service', type: 'income', name: '용역매출', order: 1 },
  { id: 'income-goods', type: 'income', name: '상품매출', order: 2 },
  { id: 'income-other', type: 'income', name: '기타수입', order: 3 },
]

/** 기본 비용 카테고리 */
export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'expense-labor', type: 'expense', name: '인건비', order: 1 },
  { id: 'expense-rent', type: 'expense', name: '임차료', order: 2 },
  { id: 'expense-supplies', type: 'expense', name: '소모품비', order: 3 },
  { id: 'expense-entertainment', type: 'expense', name: '접대비', order: 4 },
  { id: 'expense-communication', type: 'expense', name: '통신비', order: 5 },
  { id: 'expense-transport', type: 'expense', name: '교통비', order: 6 },
  { id: 'expense-depreciation', type: 'expense', name: '감가상각비', order: 7 },
  { id: 'expense-other', type: 'expense', name: '기타비용', order: 8 },
]

/** 전체 카테고리 목록 */
export const ALL_CATEGORIES: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
]

/** ID로 카테고리 조회 */
export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id)
}

/** ID로 카테고리 이름 조회 */
export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? id
}
