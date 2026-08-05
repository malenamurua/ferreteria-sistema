export default function EstadoVacio({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icono && (
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <Icono className="w-5 h-5 text-ink-muted" />
        </div>
      )}
      <h3 className="font-display font-bold text-base">{titulo}</h3>
      {descripcion && <p className="mt-1 text-sm text-ink-muted max-w-xs">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
