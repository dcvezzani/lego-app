<template>
  <div class="profile-view container">
    <div v-if="isOnboarding" class="notification is-info">
      <button class="delete" @click="dismissOnboarding"></button>
      <p class="title is-4">Welcome to My Lego App!</p>
      <p>To get started, please complete your profile setup:</p>
      <ol class="mt-2">
        <li>Enter a screen name that will be displayed to other users</li>
        <li>Add your Rebrickable API key to access your LEGO collection</li>
      </ol>
    </div>

    <h1 class="title">Profile</h1>

    <div v-if="isAuthenticated" class="box">
      <div class="columns">
        <div class="column is-one-quarter">
          <div class="mb-4">
            <Avatar
              :imageUrl="user?.imageUrl"
              :screenName="user?.screen_name"
              :email="user?.email"
              :size="128"
            />
          </div>
        </div>

        <div class="column">
          <form @submit.prevent="handleSubmit">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input class="input" type="text" :value="user?.name" disabled />
              </div>
            </div>

            <div class="field">
              <label class="label">Email</label>
              <div class="control">
                <input class="input" type="email" :value="user?.email" disabled />
              </div>
            </div>

            <div class="field">
              <label class="label">Screen Name</label>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  v-model="formData.screen_name"
                  placeholder="Enter your screen name"
                  :class="{ 'is-danger': v$.screen_name.$error }"
                />
              </div>
              <p class="help is-danger" v-if="v$.screen_name.$error">
                {{ v$.screen_name.$errors[0].$message }}
              </p>
            </div>

            <div class="field">
              <label class="label">Rebrickable API Key</label>
              <div class="control">
                <input
                  class="input"
                  type="password"
                  v-model="formData.rebrickable_api_key"
                  placeholder="Enter your Rebrickable API key"
                  :class="{ 'is-danger': v$.rebrickable_api_key.$error }"
                />
              </div>
              <p class="help is-danger" v-if="v$.rebrickable_api_key.$error">
                {{ v$.rebrickable_api_key.$errors[0].$message }}
              </p>
              <p class="help">
                You can find your API key in your
                <a href="https://rebrickable.com/users/profile/" target="_blank" rel="noopener">
                  Rebrickable profile
                </a>
              </p>
            </div>

            <div class="field">
              <label class="label">Rebrickable User Token</label>
              <div class="control">
                <input
                  class="input"
                  type="password"
                  v-model="formData.rebrickable_user_token"
                  placeholder="Enter your Rebrickable user token"
                  :class="{ 'is-danger': v$.rebrickable_user_token.$error }"
                />
              </div>
              <p class="help is-danger" v-if="v$.rebrickable_user_token.$error">
                {{ v$.rebrickable_user_token.$errors[0].$message }}
              </p>
              <p class="help">
                You can find your user token in your
                <a href="https://rebrickable.com/users/profile/" target="_blank" rel="noopener">
                  Rebrickable profile
                </a>
              </p>
            </div>

            <div class="field">
              <div class="control">
                <button
                  class="button is-primary"
                  type="submit"
                  :class="{ 'is-loading': isSubmitting }"
                  :disabled="isSubmitting"
                >
                  {{ isOnboarding ? 'Complete Setup' : 'Save Changes' }}
                </button>
                <button
                  v-if="isOnboarding"
                  type="button"
                  class="button ml-2"
                  @click="handleCancel"
                  :disabled="isSubmitting"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-else class="notification is-warning">Please sign in to view your profile.</div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import { useAuthStore } from '../stores/auth'
import { useOnboardingStore } from '../stores/onboarding'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength } from '@vuelidate/validators'
import { updateUserProfile } from '../services/api'
import { useToastStore } from '../stores/toast'

export default {
  name: 'ProfileView',
  components: {
    Avatar
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const onboardingStore = useOnboardingStore()
    const toastStore = useToastStore()
    const { user, isAuthenticated } = storeToRefs(authStore)
    const isSubmitting = ref(false)
    const showOnboardingMessage = ref(true)

    const isOnboarding = computed(
      () => route.query.onboarding === 'true' && showOnboardingMessage.value
    )
    const intendedRoute = computed(() => route.params.intended || { name: 'sets' })

    const formData = reactive({
      screen_name: '',
      rebrickable_api_key: '',
      rebrickable_user_token: ''
    })

    // Watch for changes to user data and update form
    watch(
      () => user.value,
      newUser => {
        if (newUser) {
          formData.screen_name = newUser.screen_name || ''
          formData.rebrickable_api_key = newUser.rebrickable_api_key || ''
          formData.rebrickable_user_token = newUser.rebrickable_user_token || ''
        }
      },
      { immediate: true }
    )

    const rules = {
      screen_name: {
        required,
        minLength: minLength(3)
      },
      rebrickable_api_key: { required },
      rebrickable_user_token: { required }
    }

    const v$ = useVuelidate(rules, formData)

    function dismissOnboarding() {
      showOnboardingMessage.value = false
    }

    async function handleSubmit() {
      const isValid = await v$.value.$validate()
      if (!isValid) return

      isSubmitting.value = true
      try {
        // Prepare the update data
        const updateData = {
          screen_name: formData.screen_name.trim(),
          rebrickable_api_key: formData.rebrickable_api_key.trim(),
          rebrickable_user_token: formData.rebrickable_user_token.trim()
        }

        // Call the API to update the profile
        const response = await updateUserProfile(user.value.id, updateData)

        if (!response.success) {
          throw new Error(response.error || 'Failed to update profile')
        }

        // Update local user state with the new data
        authStore.setUser({
          ...user.value,
          screen_name: updateData.screen_name,
          rebrickable_api_key: updateData.rebrickable_api_key,
          rebrickable_user_token: updateData.rebrickable_user_token
        })

        const message = isOnboarding.value
          ? 'Profile setup completed successfully!'
          : 'Profile updated successfully!'

        toastStore.showToast(message, 'success')

        // If this was part of onboarding, redirect to the intended route
        if (isOnboarding.value) {
          router.push(intendedRoute.value)
        }
      } catch (error) {
        console.error('Failed to update profile:', error)
        toastStore.showToast(
          error.message || 'Failed to update profile. Please try again.',
          'danger'
        )
      } finally {
        isSubmitting.value = false
      }
    }

    function handleCancel() {
      authStore.clearUser() // End the session
      router.push('/') // Return to home
    }

    return {
      user,
      isAuthenticated,
      formData,
      v$,
      isSubmitting,
      isOnboarding,
      handleSubmit,
      handleCancel,
      dismissOnboarding
    }
  }
}
</script>

<style scoped>
.profile-view {
  padding: 2rem 1rem;
  max-width: 960px;
  margin: 0 auto;
}

.notification {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(10, 10, 10, 0.1);
}

.notification ol {
  margin: 1rem 0 0.5rem 1.5rem;
  line-height: 1.6;
}

.notification ol li {
  margin-bottom: 0.5rem;
}

.box {
  border-radius: 8px;
  background-color: white;
}

.title {
  color: #363636;
  margin-bottom: 2rem;
}

.columns {
  margin-top: 1rem;
}

.column.is-one-quarter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.field {
  width: 100%;
}

.help {
  transition: all 0.3s ease;
}

.help a {
  text-decoration: underline;
}

.button {
  height: 2.75rem;
  padding: 0 1.5rem;
}
</style>
