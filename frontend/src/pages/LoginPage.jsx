import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Moon, Sun, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { obtenerMensajeError } from '../api/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      {/* Panel izquierdo: identidad de marca, con la textura de pegboard como firma visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-2 pegboard-texture">
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">FERRESYS</span>
          </div>

          <div className="max-w-sm">
            <h1 className="font-display font-extrabold text-4xl leading-[1.1] tracking-tight text-ink">
              Todo el negocio,
              <br />
              bajo un mismo techo.
            </h1>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Stock, ventas y caja en un solo lugar. Sin planillas sueltas,
              sin perder el hilo de lo que entra y sale del depósito.
            </p>
          </div>

          <p className="text-xs text-ink-muted font-mono">Sistema de gestión · uso interno</p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-6">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-24">
          <div className="w-full max-w-sm">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
                <Wrench className="w-4 h-4 text-accent-ink" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold tracking-tight">FERRESYS</span>
            </div>

            <h2 className="font-display font-bold text-2xl tracking-tight">Iniciar sesión</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Ingresá con tu usuario para acceder al sistema.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1.5">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent transition-colors"
                  placeholder="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-md bg-accent text-accent-ink font-semibold py-2.5 flex items-center justify-center gap-2 hover:brightness-95 active:brightness-90 disabled:opacity-60 transition-all"
              >
                {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
                {cargando ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
