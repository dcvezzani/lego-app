<template>
  <div class="search-view">
    <section class="section">
      <div class="container">
        <h1 class="title">Search Lego Bricks</h1>
        <BrickSearch />
      </div>
    </section>
  </div>
</template>

<script>
import BrickSearch from '@/components/BrickSearch.vue'

export default {
  name: 'SearchView',
  components: {
    BrickSearch
  }
}
</script>

<style scoped>
.search-view {
  padding-top: 1rem;
}
</style> 