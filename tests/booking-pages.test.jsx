import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import MovieDetails from '../src/components/pages/MovieDetails'
import BookingConfirmation from '../src/components/pages/BookingConfirmation'
import SeatSelection from '../src/components/pages/SeatSelection'
import Payment from '../src/components/pages/Payment'
import * as service from '../src/services/seatify'
import { booking, deferred, movie, profile, seatMap, show } from './fixtures'

vi.mock('../src/auth/AuthContext', () => ({ useAuth: () => ({ user: profile, isAuthenticated: true, isAdmin: false, logout() {} }) }))
vi.mock('../src/services/seatify', async (original) => ({
  ...await original(), fetchMovie: vi.fn(), fetchShowtimesByMovie: vi.fn(), fetchBooking: vi.fn(), fetchShowtime: vi.fn(), fetchSeatMap: vi.fn(), createBooking: vi.fn(),
}))
function mount(path) {
  const router = createMemoryRouter([
    { path: '/movie/:id', element: <MovieDetails/> },
    { path: '/bookings/:bookingId', element: <BookingConfirmation/> },
    { path: '/movie/:id/showtimes/:showId/seats', element: <SeatSelection/> },
    { path: '/payment', element: <Payment/> },
    { path: '/elsewhere', element: <h1>Elsewhere</h1> },
  ], { initialEntries: [path] })
  render(<RouterProvider router={router}/>)
  return router
}
beforeEach(() => {
  service.fetchMovie.mockReset().mockResolvedValue(movie)
  service.fetchShowtimesByMovie.mockReset().mockResolvedValue([show])
  service.fetchBooking.mockReset().mockResolvedValue(booking)
  service.fetchShowtime.mockReset().mockResolvedValue(show)
  service.fetchSeatMap.mockReset().mockResolvedValue(seatMap)
  service.createBooking.mockReset().mockResolvedValue(booking)
})

test('an invalid movie ID cannot display the previous movie', async () => {
  const router = mount('/movie/7')
  await screen.findByRole('heading', { name: movie.title })
  await act(async () => router.navigate('/movie/invalid'))
  expect(screen.getByRole('heading', { name: 'Movie not found' })).toBeTruthy()
  expect(screen.queryByRole('heading', { name: movie.title })).toBe(null)
})

test('late movie details and formats cannot overwrite a newer movie ID', async () => {
  const old = deferred()
  service.fetchMovie.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ ...movie, id: 8, title: 'New Movie' })
  const router = mount('/movie/7')
  await act(async () => router.navigate('/movie/8'))
  await screen.findByRole('heading', { name: 'New Movie' })
  await act(async () => old.resolve(movie))
  expect(screen.queryByRole('heading', { name: movie.title })).toBe(null)
  expect(service.fetchMovie).toHaveBeenLastCalledWith(8)
})

test.each(['invalid', '999'])('changing booking ID to %s removes the previous ticket and clears errors on recovery', async (id) => {
  service.fetchBooking.mockImplementation(async (value) => {
    if (value === 9) return booking
    throw { response: { status: 404 } }
  })
  const router = mount('/bookings/9')
  await screen.findByText('TEST-BOOKING')
  await act(async () => router.navigate('/bookings/' + id))
  await screen.findByText('Booking not found.')
  expect(screen.queryByText('TEST-BOOKING')).toBe(null)
  await act(async () => router.navigate('/bookings/9'))
  await screen.findByText('TEST-BOOKING')
  expect(screen.queryByText('Booking not found.')).toBe(null)
})

test('late booking response cannot replace a newer booking', async () => {
  const old = deferred()
  service.fetchBooking.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ ...booking, id: 10, bookingReference: 'NEW-BOOKING' })
  const router = mount('/bookings/9')
  await act(async () => router.navigate('/bookings/10'))
  await screen.findByText('NEW-BOOKING')
  await act(async () => old.resolve(booking))
  expect(screen.queryByText('TEST-BOOKING')).toBe(null)
})

test('selection controls are locked during verification and checkout uses the displayed seats', async () => {
  const pending = deferred()
  service.fetchSeatMap.mockResolvedValueOnce(seatMap).mockReturnValueOnce(pending.promise)
  const router = mount('/movie/7/showtimes/42/seats')
  const seat = await screen.findByRole('button', { name: /Row A, seat 1,/ })
  fireEvent.click(seat)
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
  expect(seat.disabled).toBe(true)
  expect(screen.getByRole('combobox', { name: 'Tickets' }).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: /Row A, seat 2,/ }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Tickets' }), { target: { value: '1' } })
  await act(async () => pending.resolve(seatMap))
  expect(router.state.location.pathname).toBe('/payment')
  expect(new URLSearchParams(router.state.location.search).get('seats')).toBe('A1')
})

test('leaving the seat page invalidates its pending verification', async () => {
  const pending = deferred()
  service.fetchSeatMap.mockResolvedValueOnce(seatMap).mockReturnValueOnce(pending.promise)
  const router = mount('/movie/7/showtimes/42/seats')
  fireEvent.click(await screen.findByRole('button', { name: /Row A, seat 1,/ }))
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
  await act(async () => router.navigate('/elsewhere'))
  await act(async () => pending.resolve(seatMap))
  expect(router.state.location.pathname).toBe('/elsewhere')
})

test('a newly booked seat blocks checkout and releases the verification lock', async () => {
  const taken = { ...seatMap, availableSeats: 11, rows: seatMap.rows.map((row) => ({ ...row, seats: row.seats.map((seat) => seat.id === 'A1' ? { ...seat, status: 'BOOKED' } : seat) })) }
  service.fetchSeatMap.mockResolvedValueOnce(seatMap).mockResolvedValueOnce(taken)
  const router = mount('/movie/7/showtimes/42/seats')
  fireEvent.click(await screen.findByRole('button', { name: /Row A, seat 1,/ }))
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
  await screen.findByText(/A1 was just booked/)
  expect(router.state.location.pathname).toContain('/seats')
  expect(screen.getByRole('button', { name: /Row A, seat 2,/ }).disabled).toBe(false)
})

test('demo checkout retries use the same key and never send payment credentials', async () => {
  service.createBooking.mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce(booking)
  mount('/payment?showtimeId=42&seats=A1')
  const upi = await screen.findByLabelText('UPI ID')
  fireEvent.change(upi, { target: { value: 'test@bank' } })
  fireEvent.submit(upi.closest('form'))
  await screen.findByText(/Unable to reach the server/)
  fireEvent.submit(upi.closest('form'))
  await screen.findByText('TEST-BOOKING')
  const first = service.createBooking.mock.calls[0][0], second = service.createBooking.mock.calls[1][0]
  expect(second).toEqual(first)
  expect(Object.keys(first).sort()).toEqual(['idempotencyKey', 'seats', 'showtimeId'])
  expect(first.seats).toEqual(['A1'])
})
