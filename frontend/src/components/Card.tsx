export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-card bg-white p-5 shadow-soft ${className}`}>{children}</div>
}
