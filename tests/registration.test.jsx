import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import api from '../src/api'
import { AuthProvider } from '../src/auth/AuthContext'
import { getReturnPath } from '../src/auth/returnPath'
import Login from '../src/components/pages/Login'
import Register from '../src/components/pages/Register'
import ProtectedRoute from '../src/components/common/ProtectedRoute'
import { jwt, profile } from './fixtures'

const destination = '/payment?showtimeId=42&seats=A1%2CA2'
function Location() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}
function mount() {
  render(<AuthProvider><MemoryRouter initialEntries={[{ pathname: '/login', state: { from: destination } }]}>
    <Location/><Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/payment" element={<ProtectedRoute requireAdmin={false}><h1>Checkout</h1></ProtectedRoute>}/>
    </Routes>
  </MemoryRouter></AuthProvider>)
}
beforeEach(() => {
  vi.spyOn(api, 'post').mockImplementation(async (url) => ({ data: url === '/users' ? profile : { token: jwt() } }))
  vi.spyOn(api, 'get').mockResolvedValue({ data: profile })
})

test('signup preserves checkout through registration and verified login without a fake signed-in session', async () => {
  const user = userEvent.setup()
  mount()
  await user.click(screen.getByRole('link', { name: 'Sign Up' }))
  await user.type(screen.getByLabelText(/First Name/), 'Test')
  await user.type(screen.getByLabelText(/Last Name/), 'User')
  await user.type(screen.getByLabelText(/Email Address/), profile.email)
  await user.type(screen.getByLabelText(/Phone/), '9876543210')
  await user.type(screen.getByLabelText(/^Password/), 'Testpass1!')
  await user.type(screen.getByLabelText(/Confirm Password/), 'Testpass1!')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /Create Account/ }))
  await screen.findByRole('heading', { name: 'Welcome Back' })
  expect(sessionStorage.getItem('seatify_token')).toBe(null)
  expect(api.get).not.toHaveBeenCalled()
  await user.type(screen.getByLabelText(/Email Address/), profile.email)
  await user.type(screen.getByLabelText(/^Password/), 'Testpass1!')
  await user.click(screen.getByRole('button', { name: /^Sign In/ }))
  await screen.findByRole('heading', { name: 'Checkout' })
  expect(screen.getByTestId('location').textContent).toBe(destination)
})

test('profile retry on login preserves checkout without sending credentials again', async () => {
  api.get.mockRejectedValueOnce({ response: { status: 503 } }).mockResolvedValueOnce({ data: profile })
  mount()
  fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: profile.email } })
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'Testpass1!' } })
  fireEvent.submit(screen.getByRole('button', { name: /^Sign In/ }).closest('form'))
  fireEvent.click(await screen.findByRole('button', { name: 'Retry session' }))
  await screen.findByRole('heading', { name: 'Checkout' })
  expect(api.post).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId('location').textContent).toBe(destination)
})

test.each(['https://outside.example', '//outside.example', '/\\outside.example', null])('rejects unsafe return path %s', (path) => {
  expect(getReturnPath(path)).toBe('/')
})
