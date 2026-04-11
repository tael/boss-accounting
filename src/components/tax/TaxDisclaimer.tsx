import { TAX_DISCLAIMER } from '@/constants/taxRates'

export default function TaxDisclaimer() {
  return (
    <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
      <span className="text-yellow-500 text-lg mt-0.5" aria-hidden="true">
        ⚠️
      </span>
      <p className="text-sm text-yellow-800">{TAX_DISCLAIMER}</p>
    </div>
  )
}
