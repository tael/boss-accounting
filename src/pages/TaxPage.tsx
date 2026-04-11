import TaxDisclaimer from '@/components/tax/TaxDisclaimer'
import VatCalculator from '@/components/tax/VatCalculator'
import IncomeTaxCalc from '@/components/tax/IncomeTaxCalc'
import TaxTips from '@/components/tax/TaxTips'
import { BOOK_REFERENCES } from '@/constants/bookReferences'

export default function TaxPage() {
  const vatRef = BOOK_REFERENCES['tax.vat']
  const incomeTaxRef = BOOK_REFERENCES['tax.incomeTax']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">세금</h1>

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

      <TaxTips />
    </div>
  )
}
