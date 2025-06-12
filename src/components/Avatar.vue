<template>
  <div class="avatar" :style="avatarStyle">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="altText"
      class="avatar-image"
      @error="handleImageError"
      :style="{ display: imageError ? 'none' : 'block' }"
    />
    <span
      class="avatar-fallback"
      :class="[colorClass, { 'is-visible': imageError || !imageUrl }]"
      :style="fallbackStyle"
    >
      {{ fallbackText }}
    </span>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Avatar',
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    screenName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 128 // Default size matching ProfileView
    }
  },
  setup(props) {
    const imageError = ref(false)

    // Generate a consistent color class based on the user's identifier
    const generateColorClass = identifier => {
      const colors = ['is-primary', 'is-link', 'is-info', 'is-success', 'is-warning', 'is-danger']

      // Generate a consistent hash from the identifier
      let hash = 0
      for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    }

    const fallbackText = computed(() => {
      if (props.screenName) return props.screenName.charAt(0).toUpperCase()
      if (props.email) return props.email.charAt(0).toUpperCase()
      return '?'
    })

    const identifier = computed(() => props.screenName || props.email || 'default')
    const colorClass = computed(() => generateColorClass(identifier.value))

    const avatarStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`
    }))

    const fallbackStyle = computed(() => ({
      fontSize: `${Math.round(props.size * 0.4)}px`,
      opacity: imageError.value || !props.imageUrl ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out'
    }))

    const altText = computed(() => `Avatar for ${props.screenName || props.email || 'user'}`)

    const handleImageError = () => {
      console.warn(`Failed to load avatar image: ${props.imageUrl}`)
      imageError.value = true
    }

    return {
      imageError,
      fallbackText,
      avatarStyle,
      fallbackStyle,
      altText,
      handleImageError
    }
  }
}
</script>

<style scoped>
.avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(10, 10, 10, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(10, 10, 10, 0.1);
}

.avatar-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0;
  z-index: 2;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.avatar-fallback.is-visible {
  opacity: 1;
}
</style>
