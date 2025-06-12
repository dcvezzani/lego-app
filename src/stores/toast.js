import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),

  actions: {
    showToast(message, type = 'info', duration = 5000) {
      const id = Date.now()
      this.toasts.push({
        id,
        message,
        type: `is-${type}`,
        duration
      })

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }
    },

    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    // Convenience methods for different toast types
    success(message, duration) {
      this.showToast(message, 'success', duration)
    },

    error(message, duration) {
      this.showToast(message, 'danger', duration)
    },

    info(message, duration) {
      this.showToast(message, 'info', duration)
    },

    warning(message, duration) {
      this.showToast(message, 'warning', duration)
    }
  }
})
