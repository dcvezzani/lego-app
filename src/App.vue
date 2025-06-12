<template>
  <div class="app-container">
    <Header />

    <main class="container">
      <router-view />
    </main>

    <Footer />
    <ToastNotification />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    ToastNotification
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      // Load user data from cookie if it exists
      authStore.loadUserFromCookie()
    })
  }
}
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main.container {
  flex: 1;
  padding: 2rem 1.5rem;
}

/* Global styles */
.page-title {
  margin-bottom: 2rem;
}

.card {
  margin-bottom: 1.5rem;
}

.button .icon {
  margin-right: 0.5rem;
}
</style>
