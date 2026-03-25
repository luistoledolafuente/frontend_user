import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

export const getUsuarios   = ()          => api.get('/usuarios')
export const getUsuario    = (id)        => api.get(`/usuarios/${id}`)
export const createUsuario = (data)      => api.post('/usuarios', data)
export const updateUsuario = (id, data)  => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id)        => api.delete(`/usuarios/${id}`)