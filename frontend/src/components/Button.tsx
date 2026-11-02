type Variant = 'primary' | 'secondary' | 'danger' | 'success'

const styles: Record<Variant, string> = {
  primary: 'bg-lavender text-ink hover:opacity-90',
  secondary: 'bg-cream text-ink border border-line hover:bg-white',
  danger: 'bg-rose text-ink hover:opacity-90',
  success: 'bg-mint text-ink hover:opacity-90',
}

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
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-btn px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
