<template>
  <div class="brick-search">
    <div class="field has-addons">
      <div class="control is-expanded">
        <input
          class="input"
          type="text"
          placeholder="Search for LEGO bricks..."
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          :class="{ 'is-loading': isLoading }"
          :disabled="disabled || isLoading"
        />
      </div>
      <div class="control">
        <button
          class="button is-primary"
          @click="handleSearch"
          :class="{ 'is-loading': isLoading }"
          :disabled="disabled || isLoading"
        >
          <span class="icon">
            <i class="fas fa-search"></i>
          </span>
          <span>Search</span>
        </button>
      </div>
      <div class="control">
        <button
          class="button"
          @click="showFilters = !showFilters"
          :class="{ 'is-active': showFilters }"
          :disabled="disabled || isLoading"
        >
          <span class="icon">
            <i class="fas fa-filter"></i>
          </span>
          <span>Filters</span>
        </button>
      </div>
    </div>

    <div v-if="showFilters" class="search-filters box mt-3">
      <div class="columns is-multiline">
        <div class="column is-half">
          <div class="field">
            <label class="label">Color</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="filters.color" :disabled="disabled || isLoading">
                  <option value="">Any Color</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <!-- We'll populate this from the API later -->
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label class="label">Category</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="filters.category" :disabled="disabled || isLoading">
                  <option value="">Any Category</option>
                  <option value="brick">Bricks</option>
                  <option value="plate">Plates</option>
                  <option value="tile">Tiles</option>
                  <option value="minifig">Minifigures</option>
                  <option value="baseplate">Baseplates</option>
                  <option value="technic">Technic</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label class="label">Partlist</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="filters.partlist" :disabled="disabled || isLoading">
                  <option value="">Any Partlist</option>
                  <option v-for="list in userPartlists" :key="list.id" :value="list.id">
                    {{ list.name }} - {{ list.numParts }} parts
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label class="label">Year</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="filters.year" :disabled="disabled || isLoading">
                  <option value="">Any Year</option>
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label class="label">Sort By</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="filters.sortBy" :disabled="disabled || isLoading">
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="year">Year</option>
                  <option value="partCount">Part Count</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-grouped is-grouped-right">
        <div class="control">
          <button class="button is-light" @click="resetFilters" :disabled="disabled || isLoading">
            Reset Filters
          </button>
        </div>
        <div class="control">
          <button class="button is-primary" @click="applyFilters" :disabled="disabled || isLoading">
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="notification is-danger mt-3">
      <button class="delete" @click="error = null"></button>
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRebrickableStore } from '../stores/rebrickable'
import { useToastStore } from '../stores/toast'

export default {
  name: 'BrickSearch',
  emits: ['search'],

  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const rebrickableStore = useRebrickableStore()
    const toastStore = useToastStore()
    const searchQuery = ref('')
    const isLoading = ref(false)
    const showFilters = ref(false)
    const error = ref(null)

    // Get user partlists
    const userPartlists = computed(() => rebrickableStore.userPartlists)

    // Generate years from 1950 to current year
    const currentYear = new Date().getFullYear()
    const years = computed(() => {
      const years = []
      for (let year = currentYear; year >= 1950; year--) {
        years.push(year)
      }
      return years
    })

    const filters = reactive({
      color: '',
      category: '',
      partlist: '',
      year: '',
      sortBy: 'relevance'
    })

    const resetFilters = () => {
      filters.color = ''
      filters.category = ''
      filters.partlist = ''
      filters.year = ''
      filters.sortBy = 'relevance'
    }

    const handleSearch = async () => {
      if (!searchQuery.value.trim()) {
        error.value = 'Please enter a search term'
        return
      }

      isLoading.value = true
      error.value = null

      try {
        // Hide filters if they're open
        if (showFilters.value) {
          showFilters.value = false
        }

        // Include filters in the search
        const results = await rebrickableStore.searchBricks(searchQuery.value.trim(), filters)
        if (results && Array.isArray(results)) {
          emit('search', {
            query: searchQuery.value.trim(),
            filters: { ...filters },
            results
          })
        } else {
          throw new Error('Invalid search results format')
        }
      } catch (err) {
        error.value = 'An error occurred while searching. Please try again.'
        toastStore.showToast('Failed to search for bricks', 'danger')
        emit('search', {
          query: searchQuery.value.trim(),
          filters: { ...filters },
          results: []
        })
      } finally {
        isLoading.value = false
      }
    }

    const applyFilters = () => {
      handleSearch()
    }

    // Load user partlists on mount if authenticated
    onMounted(async () => {
      if (rebrickableStore.hasApiKey) {
        await rebrickableStore.fetchUserPartlists()
      }
    })

    return {
      searchQuery,
      isLoading,
      showFilters,
      filters,
      error,
      years,
      userPartlists,
      handleSearch,
      resetFilters,
      applyFilters
    }
  }
}
</script>

<style scoped>
.brick-search {
  max-width: 960px;
  margin: 0 auto;
}

.search-filters {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field:not(:last-child) {
  margin-bottom: 1rem;
}

.notification {
  margin-top: 1rem;
}

.button.is-active {
  background-color: #f5f5f5;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .field.has-addons {
    flex-wrap: wrap;
  }

  .field.has-addons .control {
    margin-right: 0;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .field.has-addons .control:last-child {
    margin-bottom: 0;
  }

  .field.has-addons .button {
    width: 100%;
  }
}
</style>
