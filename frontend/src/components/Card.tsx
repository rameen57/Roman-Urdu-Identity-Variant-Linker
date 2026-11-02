export default function Card({ children, className = '', padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return <div className={`rounded-xl bg-surface border border-track shadow-soft ${padded ? 'p-4' : ''} ${className}`}>{children}</div>
}
