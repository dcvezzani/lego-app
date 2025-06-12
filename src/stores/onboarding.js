import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useOnboardingStore = defineStore('onboarding', () => {
  const authStore = useAuthStore()

  const isOnboardingComplete = computed(() => {
    if (!authStore.user) return false
    return !!(authStore.user.screen_name && authStore.user.rebrickable_api_key)
  })

  function checkOnboardingStatus() {
    if (authStore.isAuthenticated && !isOnboardingComplete.value) {
      return false
    }
    return true
  }

  return {
    isOnboardingComplete,
    checkOnboardingStatus
  }
})
