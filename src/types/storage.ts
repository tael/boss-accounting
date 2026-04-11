/**
 * StorageAdapter 인터페이스
 * Zustand StateStorage와 호환되는 스토리지 추상화
 * 향후 IndexedDB / OPFS 로 교체 가능하도록 설계
 */
export interface StorageAdapter {
  /**
   * 키에 해당하는 값을 조회
   * @returns 저장된 문자열 값, 없으면 null
   */
  getItem(key: string): string | null | Promise<string | null>

  /**
   * 키-값 쌍을 저장
   */
  setItem(key: string, value: string): void | Promise<void>

  /**
   * 키에 해당하는 항목을 삭제
   */
  removeItem(key: string): void | Promise<void>
}
