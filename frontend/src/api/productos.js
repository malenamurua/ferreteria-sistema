import apiClient from './client'

export async function listarProductos() {
  const { data } = await apiClient.get('/api/productos')
  return data
}

export async function buscarProductos(texto) {
  const { data } = await apiClient.get('/api/productos/buscar', { params: { q: texto } })
  return data
}

export async function buscarPorCodigoExacto(codigo) {
  const { data } = await apiClient.get(`/api/productos/codigo/${encodeURIComponent(codigo)}`)
  return data
}

export async function listarStockBajo() {
  const { data } = await apiClient.get('/api/productos/stock-bajo')
  return data
}

export async function crearProducto(payload) {
  const { data } = await apiClient.post('/api/productos', payload)
  return data
}

export async function actualizarProducto(id, payload) {
  const { data } = await apiClient.put(`/api/productos/${id}`, payload)
  return data
}

export async function eliminarProducto(id) {
  await apiClient.delete(`/api/productos/${id}`)
}

export async function ajustarStock(id, payload) {
  const { data } = await apiClient.post(`/api/productos/${id}/ajustar-stock`, payload)
  return data
}
