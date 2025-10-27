// Small API helper to manage Authorization token and provide a fetch wrapper.
// Added refresh-token support and automatic retry on 401 using a refresh endpoint.

const TOKEN_KEY = 'sh_token'
const REFRESH_KEY = 'sh_refresh'

// Configure this to match your backend refresh endpoint. It should accept a POST with the refresh token
// and return a JSON payload containing a new access token (access_token) and optionally a new refresh_token.
const REFRESH_URL = 'https://api.sweethotel.kodopo.tech/api/Auth/Refresh'

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function setRefreshToken(r) {
  if (r) localStorage.setItem(REFRESH_KEY, r)
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

function clearRefreshToken() {
  localStorage.removeItem(REFRESH_KEY)
}

let isRefreshing = false
let refreshPromise = null
let onAuthFailure = null

function setOnAuthFailure(fn) {
  onAuthFailure = fn
}

async function doRefresh() {
  // Avoid multiple parallel refresh calls
  if (isRefreshing) return refreshPromise
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(REFRESH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let message = `Refresh failed (${res.status})`
        try {
          const json = JSON.parse(text)
          message = json?.message || json?.error || message
        } catch (e) {
          if (text) message = text
        }
        throw new Error(message)
      }
      const data = await res.json()
      // Expecting { access_token, refresh_token? }
      if (data.access_token) setToken(data.access_token)
      if (data.refresh_token) setRefreshToken(data.refresh_token)
      return data
    } finally {
      isRefreshing = false
    }
  })()
  return refreshPromise
}

async function request(input, init = {}, retry = true) {
  const token = getToken()
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(input, { ...init, headers })

  if (res.status === 401 && retry) {
    // try refreshing the token and retry once
    try {
      await doRefresh()
      // retry original request with new token
      const newToken = getToken()
      const retryHeaders = new Headers(init.headers || {})
      if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`)
      if (!retryHeaders.has('Content-Type') && !(init.body instanceof FormData)) {
        retryHeaders.set('Content-Type', 'application/json')
      }
      const retryRes = await fetch(input, { ...init, headers: retryHeaders })
      if (!retryRes.ok) {
        const text = await retryRes.text().catch(() => '')
        let message = `Request failed (${retryRes.status})`
        try {
          const json = JSON.parse(text)
          message = json?.message || json?.error || message
        } catch (e) {
          if (text) message = text
        }
        const err = new Error(message)
        err.status = retryRes.status
        throw err
      }
      const ct = retryRes.headers.get('content-type') || ''
      if (ct.includes('application/json')) return retryRes.json()
      return retryRes.text()
    } catch (err) {
      // refresh failed -> call optional handler, clear tokens and rethrow
      try { if (typeof onAuthFailure === 'function') onAuthFailure() } catch (e) {}
      clearToken()
      clearRefreshToken()
      throw err
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = `Request failed (${res.status})`
    try {
      const json = JSON.parse(text)
      message = json?.message || json?.error || message
    } catch (e) {
      if (text) message = text
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  // try to parse json, otherwise return text
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export default { setToken, getToken, clearToken, setRefreshToken, getRefreshToken, clearRefreshToken, request, setOnAuthFailure }
