import { useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { getCategoryName } from '@/constants/categories'
import { formatKRW, formatDateKo } from '@/utils/format'
import type { Transaction } from '@/types/transaction'
import TransactionForm from './TransactionForm'

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { deleteTransaction } = useTransactionStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm">거래 내역이 없습니다.</p>
        <p className="text-xs mt-1">위의 "거래 추가" 버튼으로 첫 거래를 기록해보세요.</p>
      </div>
    )
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setConfirmDeleteId(null)
  }

  return (
    <div>
      {/* 데스크탑 테이블 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="pb-2 pr-4 font-medium">날짜</th>
              <th className="pb-2 pr-4 font-medium">유형</th>
              <th className="pb-2 pr-4 font-medium">카테고리</th>
              <th className="pb-2 pr-4 font-medium">메모</th>
              <th className="pb-2 pr-4 font-medium text-right">금액</th>
              <th className="pb-2 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                {editingId === tx.id ? (
                  <td colSpan={6} className="py-3 px-2">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <TransactionForm
                        initialData={{ ...tx }}
                        onSuccess={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700',
                        ].join(' ')}
                      >
                        {tx.type === 'income' ? '매출' : '비용'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {getCategoryName(tx.categoryId)}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 max-w-xs truncate">
                      {tx.memo ?? '-'}
                    </td>
                    <td
                      className={[
                        'py-3 pr-4 font-semibold text-right whitespace-nowrap',
                        tx.type === 'income' ? 'text-emerald-600' : 'text-red-600',
                      ].join(' ')}
                    >
                      {tx.type === 'expense' ? '-' : '+'}{formatKRW(tx.amountKRW)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(tx.id)}
                          className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          수정
                        </button>
                        {confirmDeleteId === tx.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(tx.id)}
                              className="px-2 py-1 text-xs rounded border border-red-400 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              확인
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="md:hidden space-y-3">
        {sorted.map((tx) => (
          <div
            key={tx.id}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            {editingId === tx.id ? (
              <div className="bg-blue-50 rounded-lg p-3">
                <TransactionForm
                  initialData={{ ...tx }}
                  onSuccess={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span
                      className={[
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2',
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700',
                      ].join(' ')}
                    >
                      {tx.type === 'income' ? '매출' : '비용'}
                    </span>
                    <span className="text-xs text-gray-500">{getCategoryName(tx.categoryId)}</span>
                  </div>
                  <span
                    className={[
                      'font-bold text-base',
                      tx.type === 'income' ? 'text-emerald-600' : 'text-red-600',
                    ].join(' ')}
                  >
                    {tx.type === 'expense' ? '-' : '+'}{formatKRW(tx.amountKRW)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{formatDateKo(tx.date)}</p>
                    {tx.memo && (
                      <p className="text-sm text-gray-600 mt-0.5 truncate max-w-[200px]">
                        {tx.memo}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(tx.id)}
                      className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      수정
                    </button>
                    {confirmDeleteId === tx.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="px-2 py-1 text-xs rounded border border-red-400 bg-red-50 text-red-600"
                        >
                          확인
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(tx.id)}
                        className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
