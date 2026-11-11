import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import api from '../src/api'
import { AuthProvider, useAuth } from '../src/auth/AuthContext'
import ProtectedRoute from '../src/components/common/ProtectedRoute'
import { deferred, jwt, profile } from './fixtures'

beforeEach(() => { vi.spyOn(api, 'get') })

test('a stored token is not authenticated until the server verifies its profile', async () => {
  const pending = deferred()
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockReturnValue(pending.promise)
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  expect(result.current.isAuthenticated).toBe(false)
  expect(result.current.user).toBe(null)
  await act(async () => pending.resolve({ data: profile }))
  expect(result.current.isAuthenticated).toBe(true)
  expect(result.current.user.email).toBe(profile.email)
})

test('late profile success after logout cannot restore the old user', async () => {
  const pending = deferred()
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockReturnValue(pending.promise)
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  act(() => result.current.logout())
  await act(async () => pending.resolve({ data: profile }))
  expect(result.current.user).toBe(null)
  expect(result.current.token).toBe(null)
  expect(sessionStorage.getItem('seatify_token')).toBe(null)
})

test.each(['resolve', 'reject'])('an old profile %s cannot overwrite a newer login', async (outcome) => {
  const old = deferred()
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ data: { ...profile, email: 'new@example.com' } })
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  const token = jwt('new@example.com')
  await act(async () => { await result.current.login(token) })
  await act(async () => {
    if (outcome === 'resolve') old.resolve({ data: profile })
    else old.reject({ response: { status: 401 } })
  })
  expect(result.current.user.email).toBe('new@example.com')
  expect(result.current.token).toBe(token)
  expect(result.current.isAuthenticated).toBe(true)
})

test.each([undefined, 503])('temporary profile failure (%s) retains JWT and safely retries', async (status) => {
  const token = jwt()
  sessionStorage.setItem('seatify_token', token)
  api.get.mockRejectedValueOnce(status ? { response: { status } } : new Error('offline'))
    .mockResolvedValueOnce({ data: profile })
  render(<AuthProvider><MemoryRouter><ProtectedRoute requireAdmin={false}><p>Private booking</p></ProtectedRoute></MemoryRouter></AuthProvider>)
  await screen.findByRole('button', { name: 'Retry session' })
  expect(sessionStorage.getItem('seatify_token')).toBe(token)
  expect(screen.queryByText('Private booking')).toBe(null)
  fireEvent.click(screen.getByRole('button', { name: 'Retry session' }))
  await screen.findByText('Private booking')
})

test('a current profile 401 ends the session', async () => {
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockRejectedValue({ response: { status: 401 } })
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  await act(async () => {})
  expect(result.current.token).toBe(null)
  expect(result.current.isAuthenticated).toBe(false)
})

test('expired or malformed JWTs never authenticate or request a profile', async () => {
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  await expect(result.current.login(jwt('test@example.com', -1))).rejects.toThrow('invalid or expired')
  await expect(result.current.login('not-a-token')).rejects.toThrow('invalid or expired')
  expect(api.get).not.toHaveBeenCalled()
  expect(result.current.isAuthenticated).toBe(false)
})

test('session expiry clears authentication while the app is open', async () => {
  vi.useFakeTimers()
  api.get.mockResolvedValue({ data: profile })
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  await act(async () => { await result.current.login(jwt('test@example.com', 2)) })
  expect(result.current.isAuthenticated).toBe(true)
  await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
  expect(result.current.isAuthenticated).toBe(false)
  expect(sessionStorage.getItem('seatify_token')).toBe(null)
})

test('StrictMode cancels the first bootstrap and ignores its late response', async () => {
  const old = deferred(), current = deferred()
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
  const { result } = renderHook(useAuth, { wrapper: AuthProvider, reactStrictMode: true })
  expect(api.get).toHaveBeenCalledTimes(2)
  await act(async () => current.resolve({ data: profile }))
  await act(async () => old.resolve({ data: { ...profile, email: 'stale@example.com' } }))
  expect(result.current.user.email).toBe(profile.email)
})

test('a verified USER cannot open an admin protected route', async () => {
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockResolvedValue({ data: profile })
  render(<AuthProvider><MemoryRouter><ProtectedRoute><p>Admin secret</p></ProtectedRoute></MemoryRouter></AuthProvider>)
  await act(async () => {})
  expect(screen.queryByText('Admin secret')).toBe(null)
})

test('a verified ADMIN retains access to admin routes', async () => {
  sessionStorage.setItem('seatify_token', jwt())
  api.get.mockResolvedValue({ data: { ...profile, role: 'ROLE_ADMIN' } })
  render(<AuthProvider><MemoryRouter><ProtectedRoute><p>Admin management</p></ProtectedRoute></MemoryRouter></AuthProvider>)
  await screen.findByText('Admin management')
})

test('an expired stored token is discarded without contacting the backend', () => {
  sessionStorage.setItem('seatify_token', jwt('test@example.com', -1))
  const { result } = renderHook(useAuth, { wrapper: AuthProvider })
  expect(result.current.isAuthenticated).toBe(false)
  expect(sessionStorage.getItem('seatify_token')).toBe(null)
  expect(api.get).not.toHaveBeenCalled()
})
