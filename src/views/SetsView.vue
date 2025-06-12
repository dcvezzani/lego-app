<template>
  <div class="sets-view container">
    <h1 class="title">My LEGO Sets</h1>

    <!-- Row 1: Search Area -->
    <div class="search-area mb-6">
      <BrickSearch @search="handleSearch" />

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results mt-4">
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
        <!-- Column 1: Source Set Selection -->
        <div class="column is-4">
          <div class="field">
            <label class="label">Source Set</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="sourceSetId" :disabled="!userSets.length">
                  <option value="">Select a set</option>
                  <option v-for="set in userSets" :key="set.id" :value="set.id">
                    {{ set.name }}
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
                  />
                </div>
              </div>

              <div class="field is-grouped is-grouped-centered mt-4">
                <p class="control">
                  <button class="button is-primary" @click="handleAdd" :disabled="!canAdd">
                    <span class="icon">
                      <i class="fas fa-plus"></i>
                    </span>
                    <span>Add</span>
                  </button>
                </p>
                <p class="control">
                  <button class="button is-info" @click="handleMove" :disabled="!canMove">
                    <span class="icon">
                      <i class="fas fa-exchange-alt"></i>
                    </span>
                    <span>Move</span>
                  </button>
                </p>
                <p class="control">
                  <button class="button is-danger" @click="handleDelete" :disabled="!canDelete">
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

        <!-- Column 3: Destination Set Selection -->
        <div class="column is-4">
          <div class="field">
            <label class="label">Destination Set</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="destinationSetId" :disabled="!userSets.length">
                  <option value="">Select a set</option>
                  <option v-for="set in userSets" :key="set.id" :value="set.id">
                    {{ set.name }}
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import BrickSearch from '../components/BrickSearch.vue'

export default {
  name: 'SetsView',
  components: {
    BrickSearch
  },

  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // State
    const searchResults = ref([])
    const selectedBrick = ref(null)
    const brickQuantity = ref(1)
    const sourceSetId = ref('')
    const destinationSetId = ref('')
    const showToasts = ref(true)
    const userSets = ref([]) // TODO: Fetch from Rebrickable API
    const maxQuantity = ref(999) // TODO: Update based on available quantity

    // Computed properties for button states
    const canAdd = computed(
      () => selectedBrick.value && destinationSetId.value && brickQuantity.value > 0
    )

    const canMove = computed(
      () =>
        selectedBrick.value &&
        sourceSetId.value &&
        destinationSetId.value &&
        sourceSetId.value !== destinationSetId.value &&
        brickQuantity.value > 0
    )

    const canDelete = computed(
      () => selectedBrick.value && sourceSetId.value && brickQuantity.value > 0
    )

    // Methods
    const handleSearch = async searchData => {
      try {
        // TODO: Implement actual API call
        console.log('Search data:', searchData)
        searchResults.value = [
          {
            id: '3001',
            name: '2 x 4 Brick',
            color: 'Red',
            image_url: 'https://cdn.rebrickable.com/media/parts/elements/300126.jpg',
            url: 'https://rebrickable.com/parts/3001'
          }
          // Add more mock results...
        ]
      } catch (error) {
        console.error('Search failed:', error)
        if (showToasts.value) {
          toastStore.showToast('Failed to search for bricks', 'danger')
        }
      }
    }

    const selectBrick = brick => {
      selectedBrick.value = brick
      brickQuantity.value = 1
    }

    const handleImageError = event => {
      event.target.src = 'https://via.placeholder.com/200x200?text=No+Image'
    }

    const handleAdd = async () => {
      try {
        // TODO: Implement API call
        console.log('Adding brick:', {
          brick: selectedBrick.value,
          quantity: brickQuantity.value,
          setId: destinationSetId.value
        })

        if (showToasts.value) {
          toastStore.showToast('Brick added successfully', 'success')
        }
      } catch (error) {
        console.error('Failed to add brick:', error)
        if (showToasts.value) {
          toastStore.showToast('Failed to add brick', 'danger')
        }
      }
    }

    const handleMove = async () => {
      try {
        // TODO: Implement API call
        console.log('Moving brick:', {
          brick: selectedBrick.value,
          quantity: brickQuantity.value,
          fromSetId: sourceSetId.value,
          toSetId: destinationSetId.value
        })

        if (showToasts.value) {
          toastStore.showToast('Brick moved successfully', 'success')
        }
      } catch (error) {
        console.error('Failed to move brick:', error)
        if (showToasts.value) {
          toastStore.showToast('Failed to move brick', 'danger')
        }
      }
    }

    const handleDelete = async () => {
      try {
        // TODO: Implement API call
        console.log('Deleting brick:', {
          brick: selectedBrick.value,
          quantity: brickQuantity.value,
          setId: sourceSetId.value
        })

        if (showToasts.value) {
          toastStore.showToast('Brick deleted successfully', 'success')
        }
      } catch (error) {
        console.error('Failed to delete brick:', error)
        if (showToasts.value) {
          toastStore.showToast('Failed to delete brick', 'danger')
        }
      }
    }

    return {
      // State
      isAuthenticated,
      searchResults,
      selectedBrick,
      brickQuantity,
      sourceSetId,
      destinationSetId,
      showToasts,
      userSets,
      maxQuantity,

      // Computed
      canAdd,
      canMove,
      canDelete,

      // Methods
      handleSearch,
      selectBrick,
      handleImageError,
      handleAdd,
      handleMove,
      handleDelete
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
</style>
