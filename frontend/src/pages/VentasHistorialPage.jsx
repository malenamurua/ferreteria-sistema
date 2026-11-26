
import { useEffect, useState } from 'react'
import { Receipt, Banknote, CreditCard, QrCode, Ban, Search } from 'lucide-react'
import { listarVentas, anularVenta } from '../api/ventas'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EstadoVacio from '../components/EstadoVacio'
import Badge from '../components/Badge'
import { formatMoneda, formatFechaHora } from '../utils/format'

const ICONOS_METODO = {
  EFECTIVO: Banknote,
  DEBITO: CreditCard,
  QR: QrCode
}

const TONO_METODO = {
  EFECTIVO: 'exito',
  DEBITO: 'steel',
  QR: 'acento'
}

function obtenerFechaHoy() {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function VentasHistorialPage() {
  const [ventas, setVentas] = useState(null)

  const [pestana, setPestana] = useState('ACTIVA')

  const [fechaDesde, setFechaDesde] = useState(obtenerFechaHoy())
  const [fechaHasta, setFechaHasta] = useState(obtenerFechaHoy())

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)

  const [ventaAAnular, setVentaAAnular] = useState(null)
  const [motivoAnulacion, setMotivoAnulacion] = useState('')
  const [anulando, setAnulando] = useState(false)
  const [errorAnulacion, setErrorAnulacion] = useState('')

  async function cargarVentas(
    desde = fechaDesde,
    hasta = fechaHasta,
    estado = pestana
  ) {
    setVentas(null)

    try {
      const data = await listarVentas({
        fechaDesde: desde,
        fechaHasta: hasta,
        estado
      })

      const ordenadas = data
        .slice()
        .sort(
          (a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        )

      setVentas(ordenadas)
    } catch (error) {
      console.error(error)
      setVentas([])
    }
  }

  useEffect(() => {
    cargarVentas()
  }, [])

  function buscarVentas() {
    if (!fechaDesde || !fechaHasta) {
      return
    }

    if (fechaDesde > fechaHasta) {
      alert('La fecha desde no puede ser posterior a la fecha hasta')
      return
    }

    cargarVentas(fechaDesde, fechaHasta, pestana)
  }

  function cambiarPestana(nuevaPestana) {
    setPestana(nuevaPestana)

    cargarVentas(
      fechaDesde,
      fechaHasta,
      nuevaPestana
    )
  }

  function abrirConfirmacionAnular(venta) {
    setVentaAAnular(venta)
    setMotivoAnulacion('')
    setErrorAnulacion('')
  }

  async function confirmarAnulacion() {
    if (!motivoAnulacion.trim()) {
      setErrorAnulacion(
        'Ingresá un motivo para anular la venta'
      )
      return
    }

    setAnulando(true)
    setErrorAnulacion('')

    try {
      await anularVenta(
        ventaAAnular.id,
        motivoAnulacion.trim()
      )

      setVentaAAnular(null)
      setVentaSeleccionada(null)

      cargarVentas(
        fechaDesde,
        fechaHasta,
        pestana
      )
    } catch (err) {
      setErrorAnulacion(
        err?.response?.data?.message ||
          'No se pudo anular la venta. Intentá de nuevo.'
      )
    } finally {
      setAnulando(false)
    }
  }

  return (
    <div className="px-6">

      {/* Título */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold">
          Historial de ventas
        </h1>

        <p className="text-sm text-ink-muted mt-1">
          Consultá las ventas por fecha y estado.
        </p>
      </div>

      {/* Pestañas */}
      <div className="border-b border-border mb-5">
        <div className="flex gap-6">

          <button
            onClick={() => cambiarPestana('ACTIVA')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              pestana === 'ACTIVA'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            🟢 Activas
          </button>

          <button
            onClick={() => cambiarPestana('ANULADA')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              pestana === 'ANULADA'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            🔴 Anuladas
          </button>

        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-border bg-surface p-4 mb-5">

        <div className="flex flex-wrap items-end gap-4">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Desde
            </label>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                setFechaDesde(e.target.value)
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Hasta
            </label>

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                setFechaHasta(e.target.value)
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            onClick={buscarVentas}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>

        </div>

        <p className="text-xs text-ink-muted mt-3">
          Mostrando ventas{' '}
          {pestana === 'ACTIVA'
            ? 'activas'
            : 'anuladas'}{' '}
          desde {fechaDesde} hasta {fechaHasta}.
        </p>

      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">

        {!ventas ? (
          <Spinner />

        ) : ventas.length === 0 ? (
          <EstadoVacio
            icono={Receipt}
            titulo={
              pestana === 'ACTIVA'
                ? 'No hay ventas activas en este período'
                : 'No hay ventas anuladas en este período'
            }
          />

        ) : (

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-border text-left text-ink-muted">

                <th className="px-5 py-3 font-medium">
                  Fecha y hora
                </th>

                <th className="px-5 py-3 font-medium">
                  Vendedor
                </th>

                <th className="px-5 py-3 font-medium">
                  Método
                </th>

                <th className="px-5 py-3 font-medium">
                  Estado
                </th>

                <th className="px-5 py-3 font-medium text-right">
                  Items
                </th>

                <th className="px-5 py-3 font-medium text-right">
                  Total
                </th>

                <th className="px-5 py-3 font-medium text-right">
                  Acciones
                </th>

              </tr>
            </thead>

            <tbody>

              {ventas.map((v) => {

                const Icono =
                  ICONOS_METODO[v.metodoPago] || Receipt

                const anulada =
                  v.estado === 'ANULADA'

                return (

                  <tr
                    key={v.id}
                    className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${
                      anulada ? 'opacity-60' : ''
                    }`}
                  >

                    <td
                      className="px-5 py-3 font-mono cursor-pointer"
                      onClick={() =>
                        setVentaSeleccionada(v)
                      }
                    >
                      {formatFechaHora(v.fecha)}
                    </td>

                    <td
                      className="px-5 py-3 text-ink-muted cursor-pointer"
                      onClick={() =>
                        setVentaSeleccionada(v)
                      }
                    >
                      {v.vendedorUsername}
                    </td>

                    <td
                      className="px-5 py-3 cursor-pointer"
                      onClick={() =>
                        setVentaSeleccionada(v)
                      }
                    >
                      <Badge
                        tono={
                          TONO_METODO[v.metodoPago]
                        }
                      >
                        <Icono className="w-3 h-3 mr-1 inline" />
                        {v.metodoPago}
                      </Badge>
                    </td>

                    <td className="px-5 py-3">

                      {anulada ? (

                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          🔴 Anulada
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          🟢 Activa
                        </span>

                      )}

                    </td>

                    <td
                      className="px-5 py-3 text-right text-ink-muted cursor-pointer"
                      onClick={() =>
                        setVentaSeleccionada(v)
                      }
                    >
                      {v.detalles.length}
                    </td>

                    <td
                      className="px-5 py-3 text-right font-mono font-semibold cursor-pointer"
                      onClick={() =>
                        setVentaSeleccionada(v)
                      }
                    >
                      {formatMoneda(v.total)}
                    </td>

                    <td className="px-5 py-3 text-right">

                      {!anulada && (

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirConfirmacionAnular(v)
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Anular
                        </button>

                      )}

                    </td>

                  </tr>

                )
              })}

            </tbody>

          </table>

        )}

      </div>

      {/* Modal detalle */}
      <Modal
        abierto={!!ventaSeleccionada}
        onCerrar={() =>
          setVentaSeleccionada(null)
        }
        titulo={`Venta #${
          ventaSeleccionada?.id ?? ''
        }`}
      >

        {ventaSeleccionada && (

          <div>

            <div className="flex items-center justify-between text-sm mb-4">

              <div>
                <p className="text-ink-muted">
                  Fecha y hora
                </p>

                <p className="font-mono font-medium">
                  {formatFechaHora(
                    ventaSeleccionada.fecha
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-ink-muted">
                  Vendedor
                </p>

                <p className="font-medium">
                  {ventaSeleccionada.vendedorUsername}
                </p>
              </div>

            </div>

            {ventaSeleccionada.estado ===
              'ANULADA' && (

              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">

                <p className="font-medium">
                  🔴 Venta anulada
                </p>

                {ventaSeleccionada.motivoAnulacion && (
                  <p className="text-xs mt-1">
                    Motivo:{' '}
                    {ventaSeleccionada.motivoAnulacion}
                  </p>
                )}

              </div>

            )}

            <div className="rounded-md border border-border divide-y divide-border">

              {ventaSeleccionada.detalles.map(
                (d, i) => (

                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5 text-sm"
                  >

                    <div>

                      <p className="font-medium">
                        {d.productoNombre}
                      </p>

                      <p className="text-xs text-ink-muted font-mono">
                        {d.cantidad} ×{' '}
                        {formatMoneda(
                          d.precioUnitario
                        )}
                      </p>

                    </div>

                    <p className="font-mono font-semibold">
                      {formatMoneda(d.subtotal)}
                    </p>

                  </div>

                )
              )}

            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">

              <span className="font-medium">
                Total
              </span>

              <span className="font-mono font-extrabold text-lg">
                {formatMoneda(
                  ventaSeleccionada.total
                )}
              </span>

            </div>

            {ventaSeleccionada.estado !==
              'ANULADA' && (

              <button
                onClick={() =>
                  abrirConfirmacionAnular(
                    ventaSeleccionada
                  )
                }
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
              >
                <Ban className="w-4 h-4" />
                Anular venta
              </button>

            )}

          </div>

        )}

      </Modal>

      {/* Modal anulación */}
      <Modal
        abierto={!!ventaAAnular}
        onCerrar={() =>
          !anulando &&
          setVentaAAnular(null)
        }
        titulo={`Anular venta #${
          ventaAAnular?.id ?? ''
        }`}
      >

        {ventaAAnular && (

          <div>

            <p className="text-sm text-ink-muted mb-4">
              Esta acción cambiará el estado de la
              venta a <strong>Anulada</strong> y
              devolverá el stock de los productos
              vendidos. No se puede deshacer.
            </p>

            <label className="block text-sm font-medium mb-1.5">
              Motivo de la anulación
            </label>

            <textarea
              value={motivoAnulacion}
              onChange={(e) =>
                setMotivoAnulacion(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Ej: el cliente se arrepintió, error de carga, etc."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />

            {errorAnulacion && (

              <p className="text-sm text-red-600 mt-2">
                {errorAnulacion}
              </p>

            )}

            <div className="flex items-center justify-end gap-2 mt-5">

              <button
                onClick={() =>
                  setVentaAAnular(null)
                }
                disabled={anulando}
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-surface-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarAnulacion}
                disabled={anulando}
                className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {anulando
                  ? 'Anulando...'
                  : 'Confirmar anulación'}
              </button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  )
}

