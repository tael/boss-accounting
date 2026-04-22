export interface TaxSavingItem {
  id: string
  title: string
  description: string
  estimatedSavingKRW?: number
}

export const TAX_SAVING_ITEMS: TaxSavingItem[] = [
  {
    id: 'yellow-umbrella',
    title: '노란우산공제 가입',
    description: '연간 최대 500만원 소득공제. 폐업·사망·노령 시 공제금 지급',
    estimatedSavingKRW: 750000,
  },
  {
    id: 'business-card',
    title: '사업용 신용카드 등록',
    description: '국세청 홈택스에 사업용 카드 등록 시 매입세액 공제 자동 집계',
  },
  {
    id: 'family-labor',
    title: '가족 종사자 인건비 처리',
    description: '배우자·직계가족 실제 근무 시 인건비로 필요경비 처리 가능',
  },
  {
    id: 'depreciation',
    title: '사업용 자산 감가상각 반영',
    description: '컴퓨터·기계 등 사업용 자산 감가상각비를 비용으로 처리',
  },
  {
    id: 'home-office',
    title: '재택근무 사무실 비용 계상',
    description: '자택에서 업무 시 임차료 일부를 사업 경비로 처리',
  },
  {
    id: 'national-pension',
    title: '국민연금 사업자 납부 확인',
    description: '사업자 국민연금 납부액은 전액 소득공제 대상',
  },
]
