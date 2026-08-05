export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
