import apiClient from './client'

export async function login(username, password) {
  const { data } = await apiClient.post('/api/auth/login', {
    username,
    password
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('usuario', JSON.stringify(data))

  return data
}