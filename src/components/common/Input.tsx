import type { InputHTMLAttributes } from 'react'
import { parseKRW, formatKRWNoSymbol } from '@/utils/format'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  required?: boolean
  /** true이면 정수 원 단위 처리 (쉼표 포매팅 + parseKRW) */
  currencyMode?: boolean
  value?: string | number
  onChange?: (value: string) => void
}

export function Input({
  label,
  error,
  required,
  currencyMode = false,
  value,
  onChange,
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const displayValue =
    currencyMode && value !== undefined && value !== ''
      ? formatKRWNoSymbol(Number(String(value).replace(/[,\s]/g, '')) || 0)
      : value

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!onChange) return
    if (currencyMode) {
      const raw = parseKRW(e.target.value)
      onChange(Number.isNaN(raw) ? '' : String(raw))
    } else {
      onChange(e.target.value)
    }
  }

  const inputType = currencyMode ? 'text' : type

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        {...props}
        type={inputType}
        required={required}
        value={displayValue ?? ''}
        onChange={handleChange}
        inputMode={currencyMode ? 'numeric' : undefined}
        className={[
          'w-full px-3 py-2 text-sm border rounded-[var(--radius-md)] outline-none transition-colors',
          'placeholder:text-gray-400',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
