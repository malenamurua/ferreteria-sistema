import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

function obtenerPreferenciaInicial() {
  const guardado = localStorage.getItem('ferreteria_theme')
  if (guardado === 'dark' || guardado === 'light') return guardado
  // Si el usuario no eligio nada todavia, respetamos la preferencia del sistema operativo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(obtenerPreferenciaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('ferreteria_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((actual) => (actual === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
