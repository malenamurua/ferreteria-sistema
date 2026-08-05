export default function Badge({ tono = 'neutro', children }) {
  const tonos = {
    neutro: 'bg-surface-2 text-ink-muted',
    exito: 'bg-success/15 text-success',
    peligro: 'bg-danger/15 text-danger',
    acento: 'bg-accent/15 text-accent',
    steel: 'bg-steel/15 text-steel',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  )
}
