import { useState } from 'react'
import { BOOK_REFERENCES } from '@/constants/bookReferences'
import type { BookReferenceKey } from '@/constants/bookReferences'

interface BookReferenceProps {
  refKey: BookReferenceKey
}

export default function BookReference({ refKey }: BookReferenceProps) {
  const [visible, setVisible] = useState(false)
  const ref = BOOK_REFERENCES[refKey]

  if (!ref) return null

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 transition-colors"
        aria-label={`책 참조: ${ref.chapter}장 - ${ref.title}`}
      >
        📖
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg bg-gray-900 text-white text-xs p-3 shadow-lg">
          <p className="font-semibold mb-1">
            {ref.chapter}장 - {ref.title}
          </p>
          <p className="text-gray-300 leading-relaxed">{ref.summary}</p>
          {ref.page && (
            <p className="mt-1 text-gray-400">p.{ref.page}</p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  )
}
