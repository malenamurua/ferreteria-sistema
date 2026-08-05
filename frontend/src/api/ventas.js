import apiClient from './client'

export async function registrarVenta(payload) {
  const { data } = await apiClient.post('/api/ventas', payload)
  return data
}

export async function listarVentas() {
  const { data } = await apiClient.get('/api/ventas')
  return data
}

export async function obtenerVenta(id) {
  const { data } = await apiClient.get(`/api/ventas/${id}`)
  return data
}
