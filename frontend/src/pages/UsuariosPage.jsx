import { useEffect, useState } from 'react'
import { Plus, KeyRound, UserX, UserCheck } from 'lucide-react'
import { listarUsuarios, crearUsuario, habilitarUsuario, deshabilitarUsuario, resetearPassword } from '../api/usuarios'
import { obtenerMensajeError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'
import Input from '../components/Input'
import Select from '../components/Select'
import Campo from '../components/Campo'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { formatFechaHora } from '../utils/format'

const USUARIO_VACIO = { username: '', password: '', nombreCompleto: '', rol: 'VENDEDOR' }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState(null)
  const [error, setError] = useState('')

  const [modalCrear, setModalCrear] = useState(false)
  const [form, setForm] = useState(USUARIO_VACIO)
  const [erroresForm, setErroresForm] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [usuarioReset, setUsuarioReset] = useState(null)
  const [nuevaPassword, setNuevaPassword] = useState('')

  function cargar() {
    listarUsuarios().then(setUsuarios).catch(() => setError('No se pudieron cargar los usuarios'))
  }

  useEffect(cargar, [])

  async function guardarUsuario(e) {
    e.preventDefault()
    setGuardando(true)
    setErroresForm({})
    try {
      await crearUsuario(form)
      setModalCrear(false)
      setForm(USUARIO_VACIO)
      cargar()
    } catch (err) {
      const data = err?.response?.data
      if (data?.errores) setErroresForm(data.errores)
      else setError(obtenerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function toggleHabilitado(usuario) {
    const accion = usuario.habilitado ? deshabilitarUsuario : habilitarUsuario
    try {
      await accion(usuario.id)
      cargar()
    } catch (err) {
      setError(obtenerMensajeError(err))
    }
  }

  async function confirmarReset(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      await resetearPassword(usuarioReset.id, nuevaPassword)
      setUsuarioReset(null)
      setNuevaPassword('')
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader
        titulo="Usuarios"
        descripcion="Empleados con acceso al sistema."
        accion={
          <Boton onClick={() => setModalCrear(true)}>
            <Plus className="w-4 h-4" /> Nuevo usuario
          </Boton>
        }
      />

      {error && <p className="px-6 mb-4 text-sm text-danger">{error}</p>}

      <div className="px-6">
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {!usuarios ? (
            <Spinner />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Creado</th>
                  <th className="px-5 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium">{u.nombreCompleto}</p>
                      <p className="text-xs text-ink-muted font-mono">@{u.username}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tono={u.rol === 'ADMIN' ? 'acento' : 'steel'}>{u.rol}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tono={u.habilitado ? 'exito' : 'peligro'}>
                        {u.habilitado ? 'Habilitado' : 'Deshabilitado'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-muted font-mono text-xs">{formatFechaHora(u.fechaCreacion)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Resetear contraseña"
                          onClick={() => setUsuarioReset(u)}
                          className="w-7 h-7 rounded flex items-center justify-center text-ink-muted hover:bg-surface-2"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          title={u.habilitado ? 'Deshabilitar' : 'Habilitar'}
                          onClick={() => toggleHabilitado(u)}
                          className={`w-7 h-7 rounded flex items-center justify-center hover:bg-surface-2 ${
                            u.habilitado ? 'text-ink-muted hover:text-danger' : 'text-success'
                          }`}
                        >
                          {u.habilitado ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal crear usuario */}
      <Modal abierto={modalCrear} onCerrar={() => setModalCrear(false)} titulo="Nuevo usuario">
        <form onSubmit={guardarUsuario} className="space-y-4">
          <Campo label="Nombre completo" required error={erroresForm.nombreCompleto}>
            <Input value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} required />
          </Campo>
          <Campo label="Usuario" required error={erroresForm.username}>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </Campo>
          <Campo label="Contraseña" required error={erroresForm.password}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6} required />
          </Campo>
          <Campo label="Rol" required>
            <Select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="VENDEDOR">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </Campo>
          <div className="flex justify-end gap-2 pt-2">
            <Boton type="button" variante="secundario" onClick={() => setModalCrear(false)}>Cancelar</Boton>
            <Boton type="submit" disabled={guardando}>{guardando ? 'Creando…' : 'Crear usuario'}</Boton>
          </div>
        </form>
      </Modal>

      {/* Modal resetear password */}
      <Modal abierto={!!usuarioReset} onCerrar={() => setUsuarioReset(null)} titulo="Resetear contraseña">
        {usuarioReset && (
          <form onSubmit={confirmarReset} className="space-y-4">
            <p className="text-sm text-ink-muted">
              Nueva contraseña para <span className="font-medium text-ink">{usuarioReset.nombreCompleto}</span>
            </p>
            <Campo label="Nueva contraseña" required>
              <Input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)}
                minLength={6} autoFocus required />
            </Campo>
            <div className="flex justify-end gap-2 pt-2">
              <Boton type="button" variante="secundario" onClick={() => setUsuarioReset(null)}>Cancelar</Boton>
              <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Confirmar'}</Boton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
