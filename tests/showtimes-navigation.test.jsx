import { fireEvent, render, screen, within, act } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import Showtimes from '../src/components/pages/Showtimes'
import Home, { Header } from '../src/components/pages/Home'
import ScrollToTop from '../src/components/common/ScrollToTop'
import * as service from '../src/services/seatify'
import { movie, profile, show } from './fixtures'

const auth = vi.hoisted(() => ({ user: null, isAuthenticated: false, isAdmin: false, logout: vi.fn() }))
vi.mock('../src/auth/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../src/services/seatify', async (original) => ({
  ...await original(), fetchMovie: vi.fn(), fetchShowtimesByMovie: vi.fn(), fetchMovies: vi.fn(), fetchTheatres: vi.fn(),
}))

function mountShowtimes() {
  const router = createMemoryRouter([{ path: '/movie/:id/showtimes', element: <Showtimes/> }], { initialEntries: ['/movie/7/showtimes'] })
  render(<RouterProvider router={router}/>)
  return router
}
function selectMumbai() {
  fireEvent.click(within(screen.getByText('Mumbai Cinema').closest('article')).getByRole('button', { name: /6:45 PM/ }))
}
beforeEach(() => {
  auth.user = null; auth.isAuthenticated = false
  service.fetchMovie.mockResolvedValue(movie)
  service.fetchShowtimesByMovie.mockResolvedValue([show, { ...show, id: 43, theatreId: 4, theatreName: 'Delhi Cinema', theatreCity: 'Delhi', language: 'English', format: '3D', ticketPrice: 350, startTime: '23:00:00', availableSeats: 1 }])
  service.fetchMovies.mockResolvedValue([])
  service.fetchTheatres.mockResolvedValue([])
})

test.each([
  ['Language', 'English'], ['Format', '3D'], ['Price range', '₹300+'],
  ['Preferred time', 'Night'], ['Availability', 'Fast filling'],
])('changing %s removes a hidden show from the booking bar', async (label, value) => {
  mountShowtimes()
  await screen.findByText('Mumbai Cinema')
  selectMumbai()
  expect(screen.getByRole('link', { name: /Select Seats/ }).getAttribute('href')).toContain('/42/seats')
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
  expect(screen.queryByRole('link', { name: /Select Seats/ })).toBe(null)
})

test('quick filters clear the show selection', async () => {
  mountShowtimes(); await screen.findByText('Mumbai Cinema'); selectMumbai()
  fireEvent.click(screen.getByRole('button', { name: /Late night/ }))
  expect(screen.queryByRole('link', { name: /Select Seats/ })).toBe(null)
})

test('header and listing city selectors share state and clear selection', async () => {
  mountShowtimes(); await screen.findByText('Mumbai Cinema'); selectMumbai()
  fireEvent.change(screen.getByLabelText('Choose city'), { target: { value: 'Delhi' } })
  expect(screen.queryByText('Mumbai Cinema')).toBe(null)
  expect(screen.getByLabelText('City').value).toBe('Delhi')
  expect(screen.queryByRole('link', { name: /Select Seats/ })).toBe(null)
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Mumbai' } })
  expect(screen.getByLabelText('Choose city').value).toBe('Mumbai')
  expect(screen.queryByText('Delhi Cinema')).toBe(null)
})

test.each([['Movies', 'movies'], ['Theatres', 'theatres'], ['Offers', 'offers']])('shared %s link navigates home and scrolls to its section', async (name, hash) => {
  const router = createMemoryRouter([
    { path: '/movie/:id', element: <><ScrollToTop/><Header query="" setQuery={() => {}}/></> },
    { path: '/', element: <><ScrollToTop/><Home/></> },
  ], { initialEntries: ['/movie/7'] })
  render(<RouterProvider router={router}/>)
  await act(async () => fireEvent.click(screen.getByRole('link', { name })))
  expect(router.state.location.pathname).toBe('/')
  expect(router.state.location.hash).toBe('#' + hash)
  expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
})

test('header does not show an account for an unverified user', () => {
  auth.user = profile
  const router = createMemoryRouter([{ path: '/', element: <Header query="" setQuery={() => {}}/> }])
  render(<RouterProvider router={router}/>)
  expect(screen.getByRole('link', { name: /Sign in/ })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Test/ })).toBe(null)
})

test('a backend city remains visibly selected when another movie has no shows there', async () => {
  service.fetchShowtimesByMovie.mockResolvedValueOnce([{ ...show, theatreCity: 'Coimbatore' }]).mockResolvedValueOnce([])
  const router = mountShowtimes()
  await screen.findByText('Mumbai Cinema')
  fireEvent.change(screen.getByLabelText('Choose city'), { target: { value: 'Coimbatore' } })
  await act(async () => router.navigate('/movie/8/showtimes'))
  await screen.findByRole('heading', { name: 'No upcoming shows for this movie yet' })
  expect(screen.getByLabelText('Choose city').value).toBe('Coimbatore')
})
