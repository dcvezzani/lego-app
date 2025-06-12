import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_EXPIRY } from '../config/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  function setUser(userData) {
    user.value = userData
    // Set session cookie
    document.cookie = `${AUTH_COOKIE_NAME}=${JSON.stringify(userData)}; max-age=${AUTH_COOKIE_EXPIRY}; path=/`
  }

  function clearUser() {
    user.value = null
    // Clear session cookie
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }

  function loadUserFromCookie() {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`))
    if (authCookie) {
      try {
        const userData = JSON.parse(authCookie.split('=')[1])
        setUser(userData)
      } catch (e) {
        console.error('Failed to parse auth cookie:', e)
        clearUser()
      }
    }
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    loadUserFromCookie
  }
})
