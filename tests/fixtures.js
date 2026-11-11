export function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

export function jwt(email = 'test@example.com', seconds = 3600) {
  const payload = btoa(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + seconds }))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  return `header.${payload}.signature`
}

export const profile = { id: 7, firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ROLE_USER' }
export const movie = { id: 7, title: 'Test Film', name: 'Test Film', genre: 'Drama', language: 'Hindi', duration: '2h', rating: 8, cast: [], poster: '/poster.jpg', banner: '/banner.jpg' }
export const show = { id: 42, movieId: 7, movieName: 'Test Film', theatreId: 3, theatreName: 'Mumbai Cinema', theatreCity: 'Mumbai', theatreAddress: 'Test Road', showDate: '2099-11-12', startTime: '18:45:00', totalSeats: 12, availableSeats: 12, screenNumber: 1, ticketPrice: 200, format: '2D', language: 'Hindi' }
export const seatMap = { showtimeId: 42, totalSeats: 12, availableSeats: 12, convenienceFee: 40, rows: [{ row: 'A', category: 'EXECUTIVE', price: 200, seats: Array.from({ length: 12 }, (_, i) => ({ id: `A${i + 1}`, number: i + 1, status: 'AVAILABLE' })) }] }
export const booking = { id: 9, bookingReference: 'TEST-BOOKING', movieId: 7, movieName: 'Test Film', theatreName: 'Mumbai Cinema', showDate: '2099-11-12', startTime: '18:45:00', createdAt: '2026-11-11T12:00:00', seats: ['A1'], ticketPrice: 200, subtotal: 200, convenienceFee: 40, totalAmount: 240, status: 'CONFIRMED' }
