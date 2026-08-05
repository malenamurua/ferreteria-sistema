import apiClient from './client'

export async function listarCategorias() {
  const { data } = await apiClient.get('/api/categorias')
  return data
}

export async function crearCategoria(payload) {
  const { data } = await apiClient.post('/api/categorias', payload)
  return data
}

export async function actualizarCategoria(id, payload) {
  const { data } = await apiClient.put(`/api/categorias/${id}`, payload)
  return data
}

export async function eliminarCategoria(id) {
  await apiClient.delete(`/api/categorias/${id}`)
}
