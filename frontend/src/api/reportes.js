import apiClient from './client'

export async function reporteHoy() {
  const { data } = await apiClient.get('/api/reportes/ventas/hoy')
  return data
}

export async function reporteSemana() {
  const { data } = await apiClient.get('/api/reportes/ventas/semana')
  return data
}

export async function reporteMes() {
  const { data } = await apiClient.get('/api/reportes/ventas/mes')
  return data
}

export async function reportePorRango(desde, hasta) {
  const { data } = await apiClient.get('/api/reportes/ventas', { params: { desde, hasta } })
  return data
}

export async function productosMasVendidos(desde, hasta, limite = 10) {
  const { data } = await apiClient.get('/api/reportes/productos-mas-vendidos', {
    params: { desde, hasta, limite },
  })
  return data
}
