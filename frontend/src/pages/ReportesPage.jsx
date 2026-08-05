import { useEffect, useState } from 'react'
import { Banknote, CreditCard, QrCode, Trophy } from 'lucide-react'
import { reporteHoy, reporteSemana, reporteMes, reportePorRango, productosMasVendidos } from '../api/reportes'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'
import Input from '../components/Input'
import Campo from '../components/Campo'
import Spinner from '../components/Spinner'
import EstadoVacio from '../components/EstadoVacio'
import { formatMoneda, toISODate } from '../utils/format'

const PERIODOS = [
  { id: 'hoy', label: 'Hoy', fetcher: reporteHoy },
  { id: 'semana', label: 'Esta semana', fetcher: reporteSemana },
  { id: 'mes', label: 'Este mes', fetcher: reporteMes },
  { id: 'rango', label: 'Rango personalizado' },
]

const METODOS = [
  { valor: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
  { valor: 'DEBITO', label: 'Débito', icon: CreditCard },
  { valor: 'QR', label: 'QR', icon: QrCode },
]

function hoyISO() {
  return toISODate(new Date())
}

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState('hoy')
  const [desde, setDesde] = useState(hoyISO())
  const [hasta, setHasta] = useState(hoyISO())
  const [reporte, setReporte] = useState(null)
  const [topProductos, setTopProductos] = useState(null)

  useEffect(() => {
    const opcion = PERIODOS.find((p) => p.id === periodo)
    setReporte(null)
    setTopProductos(null)

    if (opcion.fetcher) {
      opcion.fetcher().then(setReporte)
    } else if (desde && hasta) {
      cargarPorRango()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo])

  function cargarPorRango() {
    setReporte(null)
    setTopProductos(null)
    reportePorRango(desde, hasta).then(setReporte)
    productosMasVendidos(desde, hasta, 5).then(setTopProductos)
  }

  // Para hoy/semana/mes, el top de productos lo pedimos con el mismo rango que devuelve el reporte
  useEffect(() => {
    if (!reporte || periodo === 'rango') return
    const d = toISODate(new Date(reporte.desde))
    const h = toISODate(new Date(new Date(reporte.hasta).getTime() - 1))
    productosMasVendidos(d, h, 5).then(setTopProductos).catch(() => setTopProductos([]))
  }, [reporte, periodo])

  return (
    <div className="pb-10">
      <PageHeader titulo="Reportes" descripcion="Ventas por período y productos más vendidos." />

      <div className="px-6 mb-6 flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              periodo === p.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-ink-muted hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {periodo === 'rango' && (
        <div className="px-6 mb-6 flex flex-wrap items-end gap-3">
          <Campo label="Desde">
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Campo>
          <Campo label="Hasta">
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </Campo>
          <Boton onClick={cargarPorRango}>Aplicar</Boton>
        </div>
      )}

      {!reporte ? (
        <div className="px-6"><Spinner /></div>
      ) : (
        <>
          <div className="px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-lg border border-border bg-surface p-5 lg:col-span-1">
              <p className="text-sm text-ink-muted font-medium">Total vendido</p>
              <p className="mt-2 font-display font-extrabold text-2xl tracking-tight">
                {formatMoneda(reporte.totalVendido)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{reporte.cantidadVentas} venta(s)</p>
            </div>

            {METODOS.map(({ valor, label, icon: Icon }) => (
              <div key={valor} className="rounded-lg border border-border bg-surface p-5">
                <div className="flex items-center gap-1.5 text-sm text-ink-muted font-medium">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <p className="mt-2 font-mono font-bold text-xl">
                  {formatMoneda(reporte.totalPorMetodoPago?.[valor] ?? 0)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {reporte.cantidadPorMetodoPago?.[valor] ?? 0} venta(s)
                </p>
              </div>
            ))}
          </div>

          <div className="px-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-accent" />
              <h2 className="font-display font-bold text-lg">Productos más vendidos</h2>
            </div>

            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              {!topProductos ? (
                <Spinner />
              ) : topProductos.length === 0 ? (
                <EstadoVacio titulo="Sin ventas en este período" />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-ink-muted">
                      <th className="px-5 py-3 font-medium">#</th>
                      <th className="px-5 py-3 font-medium">Producto</th>
                      <th className="px-5 py-3 font-medium text-right">Cantidad</th>
                      <th className="px-5 py-3 font-medium text-right">Facturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={p.productoId} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 text-ink-muted font-mono">{i + 1}</td>
                        <td className="px-5 py-3 font-medium">{p.nombre}</td>
                        <td className="px-5 py-3 text-right font-mono">{p.cantidadVendida}</td>
                        <td className="px-5 py-3 text-right font-mono font-semibold">{formatMoneda(p.totalFacturado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
