interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-[var(--radius-lg)] border border-gray-200 shadow-sm',
        className,
      ].join(' ')}
    >
      {title && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
