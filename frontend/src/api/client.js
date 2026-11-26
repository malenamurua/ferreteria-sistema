import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL
})


// Agrega JWT automáticamente
apiClient.interceptors.request.use((config) => {

  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


// Errores
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem('token')
      localStorage.removeItem('usuario')

      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)


export function obtenerMensajeError(error) {

  const data = error?.response?.data

  if (!data) {
    return 'No se pudo conectar con el servidor.'
  }

  if (typeof data === 'string') {
    return data
  }

  if (data.mensaje) {
    return data.mensaje
  }

  if (data.errores) {
    return Object.values(data.errores).join(' · ')
  }

  return 'Ocurrió un error inesperado.'
}


export default apiClient