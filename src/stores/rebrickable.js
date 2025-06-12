import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

const REBRICKABLE_API_BASE = 'https://rebrickable.com/api/v3'

export const useRebrickableStore = defineStore('rebrickable', () => {
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  
  // State
  const apiKey = ref('')
  const userSets = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const hasApiKey = computed(() => !!apiKey.value)

  // Actions
  const setApiKey = (key) => {
    apiKey.value = key
  }

  const fetchUserSets = async () => {
    if (!apiKey.value || !authStore.user?.email) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${REBRICKABLE_API_BASE}/users/${authStore.user.email}/sets/`, {
        headers: {
          'Authorization': `key ${apiKey.value}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user sets')
      }

      const data = await response.json()
      userSets.value = data.results
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch your LEGO sets', 'danger')
    } finally {
      isLoading.value = false
    }
  }

  const searchBricks = async (query) => {
    if (!apiKey.value) {
      toastStore.showToast('Please add your Rebrickable API key in profile settings', 'warning')
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${REBRICKABLE_API_BASE}/lego/parts/?search=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `key ${apiKey.value}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to search bricks')
      }

      const data = await response.json()
      return data.results
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to search bricks', 'danger')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const addBrickToSet = async (setId, brickId, quantity) => {
    if (!apiKey.value || !authStore.user?.email) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${REBRICKABLE_API_BASE}/users/${authStore.user.email}/sets/${setId}/parts/`, {
        method: 'POST',
        headers: {
          'Authorization': `key ${apiKey.value}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          part: brickId,
          quantity
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add brick to set')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to add brick to set', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const moveBrickBetweenSets = async (fromSetId, toSetId, brickId, quantity) => {
    if (!apiKey.value || !authStore.user?.email) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      // First remove from source set
      const removeResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${authStore.user.email}/sets/${fromSetId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `key ${apiKey.value}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!removeResponse.ok) {
        throw new Error('Failed to remove brick from source set')
      }

      // Then add to destination set
      const addResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${authStore.user.email}/sets/${toSetId}/parts/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `key ${apiKey.value}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            part: brickId,
            quantity
          })
        }
      )

      if (!addResponse.ok) {
        throw new Error('Failed to add brick to destination set')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to move brick between sets', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteBrickFromSet = async (setId, brickId, quantity) => {
    if (!apiKey.value || !authStore.user?.email) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${authStore.user.email}/sets/${setId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `key ${apiKey.value}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete brick from set')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to delete brick from set', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    apiKey,
    userSets,
    isLoading,
    error,

    // Getters
    hasApiKey,

    // Actions
    setApiKey,
    fetchUserSets,
    searchBricks,
    addBrickToSet,
    moveBrickBetweenSets,
    deleteBrickFromSet
  }
}) 