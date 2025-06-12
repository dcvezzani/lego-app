<template>
  <div class="sets-view container">
    <h1 class="title">My LEGO Sets</h1>

    <!-- Row 1: Search Area -->
    <div class="search-area mb-6">
      <BrickSearch @search="handleSearch" :disabled="isLoading" />

      <!-- Loading State -->
      <div v-if="isLoading" class="has-text-centered my-4">
        <span class="icon is-large">
          <i class="fas fa-spinner fa-pulse fa-2x"></i>
        </span>
        <p class="mt-2">Loading...</p>
      </div>

      <!-- Back to Search Button -->
      <div v-if="selectedBrick && searchResults.length > 0" class="mt-4">
        <button class="button is-info is-light" @click="clearSelection">
          <span class="icon">
            <i class="fas fa-arrow-left"></i>
          </span>
          <span>Back to Search Results</span>
        </button>
      </div>

      <!-- Search Results -->
      <div v-else-if="searchResults.length > 0 && !selectedBrick" class="search-results mt-4">
        <div class="columns is-multiline">
          <div
            v-for="brick in searchResults"
            :key="brick.id"
            class="column is-4"
            @click="selectBrick(brick)"
          >
            <div class="card hoverable" :class="{ 'is-selected': selectedBrick?.id === brick.id }">
              <div class="card-image">
                <figure class="image is-square">
                  <img
                    :src="brick.image_url"
                    :alt="brick.name"
                    @error="handleImageError"
                    class="has-background-light"
                  />
                </figure>
              </div>
              <div class="card-content">
                <p class="title is-6">{{ brick.name }}</p>
                <p class="subtitle is-7">ID: {{ brick.id }}</p>
                <p class="has-text-grey-dark">Color: {{ brick.color }}</p>
                <div class="mt-2">
                  <a
                    :href="brick.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="button is-small is-info is-light"
                    @click.stop
                  >
                    <span class="icon">
                      <i class="fas fa-external-link-alt"></i>
                    </span>
                    <span>View on Rebrickable</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Set Management -->
    <div class="set-management" v-if="isAuthenticated">
      <div class="columns">
        <!-- Column 1 -->
        <div class="column is-4">
          <!-- Source Set Partlist -->
          <div class="field">
            <label class="label">Source Partlist</label>
            <div class="control">
              <div class="select is-fullwidth" :class="{ 'is-loading': isLoading }">
                <select v-model="sourcePartlistId" :disabled="!userPartlists.length || isLoading">
                  <option value="">Select a partlist</option>
                  <option v-for="list in userPartlists" :key="list.id" :value="list.id">
                    {{ list.name }} - {{ list.numParts }} parts
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Brick Management -->
        <div class="column is-4">
          <div class="box">
            <!-- Selected Brick Display -->
            <div v-if="selectedBrick" class="selected-brick mb-4">
              <figure class="image is-128x128 mb-4 mx-auto">
                <img
                  :src="selectedBrick.image_url"
                  :alt="selectedBrick.name"
                  @error="handleImageError"
                  class="has-background-light"
                />
              </figure>

              <div class="field">
                <label class="label">Brick ID</label>
                <div class="control">
                  <input class="input" type="text" :value="selectedBrick.id" readonly />
                </div>
              </div>

              <div class="field">
                <label class="label">Name</label>
                <div class="control">
                  <input class="input" type="text" :value="selectedBrick.name" readonly />
                </div>
              </div>

              <div class="field">
                <label class="label">Color</label>
                <div class="control">
                  <input class="input" type="text" :value="selectedBrick.color" readonly />
                </div>
              </div>

              <div class="field">
                <label class="label">Quantity</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="brickQuantity"
                    min="1"
                    :max="maxQuantity"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="field is-grouped is-grouped-centered mt-4">
                <p class="control">
                  <button
                    class="button is-primary"
                    @click="handleAdd"
                    :disabled="!canAdd || isLoading"
                    :class="{ 'is-loading': isLoading }"
                  >
                    <span class="icon">
                      <i class="fas fa-plus"></i>
                    </span>
                    <span>Add</span>
                  </button>
                </p>
                <p class="control">
                  <button
                    class="button is-info"
                    @click="handleMove"
                    :disabled="!canMove || isLoading"
                    :class="{ 'is-loading': isLoading }"
                  >
                    <span class="icon">
                      <i class="fas fa-exchange-alt"></i>
                    </span>
                    <span>Move</span>
                  </button>
                </p>
                <p class="control">
                  <button
                    class="button is-danger"
                    @click="handleDelete"
                    :disabled="!canDelete || isLoading"
                    :class="{ 'is-loading': isLoading }"
                  >
                    <span class="icon">
                      <i class="fas fa-trash"></i>
                    </span>
                    <span>Delete</span>
                  </button>
                </p>
              </div>
            </div>

            <!-- No Selection State -->
            <div v-else class="has-text-centered">
              <span class="icon is-large">
                <i class="fas fa-cube fa-2x"></i>
              </span>
              <p class="mt-2">Select a brick from the search results above</p>
            </div>
          </div>
        </div>

        <!-- Column 3: Target Partlist -->
        <div class="column is-4">
          <div class="field">
            <label class="label">Target Partlist</label>
            <div class="control">
              <div class="select is-fullwidth" :class="{ 'is-loading': isLoading }">
                <select
                  v-model="destinationPartlistId"
                  :disabled="!userPartlists.length || isLoading"
                >
                  <option value="">Select a partlist</option>
                  <option v-for="list in userPartlists" :key="list.id" :value="list.id">
                    {{ list.name }} - {{ list.numParts }} parts
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Authenticated Message -->
    <div v-else class="notification is-warning">
      <p>Please sign in to manage your LEGO sets.</p>
    </div>

    <!-- Toast Notifications Toggle -->
    <div class="field mt-6">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="showToasts" />
          Show notifications for actions
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useRebrickableStore } from '../stores/rebrickable'
import BrickSearch from '../components/BrickSearch.vue'

export default {
  name: 'SetsView',
  components: {
    BrickSearch
  },

  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const rebrickableStore = useRebrickableStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // State
    const searchResults = ref([])
    const selectedBrick = ref(null)
    const brickQuantity = ref(1)
    const sourcePartlistId = ref('')
    const destinationPartlistId = ref('')
    const showToasts = ref(true)
    const userPartlists = computed(() => rebrickableStore.userPartlists)
    const maxQuantity = ref(999)
    const localLoading = ref(false)
    const isLoading = computed(() => rebrickableStore.isLoading || localLoading.value)

    // Watch for authentication changes and load data
    watch(
      () => isAuthenticated.value,
      async newValue => {
        if (newValue) {
          await rebrickableStore.fetchUserPartlists()
        }
      },
      { immediate: true }
    )

    // Load user data on component mount if authenticated
    onMounted(async () => {
      if (isAuthenticated.value) {
        await rebrickableStore.fetchUserPartlists()
      }
    })

    // Watch for changes in userPartlists
    watch(userPartlists, newLists => {
      if (newLists.length === 0) {
        sourcePartlistId.value = ''
        destinationPartlistId.value = ''
      }
    })

    // Computed properties for button states
    const canAdd = computed(
      () => selectedBrick.value && destinationPartlistId.value && brickQuantity.value > 0
    )

    const canMove = computed(
      () =>
        selectedBrick.value &&
        sourcePartlistId.value &&
        destinationPartlistId.value &&
        sourcePartlistId.value !== destinationPartlistId.value &&
        brickQuantity.value > 0
    )

    const canDelete = computed(
      () => selectedBrick.value && sourcePartlistId.value && brickQuantity.value > 0
    )

    // Methods
    const handleSearch = async searchData => {
      searchResults.value = searchData.results
      selectedBrick.value = null // Clear selected brick when new search is performed
    }

    const selectBrick = brick => {
      selectedBrick.value = brick
      brickQuantity.value = 1
    }

    const handleImageError = event => {
      event.target.src = 'https://via.placeholder.com/200x200?text=No+Image'
    }

    const handleAdd = async () => {
      if (!selectedBrick.value || !destinationPartlistId.value) return

      const success = await rebrickableStore.addBrickToPartlist(
        destinationPartlistId.value,
        selectedBrick.value.id,
        brickQuantity.value
      )

      if (success && showToasts.value) {
        toastStore.showToast('Brick added successfully', 'success')
      }
    }

    const handleMove = async () => {
      if (!selectedBrick.value || !sourcePartlistId.value || !destinationPartlistId.value) return

      const success = await rebrickableStore.moveBrickBetweenPartlists(
        sourcePartlistId.value,
        destinationPartlistId.value,
        selectedBrick.value.id,
        brickQuantity.value
      )

      if (success && showToasts.value) {
        toastStore.showToast('Brick moved successfully', 'success')
      }
    }

    const handleDelete = async () => {
      if (!selectedBrick.value || !sourcePartlistId.value) return

      const success = await rebrickableStore.deleteBrickFromPartlist(
        sourcePartlistId.value,
        selectedBrick.value.id,
        brickQuantity.value
      )

      if (success && showToasts.value) {
        toastStore.showToast('Brick deleted successfully', 'success')
      }
    }

    const clearSelection = () => {
      selectedBrick.value = null
      brickQuantity.value = 1
    }

    return {
      // State
      isAuthenticated,
      searchResults,
      selectedBrick,
      brickQuantity,
      sourcePartlistId,
      destinationPartlistId,
      showToasts,
      userPartlists,
      maxQuantity,
      isLoading,

      // Methods
      handleSearch,
      selectBrick,
      handleImageError,
      handleAdd,
      handleMove,
      handleDelete,
      clearSelection
    }
  }
}
</script>

<style scoped>
.sets-view {
  padding-bottom: 2rem;
}

.search-results {
  max-height: 500px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.card.hoverable {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card.hoverable:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card.is-selected {
  border: 2px solid #00d1b2;
}

.image.is-square img {
  object-fit: contain;
  padding: 1rem;
}

.selected-brick .image img {
  object-fit: contain;
}

.button .icon {
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .search-results {
    max-height: 400px;
  }

  .column {
    padding: 0.5rem;
  }
}

.source-bricks {
  max-height: 400px;
  overflow-y: auto;
}

.brick-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0.5rem;
  border-radius: 4px;
}

.brick-item:hover {
  background-color: #f5f5f5;
}

.brick-item .columns.is-selected {
  background-color: #ebfffc;
  border-radius: 4px;
}

.brick-item .image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brick-item .image img {
  object-fit: contain;
  max-height: 100%;
  width: auto;
}
</style>
