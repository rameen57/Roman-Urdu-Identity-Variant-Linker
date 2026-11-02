type Variant = 'primary' | 'success' | 'warn' | 'outline' | 'ghost'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  disabled?: boolean
  className?: string
}) {
  const base = 'rounded-pill px-4 py-2 text-sm font-semibold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
  const styles: Record<Variant, string> = {
    primary: 'bg-accent text-ink hover:opacity-90',
    success: 'bg-accent text-ink hover:opacity-90',
    warn: 'bg-warn text-ink hover:opacity-90',
    outline: 'border border-track bg-surface text-text hover:bg-inset',
    ghost: 'text-muted hover:text-text hover:bg-inset',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`} aria-label={typeof children === 'string' ? children : undefined}>
      {children}
    </button>
  )
}
