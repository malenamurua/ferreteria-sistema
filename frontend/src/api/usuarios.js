import apiClient from './client'

export async function listarUsuarios() {
  const { data } = await apiClient.get('/api/usuarios')
  return data
}

export async function crearUsuario(payload) {
  const { data } = await apiClient.post('/api/usuarios', payload)
  return data
}

export async function habilitarUsuario(id) {
  const { data } = await apiClient.patch(`/api/usuarios/${id}/habilitar`)
  return data
}

export async function deshabilitarUsuario(id) {
  const { data } = await apiClient.patch(`/api/usuarios/${id}/deshabilitar`)
  return data
}

export async function resetearPassword(id, nuevaPassword) {
  await apiClient.post(`/api/usuarios/${id}/resetear-password`, { nuevaPassword })
}

export async function cambiarMiPassword(passwordActual, passwordNueva) {
  await apiClient.post('/api/usuarios/mi-perfil/cambiar-password', { passwordActual, passwordNueva })
}
