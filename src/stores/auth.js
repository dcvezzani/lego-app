import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_EXPIRY } from '../config/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  function setUser(userData) {
    user.value = userData
    // Set session cookie with proper encoding
    const encodedData = encodeURIComponent(JSON.stringify(userData))
    document.cookie = `${AUTH_COOKIE_NAME}=${encodedData}; max-age=${AUTH_COOKIE_EXPIRY}; path=/`
  }

  function clearUser() {
    user.value = null
    // Clear session cookie
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }

  function loadUserFromCookie() {
    try {
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`))

      if (authCookie) {
        const encodedValue = authCookie.split('=')[1]
        if (!encodedValue) return

        const decodedValue = decodeURIComponent(encodedValue.trim())
        const userData = JSON.parse(decodedValue)
        setUser(userData)
      }
    } catch (e) {
      console.error('Failed to parse auth cookie:', e)
      clearUser()
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
