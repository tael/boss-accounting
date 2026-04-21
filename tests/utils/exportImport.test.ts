/**
 * exportImport.ts 유틸리티 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  validateTransactions,
  serializeToJSON,
  parseFromJSONString,
  importFromJSON,
  EXPORT_VERSION,
} from '@/utils/exportImport'
import type { Transaction } from '@/types/transaction'

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-001',
  type: 'income',
  date: '2025-01-15',
  amountKRW: 1_000_000,
  categoryId: 'income-service',
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  ...overrides,
})

// ────────────────────────────────────────────────
// validateTransactions
// ────────────────────────────────────────────────
describe('validateTransactions', () => {
  it('유효한 거래 목록을 그대로 반환한다', () => {
    const txs = [
      makeTransaction({ id: '1' }),
      makeTransaction({ id: '2', type: 'expense' }),
    ]
    const result = validateTransactions(txs)
    expect(result).toHaveLength(2)
  })

  it('id 필드가 없는 항목을 제거한다', () => {
    const invalid = { type: 'income', date: '2025-01-01', amountKRW: 1000, categoryId: 'c1', createdAt: '', updatedAt: '' }
    const result = validateTransactions([invalid])
    expect(result).toHaveLength(0)
  })

  it('type이 income/expense가 아닌 항목을 제거한다', () => {
    const invalid = makeTransaction({ type: 'other' as never })
    const result = validateTransactions([invalid])
    expect(result).toHaveLength(0)
  })

  it('amountKRW가 문자열인 항목을 제거한다', () => {
    const invalid = { ...makeTransaction(), amountKRW: '1000' }
    const result = validateTransactions([invalid as unknown as Transaction])
    expect(result).toHaveLength(0)
  })

  it('amountKRW가 소수인 항목을 제거한다 (정수만 허용)', () => {
    const invalid = makeTransaction({ amountKRW: 1000.5 })
    const result = validateTransactions([invalid])
    expect(result).toHaveLength(0)
  })

  it('amountKRW가 음수인 항목을 제거한다', () => {
    const invalid = makeTransaction({ amountKRW: -1000 })
    const result = validateTransactions([invalid])
    expect(result).toHaveLength(0)
  })

  it('amountKRW가 0인 항목을 제거한다', () => {
    const invalid = makeTransaction({ amountKRW: 0 })
    const result = validateTransactions([invalid])
    expect(result).toHaveLength(0)
  })

  it('categoryId 필드가 없는 항목을 제거한다', () => {
    const { categoryId: _, ...rest } = makeTransaction()
    const result = validateTransactions([rest as unknown as Transaction])
    expect(result).toHaveLength(0)
  })

  it('date 필드가 없는 항목을 제거한다', () => {
    const { date: _, ...rest } = makeTransaction()
    const result = validateTransactions([rest as unknown as Transaction])
    expect(result).toHaveLength(0)
  })

  it('null 항목을 제거한다', () => {
    const result = validateTransactions([null])
    expect(result).toHaveLength(0)
  })

  it('비객체 항목을 제거한다', () => {
    const result = validateTransactions([42, 'string', true])
    expect(result).toHaveLength(0)
  })

  it('빈 배열이면 빈 결과를 반환한다', () => {
    expect(validateTransactions([])).toEqual([])
  })

  it('혼합 배열에서 유효한 항목만 반환한다', () => {
    const valid = makeTransaction({ id: 'valid-1' })
    const invalid = { type: 'unknown', date: '2025-01-01' }
    const result = validateTransactions([valid, invalid])
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('valid-1')
  })
})

// ────────────────────────────────────────────────
// serializeToJSON + parseFromJSONString 왕복 테스트
// ────────────────────────────────────────────────
describe('serializeToJSON + parseFromJSONString 왕복', () => {
  it('직렬화 후 역직렬화하면 동일한 거래 목록이 복원된다', () => {
    const txs = [
      makeTransaction({ id: '1', amountKRW: 5_000_000 }),
      makeTransaction({ id: '2', type: 'expense', amountKRW: 200_000 }),
    ]

    const json = serializeToJSON(txs)
    const result = parseFromJSONString(json)

    expect(result.success).toBe(true)
    expect(result.transactions).toHaveLength(2)
    expect(result.transactionCount).toBe(2)

    const first = result.transactions![0]!
    expect(first.id).toBe('1')
    expect(first.amountKRW).toBe(5_000_000)

    const second = result.transactions![1]!
    expect(second.type).toBe('expense')
    expect(second.amountKRW).toBe(200_000)
  })

  it('settings도 함께 직렬화/역직렬화된다', () => {
    const txs = [makeTransaction()]
    const settings = { theme: 'dark', currency: 'KRW' }

    const json = serializeToJSON(txs, settings)
    const result = parseFromJSONString(json)

    expect(result.success).toBe(true)
    expect(result.settings).toEqual(settings)
  })

  it('직렬화 결과에 version과 appId가 포함된다', () => {
    const json = serializeToJSON([makeTransaction()])
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe(EXPORT_VERSION)
    expect(parsed.appId).toBe('boss-accounting')
    expect(typeof parsed.exportedAt).toBe('string')
  })

  it('빈 거래 목록도 왕복이 가능하다', () => {
    const json = serializeToJSON([])
    const result = parseFromJSONString(json)

    expect(result.success).toBe(true)
    expect(result.transactions).toEqual([])
    expect(result.transactionCount).toBe(0)
  })
})

// ────────────────────────────────────────────────
// parseFromJSONString 오류 케이스
// ────────────────────────────────────────────────
describe('parseFromJSONString', () => {
  it('잘못된 JSON 문자열이면 실패를 반환한다', () => {
    const result = parseFromJSONString('{invalid json}')
    expect(result.success).toBe(false)
    expect(result.error).toContain('JSON 파싱 오류')
  })

  it('올바른 형식이 아닌 JSON이면 실패를 반환한다', () => {
    const result = parseFromJSONString(JSON.stringify({ foo: 'bar' }))
    expect(result.success).toBe(false)
    expect(result.error).toBe('올바른 형식의 백업 파일이 아닙니다.')
  })

  it('다른 앱의 백업 파일이면 실패를 반환한다', () => {
    const otherApp = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appId: 'other-app',
      transactions: [],
    }
    const result = parseFromJSONString(JSON.stringify(otherApp))
    expect(result.success).toBe(false)
    expect(result.error).toBe('다른 앱의 백업 파일입니다.')
  })

  it('지원하지 않는 버전이면 실패를 반환한다', () => {
    const futureVersion = {
      version: EXPORT_VERSION + 1,
      exportedAt: new Date().toISOString(),
      appId: 'boss-accounting',
      transactions: [],
    }
    const result = parseFromJSONString(JSON.stringify(futureVersion))
    expect(result.success).toBe(false)
    expect(result.error).toContain('지원하지 않는 백업 버전')
  })
})

// ────────────────────────────────────────────────
// importFromJSON (File mock)
// jsdom 환경에서 File.text()가 미지원이므로 text() 메서드를 직접 구현한 mock 사용
// ────────────────────────────────────────────────

function makeFileMock(content: string, name = 'test.json'): File {
  const file = new File([content], name, { type: 'application/json' })
  // jsdom File에 text() polyfill 주입
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(content),
  })
  return file
}

describe('importFromJSON', () => {
  it('유효한 JSON 파일을 올바르게 가져온다', async () => {
    const txs = [makeTransaction({ id: 'file-tx-1', amountKRW: 3_000_000 })]
    const json = serializeToJSON(txs)
    const file = makeFileMock(json, 'backup.json')

    const result = await importFromJSON(file)

    expect(result.success).toBe(true)
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions![0]!.id).toBe('file-tx-1')
    expect(result.transactionCount).toBe(1)
  })

  it('잘못된 JSON 파일이면 실패를 반환한다', async () => {
    const file = makeFileMock('{bad json}', 'corrupt.json')

    const result = await importFromJSON(file)

    expect(result.success).toBe(false)
    expect(result.error).toContain('JSON 파싱 오류')
  })

  it('올바른 JSON이지만 백업 형식이 아니면 실패를 반환한다', async () => {
    const file = makeFileMock(JSON.stringify({ random: 'data' }), 'wrong.json')

    const result = await importFromJSON(file)

    expect(result.success).toBe(false)
    expect(result.error).toBe('올바른 형식의 백업 파일이 아닙니다.')
  })

  it('빈 거래 목록을 가진 파일도 성공으로 처리한다', async () => {
    const json = serializeToJSON([])
    const file = makeFileMock(json, 'empty.json')

    const result = await importFromJSON(file)

    expect(result.success).toBe(true)
    expect(result.transactions).toEqual([])
    expect(result.transactionCount).toBe(0)
  })
})
