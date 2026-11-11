import { AxiosError } from 'axios'
import { beforeEach, expect, test, vi } from 'vitest'
import api, { setAuthToken, setUnauthorizedHandler } from '../src/api'
import { deferred } from './fixtures'

let pending, config, logout
beforeEach(() => {
  pending = deferred()
  config = null
  logout = vi.fn()
  setAuthToken(null)
  setUnauthorizedHandler(logout)
  api.defaults.adapter = (request) => { config = request; return pending.promise }
})

function unauthorized() {
  pending.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {}, config }))
}

test.each(['new-jwt', 'old-jwt'])('stale 401 cannot clear a newer session, even if JWT is %s', async (newToken) => {
  setAuthToken('old-jwt')
  const request = api.get('/bookings/my').catch((error) => error)
  await vi.waitFor(() => expect(config).not.toBe(null))
  setAuthToken(newToken)
  unauthorized()
  await request
  expect(logout).not.toHaveBeenCalled()
  expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${newToken}`)
})

test('401 belonging to the current session logs out', async () => {
  setAuthToken('current-jwt')
  const request = api.get('/bookings/my').catch((error) => error)
  await vi.waitFor(() => expect(config).not.toBe(null))
  unauthorized()
  await request
  expect(logout).toHaveBeenCalledOnce()
  expect(api.defaults.headers.common.Authorization).toBeUndefined()
})

test('bad login credentials do not invalidate an existing session', async () => {
  setAuthToken('current-jwt')
  const request = api.post('/auth/login', {}, { skipAuth: true }).catch((error) => error)
  await vi.waitFor(() => expect(config).not.toBe(null))
  expect(config.headers.Authorization).toBeUndefined()
  unauthorized()
  await request
  expect(logout).not.toHaveBeenCalled()
})
