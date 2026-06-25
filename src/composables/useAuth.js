import { ref } from 'vue'
import { findUserByCredentials } from '../db/LocalDb'

const STORAGE_KEY = 'niki_frozen_session'

const currentUser = ref(loadSession())

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useAuth() {
  async function login(username, password) {
    const user = await findUserByCredentials(username, password)
    if (!user) {
      return { success: false, message: 'Username atau password salah.' }
    }
    const sessionUser = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role
    }
    currentUser.value = sessionUser
    saveSession(sessionUser)
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    clearSession()
  }

  function isAuthenticated() {
    return !!currentUser.value
  }

  return {
    currentUser,
    login,
    logout,
    isAuthenticated
  }
}
