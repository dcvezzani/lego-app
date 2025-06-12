<template>
  <header>
    <nav class="navbar is-light" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <span class="icon">
            <i class="fas fa-cubes"></i>
          </span>
          <strong>My Lego App</strong>
        </router-link>

        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="menu"
          aria-expanded="false"
          @click="toggleMenu"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item" @click="closeMenu">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-home"></i>
              </span>
              <span>Home</span>
            </span>
          </router-link>
          <router-link to="/sets" class="navbar-item" @click="closeMenu">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-box-open"></i>
              </span>
              <span>My Sets</span>
            </span>
          </router-link>
          <router-link to="/search" class="navbar-item" @click="closeMenu">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-search"></i>
              </span>
              <span>Search</span>
            </span>
          </router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <AuthButton @login="closeMenu" @logout="closeMenu" />
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref } from 'vue'
import AuthButton from './AuthButton.vue'

export default {
  name: 'Header',
  components: {
    AuthButton
  },
  setup() {
    const isMenuOpen = ref(false)

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }

    const closeMenu = () => {
      isMenuOpen.value = false
    }

    return {
      isMenuOpen,
      toggleMenu,
      closeMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

.icon-text {
  align-items: center;
}

.icon-text .icon {
  margin-right: 0.5rem;
}

@media screen and (max-width: 1023px) {
  .navbar-menu {
    position: absolute;
    width: 100%;
    box-shadow: 0 8px 16px rgba(10, 10, 10, 0.1);
  }
}
</style>
