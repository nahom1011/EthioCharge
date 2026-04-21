import api from './axios'

export const fetchStations = (params = {}) =>
  api.get('/stations/', { params })

export const fetchStation = (id) =>
  api.get(`/stations/${id}/`)

export const createStation = (data) =>
  api.post('/stations/', data)

export const updateStation = (id, data) =>
  api.put(`/stations/${id}/`, data)

export const deleteStation = (id) =>
  api.delete(`/stations/${id}/`)

export const fetchStationReviews = (id) =>
  api.get(`/stations/${id}/reviews/`)

export const createReview = (data) =>
  api.post('/reviews/', data)
