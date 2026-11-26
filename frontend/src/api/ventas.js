import apiClient from './client'

export async function registrarVenta(payload) {
const { data } = await apiClient.post('/api/ventas', payload)
return data
}

export async function listarVentas({
fechaDesde,
fechaHasta,
estado
} = {}) {
const params = {}

if (fechaDesde) {
params.fechaDesde = fechaDesde
}

if (fechaHasta) {
params.fechaHasta = fechaHasta
}

if (estado) {
params.estado = estado
}

const { data } = await apiClient.get('/api/ventas', {
params
})

return data
}

export async function obtenerVenta(id) {
const { data } = await apiClient.get(`/api/ventas/${id}`)
return data
}

export async function anularVenta(id, motivo) {
const { data } = await apiClient.patch(
`/api/ventas/${id}/anular`,
{ motivo }
)

return data
}
