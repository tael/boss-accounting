/**
 * 국세청 기준 업무용 고정자산 내용연수 프리셋
 * 소득세법 시행규칙 별표 등을 참고한 대표적 내용연수
 * (정확한 세법 적용 시 업종별 기준 내용연수표 확인 필요)
 */

export interface AssetTypePreset {
  /** 자산 구분 이름 */
  name: string
  /** 내용연수 (년) */
  years: number
}

export const ASSET_TYPE_PRESETS: AssetTypePreset[] = [
  { name: '컴퓨터·서버', years: 5 },
  { name: '차량·운반구', years: 5 },
  { name: '비품·가구', years: 5 },
  { name: '기계·장치', years: 10 },
  { name: '인테리어·시설개선', years: 5 },
  { name: '소프트웨어', years: 5 },
]
