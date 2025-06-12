export const authConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scope:
    'email profile openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
}

export const AUTH_COOKIE_NAME = 'lego_app_session'
export const AUTH_COOKIE_EXPIRY = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
