<template>
  <div class="home container">
    <section class="hero is-primary is-bold mb-6">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Welcome to My Lego App</h1>
          <p class="subtitle">Search through millions of LEGO bricks and sets</p>
        </div>
      </div>
    </section>

    <div class="content has-text-centered mb-6">
      <p class="is-size-5">
        Find the perfect LEGO brick for your collection. Search by name, color, category, or year.
      </p>
    </div>

    <BrickSearch @search="handleSearch" />

    <!-- Loading state -->
    <div v-if="isSearching" class="has-text-centered mt-6">
      <span class="icon is-large">
        <i class="fas fa-spinner fa-pulse fa-2x"></i>
      </span>
      <p class="mt-2">Searching for bricks...</p>
    </div>

    <!-- Search results -->
    <div v-else-if="searchResults.length > 0" class="mt-6">
      <h2 class="title is-4 mb-4">Search Results</h2>
      <div class="columns is-multiline">
        <div v-for="result in searchResults" :key="result.id" class="column is-3">
          <div class="card">
            <div class="card-image">
              <figure class="image is-square">
                <img
                  :src="result.image_url"
                  :alt="result.name"
                  @error="handleImageError"
                  class="has-background-light"
                />
              </figure>
            </div>
            <div class="card-content">
              <p class="title is-6">{{ result.name }}</p>
              <p class="subtitle is-7">ID: {{ result.id }}</p>
              <div class="buttons">
                <a
                  :href="result.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="button is-small is-primary is-light"
                >
                  <span class="icon">
                    <i class="fas fa-external-link-alt"></i>
                  </span>
                  <span>View Details</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No results state -->
    <div v-else-if="hasSearched" class="has-text-centered mt-6">
      <span class="icon is-large">
        <i class="fas fa-search fa-2x"></i>
      </span>
      <p class="mt-2">No results found. Try adjusting your search terms or filters.</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import BrickSearch from '../components/BrickSearch.vue'

export default {
  name: 'HomeView',
  components: {
    BrickSearch
  },

  setup() {
    const isSearching = ref(false)
    const searchResults = ref([])
    const hasSearched = ref(false)

    const handleSearch = async searchData => {
      isSearching.value = true
      hasSearched.value = true
      try {
        console.log('Searching with:', searchData)
        // TODO: Replace with actual API call
        // Simulating API response for now
        await new Promise(resolve => setTimeout(resolve, 1000))
        searchResults.value = [
          {
            id: '3001',
            name: '2 x 4 Brick',
            image_url: 'https://cdn.rebrickable.com/media/parts/elements/300126.jpg',
            url: 'https://rebrickable.com/parts/3001'
          },
          {
            id: '3002',
            name: '2 x 3 Brick',
            image_url: 'https://cdn.rebrickable.com/media/parts/elements/300226.jpg',
            url: 'https://rebrickable.com/parts/3002'
          },
          {
            id: '3003',
            name: '2 x 2 Brick',
            image_url: 'https://cdn.rebrickable.com/media/parts/elements/300326.jpg',
            url: 'https://rebrickable.com/parts/3003'
          },
          {
            id: '3004',
            name: '1 x 2 Brick',
            image_url: 'https://cdn.rebrickable.com/media/parts/elements/300426.jpg',
            url: 'https://rebrickable.com/parts/3004'
          }
        ]
      } catch (error) {
        console.error('Search failed:', error)
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }

    const handleImageError = event => {
      // Replace failed image loads with a placeholder
      event.target.src = 'https://via.placeholder.com/200x200?text=No+Image'
    }

    return {
      isSearching,
      searchResults,
      hasSearched,
      handleSearch,
      handleImageError
    }
  }
}
</script>

<style scoped>
.home {
  padding-bottom: 2rem;
}

.hero.is-primary.is-bold {
  background: linear-gradient(141deg, #00d1b2 0%, #00c4a7 71%, #00b89c 100%);
}

.hero-body {
  padding: 3rem 1.5rem;
}

.content p {
  color: #4a4a4a;
}

/* Loading spinner animation */
@keyframes spinAround {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

.icon.is-large {
  height: 3rem;
  width: 3rem;
}

.icon.is-large i {
  font-size: 3rem;
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-content .buttons {
  margin-top: auto;
}

.image.is-square {
  background-color: #f5f5f5;
}

.image.is-square img {
  object-fit: contain;
  padding: 1rem;
}
</style>
