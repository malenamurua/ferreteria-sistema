import { NavLink, Outlet } from 'react-router-dom'
import {
  Wrench, LayoutDashboard, Package, ShoppingCart, History,
  BarChart3, Users, Moon, Sun, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, exact: true },
  { to: '/vender', label: 'Vender', icon: ShoppingCart },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/ventas', label: 'Historial de ventas', icon: History },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, soloAdmin: true },
  { to: '/usuarios', label: 'Usuarios', icon: Users, soloAdmin: true },
]

export default function Layout() {
  const { user, logout, esAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || esAdmin)

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-surface hidden md:flex md:flex-col">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-accent-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold tracking-tight">FERRESYS</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-ink'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-display font-bold text-xs shrink-0">
              {user?.nombreCompleto?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.nombreCompleto}</p>
              <p className="text-xs text-ink-muted">{user?.rol === 'ADMIN' ? 'Administrador' : 'Vendedor'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-ink-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface md:bg-transparent">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-accent-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-sm">FERRESYS</span>
          </div>
          <div className="hidden md:block" />
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Nav mobile inferior */}
        <nav className="md:hidden border-t border-border bg-surface flex items-center justify-around py-2">
          {items.slice(0, 5).map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium ${
                  isActive ? 'text-accent' : 'text-ink-muted'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
