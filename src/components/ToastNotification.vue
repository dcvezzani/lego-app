<template>
  <transition-group name="toast-list" tag="div" class="toast-container">
    <div v-for="toast in toasts" :key="toast.id" class="notification" :class="toast.type">
      <button class="delete" @click="removeToast(toast.id)"></button>
      {{ toast.message }}
    </div>
  </transition-group>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ToastNotification',
  setup() {
    const toasts = ref([])
    let nextId = 0

    const addToast = (message, type = 'is-info', duration = 5000) => {
      const id = nextId++
      const toast = {
        id,
        message,
        type: `is-${type}`
      }

      toasts.value.push(toast)

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    }

    const removeToast = id => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) {
        toasts.value.splice(index, 1)
      }
    }

    return {
      toasts,
      addToast,
      removeToast
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
}

.notification {
  margin-bottom: 0.5rem;
  padding-right: 2rem;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
