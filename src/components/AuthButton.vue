<template>
  <div class="auth-button">
    <button v-if="!isAuthenticated" class="button is-primary" @click="handleSignIn">
      <span class="icon">
        <i class="fab fa-google"></i>
      </span>
      <span>Sign in with Google</span>
    </button>

    <div v-else class="dropdown is-hoverable">
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <div class="mr-2">
            <Avatar
              :imageUrl="user?.imageUrl"
              :screenName="user?.screen_name"
              :email="user?.email"
              :size="24"
            />
          </div>
          <span>{{ user?.name || 'User' }}</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down"></i>
          </span>
        </button>
      </div>

      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <router-link to="/profile" class="dropdown-item">
            <span class="icon">
              <i class="fas fa-user"></i>
            </span>
            <span>Profile</span>
          </router-link>
          <hr class="dropdown-divider" />
          <a class="dropdown-item" @click="handleSignOut">
            <span class="icon">
              <i class="fas fa-sign-out-alt"></i>
            </span>
            <span>Sign out</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { signIn, signOut, initializeGoogleAuth } from '../services/auth'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Avatar from './Avatar.vue'

export default {
  name: 'AuthButton',
  components: {
    Avatar
  },
  setup() {
    const authStore = useAuthStore()
    const { user, isAuthenticated } = storeToRefs(authStore)

    onMounted(async () => {
      try {
        await initializeGoogleAuth()
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error)
      }
    })

    async function handleSignIn() {
      try {
        await signIn()
      } catch (error) {
        console.error('Sign in failed:', error)
      }
    }

    async function handleSignOut() {
      try {
        await signOut()
      } catch (error) {
        console.error('Sign out failed:', error)
      }
    }

    return {
      user,
      isAuthenticated,
      handleSignIn,
      handleSignOut
    }
  }
}
</script>

<style scoped>
.auth-button {
  margin: 0 1rem;
}


</style>
