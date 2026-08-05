import { useEffect, useState } from 'react'
import { Receipt, Banknote, CreditCard, QrCode } from 'lucide-react'
import { listarVentas } from '../api/ventas'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EstadoVacio from '../components/EstadoVacio'
import Badge from '../components/Badge'
import { formatMoneda, formatFechaHora } from '../utils/format'

const ICONOS_METODO = { EFECTIVO: Banknote, DEBITO: CreditCard, QR: QrCode }
const TONO_METODO = { EFECTIVO: 'exito', DEBITO: 'steel', QR: 'acento' }

export default function VentasHistorialPage() {
  const [ventas, setVentas] = useState(null)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)

  useEffect(() => {
    listarVentas()
      .then((data) => setVentas(data.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))))
      .catch(() => setVentas([]))
  }, [])

  return (
    <div className="pb-10">
      <PageHeader titulo="Historial de ventas" descripcion="Cada venta con la fecha y hora exacta en que se realizó." />

      <div className="px-6">
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {!ventas ? (
            <Spinner />
          ) : ventas.length === 0 ? (
            <EstadoVacio icono={Receipt} titulo="Todavía no hay ventas registradas" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="px-5 py-3 font-medium">Fecha y hora</th>
                  <th className="px-5 py-3 font-medium">Vendedor</th>
                  <th className="px-5 py-3 font-medium">Método</th>
                  <th className="px-5 py-3 font-medium text-right">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => {
                  const Icono = ICONOS_METODO[v.metodoPago]
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setVentaSeleccionada(v)}
                      className="border-b border-border last:border-0 hover:bg-surface-2 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-mono">{formatFechaHora(v.fecha)}</td>
                      <td className="px-5 py-3 text-ink-muted">{v.vendedorUsername}</td>
                      <td className="px-5 py-3">
                        <Badge tono={TONO_METODO[v.metodoPago]}>
                          <Icono className="w-3 h-3 mr-1 inline" />
                          {v.metodoPago}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-ink-muted">{v.detalles.length}</td>
                      <td className="px-5 py-3 text-right font-mono font-semibold">{formatMoneda(v.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        abierto={!!ventaSeleccionada}
        onCerrar={() => setVentaSeleccionada(null)}
        titulo={`Venta #${ventaSeleccionada?.id ?? ''}`}
      >
        {ventaSeleccionada && (
          <div>
            <div className="flex items-center justify-between text-sm mb-4">
              <div>
                <p className="text-ink-muted">Fecha y hora</p>
                <p className="font-mono font-medium">{formatFechaHora(ventaSeleccionada.fecha)}</p>
              </div>
              <div className="text-right">
                <p className="text-ink-muted">Vendedor</p>
                <p className="font-medium">{ventaSeleccionada.vendedorUsername}</p>
              </div>
            </div>

            <div className="rounded-md border border-border divide-y divide-border">
              {ventaSeleccionada.detalles.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{d.productoNombre}</p>
                    <p className="text-xs text-ink-muted font-mono">
                      {d.cantidad} × {formatMoneda(d.precioUnitario)}
                    </p>
                  </div>
                  <p className="font-mono font-semibold">{formatMoneda(d.subtotal)}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="font-medium">Total</span>
              <span className="font-mono font-extrabold text-lg">{formatMoneda(ventaSeleccionada.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
