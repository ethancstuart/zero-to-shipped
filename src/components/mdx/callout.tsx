interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger'
  title?: string
  children: React.ReactNode
}

const styles = {
  info: 'border-blue-500/30 bg-blue-500/5 text-blue-200',
  warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-200',
  tip: 'border-green-500/30 bg-green-500/5 text-green-200',
  danger: 'border-red-500/30 bg-red-500/5 text-red-200',
} as const

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      {title && <p className="mb-2 font-semibold">{title}</p>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}
