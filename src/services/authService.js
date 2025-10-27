// Auth service calling the real API endpoint provided.
// Exports login that returns { access_token, token_type, expires_in, refresh_token, scope }
// and also a parsed `user` object (if API includes user claims in token or response).
import api from './api'

const LOGIN_URL = 'https://api.sweethotel.kodopo.tech/api/Auth/Login'

export async function login({ email, password }) {
  const body = { email, password }

  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = `Login failed (${res.status})`
    try {
      const json = JSON.parse(text)
      message = json?.message || json?.error || message
    } catch (e) {
      if (text) message = text
    }
    throw new Error(message)
  }

  const data = await res.json()

  // data expected shape (from your example): { token_type, access_token, expires_in, refresh_token, scope }
  const token = data.access_token
  if (token) api.setToken(token)
  if (data.refresh_token) api.setRefreshToken(data.refresh_token)

  // Attempt to extract user info from token claims if present
  let user = null
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    user = {
      id: decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded?.sub,
      email: decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded?.email,
      name: decoded?.FullName || decoded?.name || decoded?.given_name,
      role: decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded?.role || data.scope,
    }
  } catch (e) {
    // ignore decode errors
  }

  return { ...data, user }
}

export function logout() {
  api.clearToken()
  // also clear refresh token and stored user info (OAuth2 logout cleanup)
  if (api.clearRefreshToken) api.clearRefreshToken()
  try { localStorage.removeItem('sh_user') } catch (e) {}
}
