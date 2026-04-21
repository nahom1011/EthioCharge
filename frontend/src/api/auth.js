import api from './axios'
import axios from 'axios'

export const register = (data) =>
  api.post('/auth/register/', data)

export const login = async (credentials) => {
  const { data } = await axios.post('/api/auth/login/', credentials)
  return data
}

export const getMe = () =>
  api.get('/auth/me/')

export const logout = (refresh) =>
  api.post('/auth/logout/', { refresh })
