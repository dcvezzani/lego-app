import { authConfig } from '../config/auth'
import { useAuthStore } from '../stores/auth'
import { createOrUpdateUser, getUser } from './api'

let googleClient = null

export async function initializeGoogleAuth() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      try {
        googleClient = google.accounts.oauth2.initTokenClient({
          client_id: authConfig.clientId,
          scope: authConfig.scope,
          callback: handleCredentialResponse
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function handleCredentialResponse(response) {
  if (response.access_token) {
    try {
      // Fetch user info using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${response.access_token}`
        }
      })
      const data = await userInfoResponse.json()

      const userData = {
        id: data.sub,
        email: data.email,
        name: data.name,
        imageUrl: data.picture,
        token: response.access_token
      }

      // Create or update user in our database
      await createOrUpdateUser({
        id: userData.id,
        email: userData.email,
        name: userData.name
      })

      // Get full user profile from our database
      const userProfile = await getUser(userData.id)

      // Merge Google data with our database profile
      const fullUserData = {
        ...userData,
        screen_name: userProfile.screen_name,
        rebrickable_api_key: userProfile.rebrickable_api_key
      }

      const authStore = useAuthStore()
      authStore.setUser(fullUserData)
    } catch (error) {
      console.error('Error in credential response:', error)
    }
  }
}

export async function signIn() {
  try {
    if (!googleClient) {
      await initializeGoogleAuth()
    }
    googleClient.requestAccessToken()
  } catch (error) {
    console.error('Google Sign-In Error:', error)
    throw error
  }
}

export async function signOut() {
  try {
    google.accounts.oauth2.revoke(useAuthStore().user?.token, () => {
      const authStore = useAuthStore()
      authStore.clearUser()
    })
  } catch (error) {
    console.error('Google Sign-Out Error:', error)
    const authStore = useAuthStore()
    authStore.clearUser() // Clear local state even if revoke fails
    throw error
  }
}

export function isAuthenticated() {
  const authStore = useAuthStore()
  return authStore.isAuthenticated
}
