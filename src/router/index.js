import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOnboardingStore } from '../stores/onboarding'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/sets',
    name: 'sets',
    component: () => import('../views/SetsView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const onboardingStore = useOnboardingStore()

  // Load user from cookie if not already loaded
  if (!authStore.isAuthenticated) {
    authStore.loadUserFromCookie()
  }

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'home' })
      return
    }

    // Check onboarding status for routes that require it
    if (
      to.matched.some(record => record.meta.requiresOnboarding) &&
      !onboardingStore.isOnboardingComplete
    ) {
      // Only redirect if not already going to profile
      if (to.name !== 'profile') {
        next({
          name: 'profile',
          query: { onboarding: 'true' },
          params: { intended: to.fullPath }
        })
        return
      }
    }
  }

  next()
})

export default router
