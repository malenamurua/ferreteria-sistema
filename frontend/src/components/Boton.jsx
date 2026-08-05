export default function Boton({ variante = 'primario', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold text-sm px-4 py-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed'

  const variantes = {
    primario: 'bg-accent text-accent-ink hover:brightness-95 active:brightness-90',
    secundario: 'bg-surface-2 text-ink border border-border hover:bg-border/40',
    peligro: 'bg-danger text-white hover:brightness-110',
    fantasma: 'text-ink-muted hover:text-ink hover:bg-surface-2',
  }

  return (
    <button className={`${base} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  )
}
