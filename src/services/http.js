import axios from 'axios'

// =====================================================
// HTTP Client — koneksi ke backend Laravel
// Base URL diambil dari .env (VITE_API_BASE_URL)
// =====================================================

const TOKEN_KEY = 'niki_frozen_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json'
  }
})

// Setiap request otomatis nempelin token (kalau ada)
http.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Kalau backend balesin 401 (token expired/invalid), otomatis logout & lempar ke login
http.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearToken()
      localStorage.removeItem('niki_frozen_session')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http