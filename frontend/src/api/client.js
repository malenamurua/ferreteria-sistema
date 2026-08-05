import axios from 'axios'

// La URL del backend se toma de una variable de entorno (ver .env.example).
// En desarrollo, por defecto apunta a localhost:8080.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({ baseURL })

// Agrega el token JWT a cada request automaticamente, si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ferreteria_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el backend responde 401 (token vencido o invalido), deslogueamos
// y mandamos al login. Evita que la app quede "colgada" con un token viejo.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ferreteria_token')
      localStorage.removeItem('ferreteria_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Extrae un mensaje de error legible de cualquier respuesta del backend
// (nuestro GlobalExceptionHandler devuelve distintos formatos segun el caso)
export function obtenerMensajeError(error) {
  const data = error?.response?.data
  if (!data) return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.'
  if (typeof data === 'string') return data
  if (data.mensaje) return data.mensaje
  if (data.errores) {
    return Object.values(data.errores).join(' · ')
  }
  return 'Ocurrió un error inesperado.'
}

export default apiClient
