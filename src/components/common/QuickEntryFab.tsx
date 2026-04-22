import { useState } from 'react'
import { Modal } from './Modal'
import TransactionForm from '@/components/transactions/TransactionForm'

export function QuickEntryFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="거래 빠른 추가"
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="거래 추가">
        <TransactionForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
