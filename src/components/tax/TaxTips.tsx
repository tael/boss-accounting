import { BOOK_REFERENCES } from '@/constants/bookReferences'

const TAX_KEYS = ['tax.vat', 'tax.incomeTax', 'tax.taxSaving'] as const

export default function TaxTips() {
  const tips = TAX_KEYS.map((key) => ({ key, ref: BOOK_REFERENCES[key] }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">세금 & 절세 가이드</h2>
      <div className="space-y-3">
        {tips.map(({ key, ref }) => (
          <div key={key} className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                챕터 {ref.chapter}
              </span>
              <span className="text-sm font-medium text-gray-800">{ref.title}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{ref.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
