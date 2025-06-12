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
  const userPartlists = ref([])
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
      userSets.value = data.results.map(item => ({
        id: item.set.set_num,
        name: item.set.name,
        year: item.set.year,
        numParts: item.set.num_parts,
        imageUrl: item.set.set_img_url,
        url: item.set.set_url,
        quantity: item.quantity,
        includeSpares: item.include_spares
      }))
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch your LEGO sets', 'danger')
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserPartlists = async () => {
    if (!apiKey.value || !userToken.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/`, {
        headers: {
          Authorization: `key ${apiKey.value}`,
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user partlists')
      }

      const data = await response.json()
      userPartlists.value = data.results.map(item => ({
        id: item.id,
        name: item.name,
        numParts: item.num_parts,
        isPrivate: item.is_private
      }))
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch your LEGO partlists', 'danger')
    } finally {
      isLoading.value = false
    }
  }

  const searchBricks = async (query, filters = {}) => {
    if (!apiKey.value) {
      toastStore.showToast('Please add your Rebrickable API key in profile settings', 'warning')
      return []
    }

    if (!userToken.value && filters.partlist) {
      toastStore.showToast('Please log in to view partlist contents', 'warning')
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      let url
      let params

      // If partlist filter is selected, use the partlist-specific endpoint
      if (filters.partlist) {
        url = `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${filters.partlist}/parts/`
        params = new URLSearchParams({
          page_size: 20
        })
      } else {
        // Use the general search endpoint
        params = new URLSearchParams({
          search: query,
          page_size: 20
        })

        // Add other filters
        if (filters.color) params.append('color', filters.color)
        if (filters.category) params.append('category', filters.category)
        if (filters.year) params.append('year', filters.year)

        // Add sorting
        if (filters.sortBy && filters.sortBy !== 'relevance') {
          params.append('ordering', filters.sortBy === 'partCount' ? 'num_parts' : filters.sortBy)
        }

        url = `${REBRICKABLE_API_BASE}/lego/parts/?${params.toString()}`
      }

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

      // Map the results - note that partlist parts have a slightly different structure
      const mappedResults = data.results.map(item => {
        const brick = filters.partlist ? item.part : item
        return {
          id: brick.part_num,
          name: brick.name,
          color: brick.color || 'Various',
          image_url: brick.part_img_url,
          url: `https://rebrickable.com/parts/${brick.part_num}`,
          quantity: item.quantity // Only available for partlist items
        }
      })

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

  const fetchBricksInSet = async setId => {
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
        throw new Error('Failed to fetch bricks in set')
      }

      const data = await response.json()
      return data.results.map(item => ({
        id: item.part.part_num,
        name: item.part.name,
        color: item.color?.name || 'Various',
        image_url: item.part.part_img_url,
        url: `https://rebrickable.com/parts/${item.part.part_num}`,
        quantity: item.quantity
      }))
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch bricks in set', 'danger')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchPartsInPartlist = async partlistId => {
    if (!apiKey.value || !userToken.value) {
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${partlistId}/parts/`,
        {
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch parts in partlist')
      }

      const data = await response.json()
      return data.results.map(item => ({
        id: item.part.part_num,
        name: item.part.name,
        color: item.color?.name || 'Various',
        image_url: item.part.part_img_url,
        url: `https://rebrickable.com/parts/${item.part.part_num}`,
        quantity: item.quantity
      }))
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to fetch parts in partlist', 'danger')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const addBrickToPartlist = async (partlistId, brickId, quantity) => {
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${partlistId}/parts/`,
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
        throw new Error('Failed to add part to partlist')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to add part to partlist', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const moveBrickBetweenPartlists = async (fromPartlistId, toPartlistId, brickId, quantity) => {
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      // First remove from source partlist
      const removeResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${fromPartlistId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
          }
        }
      )

      if (!removeResponse.ok) {
        throw new Error('Failed to remove part from source partlist')
      }

      // Then add to destination partlist
      const addResponse = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${toPartlistId}/parts/`,
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
        throw new Error('Failed to add part to destination partlist')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to move part between partlists', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteBrickFromPartlist = async (partlistId, brickId, quantity) => {
    if (!apiKey.value || !userToken.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${REBRICKABLE_API_BASE}/users/${userToken.value}/partlists/${partlistId}/parts/${brickId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `key ${apiKey.value}`,
            Accept: 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete part from partlist')
      }

      return true
    } catch (err) {
      error.value = err.message
      toastStore.showToast('Failed to delete part from partlist', 'danger')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    userSets,
    userPartlists,
    isLoading,
    error,

    // Getters
    apiKey,
    userToken,
    hasApiKey,

    // Actions
    fetchUserSets,
    fetchUserPartlists,
    searchBricks,
    addBrickToSet,
    moveBrickBetweenSets,
    deleteBrickFromSet,
    fetchBricksInSet,
    fetchPartsInPartlist,
    addBrickToPartlist,
    moveBrickBetweenPartlists,
    deleteBrickFromPartlist
  }
})
