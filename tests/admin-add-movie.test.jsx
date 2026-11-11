import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import api from '../src/api'
import AdminAddMovie from '../src/components/pages/AdminAddMovie'
import { deferred } from './fixtures'

function fillMovie() {
  for (const [label, value] of [['Movie Title', 'Test Film'], ['Genre', 'Drama'], ['Description', 'Test description'], ['Language', 'Hindi'], ['Duration (minutes)', '120'], ['Release Date', '2099-11-12'], ['Ticket Price (₹)', '200']]) {
    fireEvent.change(screen.getByLabelText(new RegExp(label.replace(/[()]/g, '\\$&'))), { target: { value } })
  }
}

test('concurrent validated submits create only one movie and disable submission until completion', async () => {
  const pending = deferred()
  vi.spyOn(api, 'post').mockReturnValue(pending.promise)
  render(<MemoryRouter><AdminAddMovie/></MemoryRouter>)
  fillMovie()
  const form = screen.getByRole('button', { name: /Add Movie/ }).closest('form')
  fireEvent.submit(form); fireEvent.submit(form)
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
  expect(screen.getByRole('button', { name: /Saving/ }).disabled).toBe(true)
  expect(screen.getByRole('button', { name: /Clear Form/ }).disabled).toBe(true)
  await act(async () => pending.resolve({ data: { name: 'Test Film', duration: 120, price: 200 } }))
  expect(screen.getByRole('button', { name: /Add Movie/ }).disabled).toBe(false)
})

test('failed submission releases the synchronous guard so the admin can retry', async () => {
  vi.spyOn(api, 'post').mockRejectedValueOnce({ response: { data: { message: 'Try again' } } })
    .mockResolvedValueOnce({ data: { name: 'Test Film', duration: 120, price: 200 } })
  render(<MemoryRouter><AdminAddMovie/></MemoryRouter>)
  fillMovie()
  const button = screen.getByRole('button', { name: /Add Movie/ })
  fireEvent.submit(button.closest('form'))
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Try again'))
  fireEvent.submit(button.closest('form'))
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2))
})
