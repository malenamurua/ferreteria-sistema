// El backend manda las fechas en formato ISO (ej: "2026-08-04T14:32:10").
// Estas funciones las muestran en un formato legible, siempre con hora incluida.

export function formatFechaHora(fechaIso) {
  if (!fechaIso) return '—'
  const fecha = new Date(fechaIso)
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFecha(fechaIso) {
  if (!fechaIso) return '—'
  const fecha = new Date(fechaIso)
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatHora(fechaIso) {
  if (!fechaIso) return '—'
  const fecha = new Date(fechaIso)
  return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function formatMoneda(valor) {
  const numero = Number(valor ?? 0)
  return numero.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

// Convierte una fecha (Date o string yyyy-mm-dd) al formato que espera el backend
export function toISODate(date) {
  if (typeof date === 'string') return date
  return date.toISOString().slice(0, 10)
}
