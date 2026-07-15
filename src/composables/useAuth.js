import { ref } from 'vue'
import { findUserByCredentials, addShift } from '../db/LocalDb'

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
      role: user.role,
      cabang: user.cabang || 'Cabang Utama'
    }
    currentUser.value = sessionUser
    saveSession(sessionUser)
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    clearSession()
  }

  // Set shift and starting cash when kasir mulai tugas
  async function setShift(shift, startingCash) {
    if (!currentUser.value) return
    currentUser.value.shift = shift
    currentUser.value.startingCash = Number(startingCash) || 0
    saveSession(currentUser.value)

    await addShift({
      username: currentUser.value.username,
      nama: currentUser.value.nama,
      shift,
      startingCash: Number(startingCash) || 0,
      tanggal: today(),
      waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  function clearShift() {
    if (!currentUser.value) return
    delete currentUser.value.shift
    delete currentUser.value.startingCash
    saveSession(currentUser.value)
  }

  function isAuthenticated() {
    return !!currentUser.value
  }

  return {
    currentUser,
    login,
    logout,
    setShift,
    clearShift,
    isAuthenticated
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
