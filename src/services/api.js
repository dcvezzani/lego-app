const API_URL = 'http://localhost:3000/api'

export async function createOrUpdateUser(userData) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
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
