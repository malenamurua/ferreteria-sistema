export default function PageHeader({ titulo, descripcion, accion }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-8 pb-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-ink-muted">{descripcion}</p>}
      </div>
      {accion}
    </div>
  )
}
