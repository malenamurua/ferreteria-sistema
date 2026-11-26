import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Trash2, ScanLine, Banknote, CreditCard, QrCode, CheckCircle2 } from 'lucide-react'
import { buscarProductos, buscarPorCodigoExacto } from '../api/productos'
import { registrarVenta } from '../api/ventas'
import { obtenerMensajeError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Input from '../components/Input'
import Boton from '../components/Boton'
import { formatMoneda } from '../utils/format'
import { generarComprobantePDF } from '../utils/comprobante'

const METODOS_PAGO = [
  { valor: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
  { valor: 'DEBITO', label: 'Débito', icon: CreditCard },
  { valor: 'QR', label: 'QR', icon: QrCode },
]

export default function VenderPage() {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [carrito, setCarrito] = useState([]) // [{producto, cantidad}]
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([])
      return
    }
    setBuscando(true)
    const timeoutId = setTimeout(() => {
      buscarProductos(busqueda.trim())
        .then(setResultados)
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [busqueda])

  const agregarAlCarrito = useCallback((producto) => {
    setError('')
    setCarrito((actual) => {
      const existente = actual.find((item) => item.producto.id === producto.id)
      if (existente) {
        return actual.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stockActual) }
            : item
        )
      }
      return [...actual, { producto, cantidad: 1 }]
    })
    setBusqueda('')
    setResultados([])
    inputRef.current?.focus()
  }, [])

  async function handleKeyDown(e) {
    if (e.key !== 'Enter' || !busqueda.trim()) return
    e.preventDefault()
    try {
      const producto = await buscarPorCodigoExacto(busqueda.trim())
      agregarAlCarrito(producto)
    } catch {
      if (resultados.length > 0) {
        agregarAlCarrito(resultados[0])
      }
    }
  }

  function cambiarCantidad(productoId, delta) {
    setCarrito((actual) =>
      actual
        .map((item) => {
          if (item.producto.id !== productoId) return item
          const nuevaCantidad = item.cantidad + delta
          if (nuevaCantidad <= 0) return null
          return { ...item, cantidad: Math.min(nuevaCantidad, item.producto.stockActual) }
        })
        .filter(Boolean)
    )
  }

  function quitarDelCarrito(productoId) {
    setCarrito((actual) => actual.filter((item) => item.producto.id !== productoId))
  }

  const total = carrito.reduce((acc, item) => acc + item.producto.precioVenta * item.cantidad, 0)

  async function confirmarVenta() {
    if (carrito.length === 0) return
    setError('')
    setProcesando(true)
    try {
      const payload = {
        metodoPago,
        items: carrito.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
      }
      const venta = await registrarVenta(payload)
      setExito(venta)
      setCarrito([])
      generarComprobantePDF(venta)
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setProcesando(false)
    }
  }

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h2 className="font-display font-bold text-xl">Venta registrada</h2>
        <p className="mt-1 text-ink-muted">
          Total: <span className="font-mono font-semibold text-ink">{formatMoneda(exito.total)}</span>
          {' · '}{METODOS_PAGO.find((m) => m.valor === exito.metodoPago)?.label}
        </p>
        <Boton className="mt-6" onClick={() => setExito(null)}>Registrar otra venta</Boton>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <PageHeader titulo="Vender" descripcion="Buscá por nombre o escaneá el código de barras." />

      <div className="px-6 grid lg:grid-cols-[1fr_380px] gap-6">
        <div>
          <div className="relative">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <Input
              ref={inputRef}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre del producto o código de barras…"
              className="pl-10 py-3 text-base"
              autoFocus
            />
          </div>

          {busqueda.trim() && (
            <div className="mt-2 rounded-lg border border-border bg-surface overflow-hidden">
              {buscando ? (
                <p className="px-4 py-3 text-sm text-ink-muted">Buscando…</p>
              ) : resultados.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">Sin resultados.</p>
              ) : (
                resultados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => agregarAlCarrito(p)}
                    disabled={p.stockActual === 0}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-surface-2 text-left disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.nombre}</p>
                      <p className="text-xs text-ink-muted font-mono">
                        {p.codigoBarras || 'sin código'} · stock: {p.stockActual}
                      </p>
                    </div>
                    <p className="font-mono font-semibold text-sm">{formatMoneda(p.precioVenta)}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface flex flex-col h-fit lg:sticky lg:top-6">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-bold text-sm">Carrito</h3>
          </div>

          {carrito.length === 0 ? (
            <p className="px-4 py-8 text-sm text-ink-muted text-center">Todavía no agregaste productos.</p>
          ) : (
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.producto.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.producto.nombre}</p>
                    <p className="text-xs text-ink-muted font-mono">
                      {formatMoneda(item.producto.precioVenta)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, -1)}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm hover:bg-surface-2"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-mono">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, 1)}
                      disabled={item.cantidad >= item.producto.stockActual}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm hover:bg-surface-2 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => quitarDelCarrito(item.producto.id)}
                    className="text-ink-muted hover:text-danger shrink-0"
                    aria-label="Quitar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono font-extrabold text-lg">{formatMoneda(total)}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {METODOS_PAGO.map(({ valor, label, icon: Icon }) => (
                <button
                  key={valor}
                  onClick={() => setMetodoPago(valor)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-md border text-xs font-medium transition-colors ${
                    metodoPago === valor
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-danger mb-3">{error}</p>}

            <Boton
              className="w-full"
              onClick={confirmarVenta}
              disabled={carrito.length === 0 || procesando}
            >
              {procesando ? 'Procesando…' : 'Confirmar venta'}
            </Boton>
          </div>
        </div>
      </div>
    </div>
  )
}