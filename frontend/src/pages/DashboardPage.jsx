import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, PackageX, ArrowRight, TrendingUp, ShoppingCart } from 'lucide-react'
import { listarStockBajo } from '../api/productos'
import { reporteHoy } from '../api/reportes'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import EstadoVacio from '../components/EstadoVacio'
import Badge from '../components/Badge'
import { formatMoneda } from '../utils/format'

export default function DashboardPage() {
  const { user, esAdmin } = useAuth()
  const [stockBajo, setStockBajo] = useState(null)
  const [resumenHoy, setResumenHoy] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listarStockBajo().then(setStockBajo).catch(() => setError('No se pudo cargar la alerta de stock'))
    if (esAdmin) {
      reporteHoy().then(setResumenHoy).catch(() => {})
    }
  }, [esAdmin])

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${user?.nombreCompleto?.split(' ')[0] ?? ''}`}
        descripcion="Esto es lo que está pasando hoy en el negocio."
      />

      <div className="px-6 pb-10 grid gap-4 md:grid-cols-2">
        {esAdmin && (
          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-ink-muted text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Vendido hoy
            </div>
            {resumenHoy ? (
              <>
                <p className="mt-2 font-display font-extrabold text-3xl tracking-tight">
                  {formatMoneda(resumenHoy.totalVendido)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{resumenHoy.cantidadVentas} venta(s)</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Cargando…</p>
            )}
          </div>
        )}

        <Link
          to="/vender"
          className="rounded-lg border border-border bg-accent/10 hover:bg-accent/15 transition-colors p-5 flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 text-accent text-sm font-semibold">
              <ShoppingCart className="w-4 h-4" />
              Registrar una venta
            </div>
            <p className="mt-1 text-sm text-ink-muted">Buscá un producto o escaneá un código</p>
          </div>
          <ArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="px-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-danger" />
          <h2 className="font-display font-bold text-lg">Alerta de stock</h2>
          {stockBajo && stockBajo.length > 0 && <Badge tono="peligro">{stockBajo.length}</Badge>}
        </div>

        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {!stockBajo ? (
            <Spinner />
          ) : stockBajo.length === 0 ? (
            <EstadoVacio
              icono={PackageX}
              titulo="Todo el stock está en orden"
              descripcion="Ningún producto está por debajo de su stock mínimo."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium text-right">Stock actual</th>
                  <th className="px-5 py-3 font-medium text-right">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.nombre}</p>
                      {p.codigoBarras && (
                        <p className="text-xs text-ink-muted font-mono">{p.codigoBarras}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-danger">
                      {p.stockActual}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-muted">{p.stockMinimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
