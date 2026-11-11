import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import axios from 'axios'

// Tests must explicitly mock every HTTP request; never contact the local backend.
axios.defaults.adapter = async () => { throw new Error('Unmocked HTTP request blocked by test setup') }

beforeEach(() => {
  sessionStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
