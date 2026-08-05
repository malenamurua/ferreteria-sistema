import { Loader2 } from 'lucide-react'

export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-muted text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  )
}
