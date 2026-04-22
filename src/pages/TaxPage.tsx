import TaxDisclaimer from '@/components/tax/TaxDisclaimer'
import VatCalculator from '@/components/tax/VatCalculator'
import IncomeTaxCalc from '@/components/tax/IncomeTaxCalc'
import LaborCalc from '@/components/tax/LaborCalc'
import TaxTips from '@/components/tax/TaxTips'
import TaxSavingChecklist from '@/components/tax/TaxSavingChecklist'
import { BOOK_REFERENCES } from '@/constants/bookReferences'
import { useSettingsStore } from '@/stores/settingsStore'

export default function TaxPage() {
  const vatRef = BOOK_REFERENCES['tax.vat']
  const incomeTaxRef = BOOK_REFERENCES['tax.incomeTax']
  const taxType = useSettingsStore((s) => s.taxType)

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">세금</h1>

      {taxType === 'simplified' && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          간이과세자는 부가세를 연 1회 신고합니다 (1월 1일에서 25일)
        </div>
      )}

      <TaxDisclaimer />

      <div className="space-y-1">
        <VatCalculator />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {vatRef.chapter} — {vatRef.title}
        </p>
      </div>

      <div className="space-y-1">
        <IncomeTaxCalc />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {incomeTaxRef.chapter} — {incomeTaxRef.title}
        </p>
      </div>

      <LaborCalc />

      <TaxTips />

      <TaxSavingChecklist />
    </div>
  )
}
