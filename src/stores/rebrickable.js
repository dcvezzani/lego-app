import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

const REBRICKABLE_API_BASE = 'https://rebrickable.com/api/v3'

export const useRebrickableStore = defineStore('rebrickable', () => {
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  // State
  const userSets = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const apiKey = computed(() => authStore.user?.rebrickable_api_key || '')
  const userToken = computed(() => authStore.user?.rebrickable_user_token || '')
  const hasApiKey = computed(() => !!apiKey.value && !!userToken.value)

  // Actions
  const fetchUserSets = async () => {
    if (!apiKey.value || !userToken.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/`, {
        headers: {
          Authorization: `key ${apiKey.value}`,
          Accept: 'application/json'
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

  const searchBricks = async query => {
    if (!apiKey.value) {
      toastStore.showToast('Please add your Rebrickable API key in profile settings', 'warning')
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const url = `${REBRICKABLE_API_BASE}/lego/parts/?search=${encodeURIComponent(query)}&page_size=20`

      const response = await fetch(url, {
        headers: {
          Authorization: `key ${apiKey.value}`,
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to search bricks: ${response.statusText}. ${errorText}`)
      }

      const data = await response.json()

      const mappedResults = data.results.map(brick => ({
        id: brick.part_num,
        name: brick.name,
        color: brick.color || 'Various',
        image_url: brick.part_img_url,
        url: `https://rebrickable.com/parts/${brick.part_num}`
      }))

      return mappedResults
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to search bricks', 'danger')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const addBrickToSet = async (setId, brickId, quantity) => {
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/${setId}/parts/`,
        {
          method: 'POST',
          headers: {
            Authorization: `key ${apiKey.value}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            part: brickId,
            quantity
          })
        }
      )

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
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      // First remove from source set
      const removeResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/${fromSetId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
          }
        }
      )

      if (!removeResponse.ok) {
        throw new Error('Failed to remove brick from source set')
      }

      // Then add to destination set
      const addResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/${toSetId}/parts/`,
        {
          method: 'POST',
          headers: {
            Authorization: `key ${apiKey.value}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
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
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/${setId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
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

  const fetchSetBricks = async setId => {
    if (!apiKey.value || !userToken.value) {
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/sets/${setId}/parts/`,
        {
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch set bricks')
      }

      const data = await response.json()
      return data.results.map(brick => ({
        id: brick.part.part_num,
        name: brick.part.name,
        color: brick.color?.name || 'Various',
        image_url: brick.part.part_img_url,
        url: `https://rebrickable.com/parts/${brick.part.part_num}`,
        quantity: brick.quantity
      }))
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch set bricks', 'danger')
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    userSets,
    isLoading,
    error,

    // Getters
    apiKey,
    userToken,
    hasApiKey,

    // Actions
    fetchUserSets,
    searchBricks,
    addBrickToSet,
    moveBrickBetweenSets,
    deleteBrickFromSet,
    fetchSetBricks
  }
})
