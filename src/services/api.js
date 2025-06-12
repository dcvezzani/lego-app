import { v4 as uuidv4 } from 'uuid'

const API_URL = 'http://localhost:3000/api'

export async function createOrUpdateUser(userData) {
  // Generate a UUID for new users
  const userWithId = {
    ...userData,
    id: userData.id || uuidv4()
  }

  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userWithId)
  })
  return response.json()
}

export async function getUser(userId) {
  const response = await fetch(`${API_URL}/users/${userId}`)
  return response.json()
}

export async function updateUserProfile(userId, profileData) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  })
  return response.json()
}
