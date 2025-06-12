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
          :disabled="isLoading"
        />
      </div>
      <div class="control">
        <button
          class="button is-primary"
          @click="handleSearch"
          :class="{ 'is-loading': isLoading }"
          :disabled="isLoading"
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
                <select v-model="filters.color">
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
                <select v-model="filters.category">
                  <option value="">Any Category</option>
                  <option value="brick">Bricks</option>
                  <option value="plate">Plates</option>
                  <option value="tile">Tiles</option>
                  <!-- We'll populate this from the API later -->
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
                <select v-model="filters.year">
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
                <select v-model="filters.sortBy">
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
          <button class="button is-light" @click="resetFilters" :disabled="isLoading">
            Reset Filters
          </button>
        </div>
        <div class="control">
          <button class="button is-primary" @click="applyFilters" :disabled="isLoading">
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

export default {
  name: 'BrickSearch',
  emits: ['search'],

  setup(props, { emit }) {
    const searchQuery = ref('')
    const isLoading = ref(false)
    const showFilters = ref(false)
    const error = ref(null)

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
      year: '',
      sortBy: 'relevance'
    })

    const resetFilters = () => {
      filters.color = ''
      filters.category = ''
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
        // Emit search event with query and filters
        emit('search', {
          query: searchQuery.value.trim(),
          filters: { ...filters }
        })
      } catch (err) {
        error.value = 'An error occurred while searching. Please try again.'
        console.error('Search error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const applyFilters = () => {
      handleSearch()
    }

    return {
      searchQuery,
      isLoading,
      showFilters,
      filters,
      error,
      years,
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

  .field.has-addons .control:not(:last-child) {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .field.has-addons .control {
    flex: 1 1 100%;
  }

  .field.has-addons .button {
    width: 100%;
  }
}
</style>
