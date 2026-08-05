import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, PackagePlus, PackageMinus, Search, Package } from 'lucide-react'
import {
  listarProductos, buscarProductos, crearProducto, actualizarProducto,
  eliminarProducto, ajustarStock,
} from '../api/productos'
import { listarCategorias } from '../api/categorias'
import { obtenerMensajeError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'
import Input from '../components/Input'
import Select from '../components/Select'
import Campo from '../components/Campo'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import EstadoVacio from '../components/EstadoVacio'
import { formatMoneda } from '../utils/format'

const PRODUCTO_VACIO = {
  nombre: '', descripcion: '', codigoBarras: '', categoriaId: '',
  precioCosto: '', precioVenta: '', stockActual: '0', stockMinimo: '5', unidadMedida: 'unidad',
}

export default function ProductosPage() {
  const { esAdmin } = useAuth()
  const [productos, setProductos] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  const [modalForm, setModalForm] = useState(null) // null | 'crear' | producto a editar
  const [form, setForm] = useState(PRODUCTO_VACIO)
  const [erroresForm, setErroresForm] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [productoAjuste, setProductoAjuste] = useState(null)
  const [ajusteForm, setAjusteForm] = useState({ tipo: 'INGRESO', cantidad: '', motivo: '' })

  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const cargar = useCallback(() => {
    setProductos(null)
    const promesa = busqueda.trim() ? buscarProductos(busqueda.trim()) : listarProductos()
    promesa.then(setProductos).catch(() => setError('No se pudieron cargar los productos'))
  }, [busqueda])

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(cargar, 200)
    return () => clearTimeout(t)
  }, [cargar])

  function abrirCrear() {
    setForm(PRODUCTO_VACIO)
    setErroresForm({})
    setModalForm('crear')
  }

  function abrirEditar(producto) {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      codigoBarras: producto.codigoBarras ?? '',
      categoriaId: producto.categoriaId ?? '',
      precioCosto: producto.precioCosto,
      precioVenta: producto.precioVenta,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      unidadMedida: producto.unidadMedida ?? '',
    })
    setErroresForm({})
    setModalForm(producto)
  }

  async function guardarProducto(e) {
    e.preventDefault()
    setGuardando(true)
    setErroresForm({})
    const payload = {
      ...form,
      categoriaId: form.categoriaId || null,
      precioCosto: Number(form.precioCosto),
      precioVenta: Number(form.precioVenta),
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
      codigoBarras: form.codigoBarras || null,
    }
    try {
      if (modalForm === 'crear') {
        await crearProducto(payload)
      } else {
        await actualizarProducto(modalForm.id, payload)
      }
      setModalForm(null)
      cargar()
    } catch (err) {
      const data = err?.response?.data
      if (data?.errores) setErroresForm(data.errores)
      else setError(obtenerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  function abrirAjuste(producto, tipo) {
    setProductoAjuste(producto)
    setAjusteForm({ tipo, cantidad: '', motivo: '' })
  }

  async function confirmarAjuste(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      await ajustarStock(productoAjuste.id, {
        tipo: ajusteForm.tipo,
        cantidad: Number(ajusteForm.cantidad),
        motivo: ajusteForm.motivo || null,
      })
      setProductoAjuste(null)
      cargar()
    } catch (err) {
      setError(obtenerMensajeError(err))
      setProductoAjuste(null)
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarProducto(productoAEliminar.id)
      setProductoAEliminar(null)
      cargar()
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader
        titulo="Productos"
        descripcion="Catálogo, precios y stock."
        accion={esAdmin && (
          <Boton onClick={abrirCrear}>
            <Plus className="w-4 h-4" /> Nuevo producto
          </Boton>
        )}
      />

      <div className="px-6 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="pl-10"
          />
        </div>
      </div>

      {error && <p className="px-6 mb-4 text-sm text-danger">{error}</p>}

      <div className="px-6">
        <div className="rounded-lg border border-border bg-surface overflow-hidden overflow-x-auto">
          {!productos ? (
            <Spinner />
          ) : productos.length === 0 ? (
            <EstadoVacio icono={Package} titulo="No hay productos" descripcion="Probá con otra búsqueda o creá el primero." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium text-right">Precio</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  {esAdmin && <th className="px-5 py-3 font-medium text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.nombre}</p>
                      {p.codigoBarras && <p className="text-xs text-ink-muted font-mono">{p.codigoBarras}</p>}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{p.categoriaNombre ?? '—'}</td>
                    <td className="px-5 py-3 text-right font-mono">{formatMoneda(p.precioVenta)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono font-semibold">{p.stockActual}</span>
                      {p.stockBajo && <span className="ml-2"><Badge tono="peligro">bajo</Badge></span>}
                    </td>
                    {esAdmin && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Ingresar stock"
                            onClick={() => abrirAjuste(p, 'INGRESO')}
                            className="w-7 h-7 rounded flex items-center justify-center text-success hover:bg-success/10"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            title="Descontar stock"
                            onClick={() => abrirAjuste(p, 'EGRESO_MANUAL')}
                            className="w-7 h-7 rounded flex items-center justify-center text-ink-muted hover:bg-surface-2"
                          >
                            <PackageMinus className="w-4 h-4" />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => abrirEditar(p)}
                            className="w-7 h-7 rounded flex items-center justify-center text-ink-muted hover:bg-surface-2"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => setProductoAEliminar(p)}
                            className="w-7 h-7 rounded flex items-center justify-center text-ink-muted hover:text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal crear/editar producto */}
      <Modal
        abierto={!!modalForm}
        onCerrar={() => setModalForm(null)}
        titulo={modalForm === 'crear' ? 'Nuevo producto' : 'Editar producto'}
        ancho="max-w-lg"
      >
        <form onSubmit={guardarProducto} className="space-y-4">
          <Campo label="Nombre" required error={erroresForm.nombre}>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </Campo>

          <Campo label="Código de barras" error={erroresForm.codigoBarras}>
            <Input
              className="font-mono"
              value={form.codigoBarras}
              onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
              placeholder="Opcional — escaneá o tipeá"
            />
          </Campo>

          <Campo label="Categoría">
            <Select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Precio costo" required error={erroresForm.precioCosto}>
              <Input type="number" step="0.01" min="0" value={form.precioCosto}
                onChange={(e) => setForm({ ...form, precioCosto: e.target.value })} required />
            </Campo>
            <Campo label="Precio venta" required error={erroresForm.precioVenta}>
              <Input type="number" step="0.01" min="0" value={form.precioVenta}
                onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} required />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Stock inicial" required error={erroresForm.stockActual}>
              <Input
                type="number" min="0" value={form.stockActual}
                onChange={(e) => setForm({ ...form, stockActual: e.target.value })}
                disabled={modalForm !== 'crear'}
                required
              />
              {modalForm !== 'crear' && (
                <p className="mt-1 text-xs text-ink-muted">Para cambiar el stock, usá los botones de ingreso/egreso.</p>
              )}
            </Campo>
            <Campo label="Stock mínimo" required error={erroresForm.stockMinimo}>
              <Input type="number" min="0" value={form.stockMinimo}
                onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} required />
            </Campo>
          </div>

          <Campo label="Unidad de medida">
            <Input value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
              placeholder="unidad, kg, metro…" />
          </Campo>

          <div className="flex justify-end gap-2 pt-2">
            <Boton type="button" variante="secundario" onClick={() => setModalForm(null)}>Cancelar</Boton>
            <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Boton>
          </div>
        </form>
      </Modal>

      {/* Modal ajuste de stock */}
      <Modal
        abierto={!!productoAjuste}
        onCerrar={() => setProductoAjuste(null)}
        titulo={ajusteForm.tipo === 'INGRESO' ? 'Ingresar stock' : 'Descontar stock'}
      >
        {productoAjuste && (
          <form onSubmit={confirmarAjuste} className="space-y-4">
            <p className="text-sm text-ink-muted">
              {productoAjuste.nombre} — stock actual: <span className="font-mono font-semibold text-ink">{productoAjuste.stockActual}</span>
            </p>
            <Campo label="Cantidad" required>
              <Input
                type="number" min="1" value={ajusteForm.cantidad}
                onChange={(e) => setAjusteForm({ ...ajusteForm, cantidad: e.target.value })}
                autoFocus required
              />
            </Campo>
            <Campo label="Motivo">
              <Input
                value={ajusteForm.motivo}
                onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                placeholder={ajusteForm.tipo === 'INGRESO' ? 'Compra a proveedor…' : 'Rotura, ajuste de inventario…'}
              />
            </Campo>
            <div className="flex justify-end gap-2 pt-2">
              <Boton type="button" variante="secundario" onClick={() => setProductoAjuste(null)}>Cancelar</Boton>
              <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Confirmar'}</Boton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        abierto={!!productoAEliminar}
        onCerrar={() => setProductoAEliminar(null)}
        onConfirmar={confirmarEliminar}
        cargando={eliminando}
        titulo="Eliminar producto"
        mensaje={`¿Seguro que querés eliminar "${productoAEliminar?.nombre}"? No se borra el historial de ventas asociado, pero dejará de aparecer en el catálogo.`}
      />
    </div>
  )
}
