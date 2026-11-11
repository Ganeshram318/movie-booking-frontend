# Frontend PR #1 follow-up

## Implemented locally

Issues 1–8 and 10 are fixed: signup/login preserve checkout, movie creation has a
synchronous submission lock, showtime selection respects all filters, shared Home
links scroll to their sections, city controls share state, stale authentication
responses cannot affect newer sessions, seat verification locks the selection,
movie/booking results are keyed to route IDs, and temporary profile failures retain
an unexpired JWT behind a protected-content gate with explicit retry.

Backup: `backup/seatify-pr1-before-bugfixes-20261111-1765dc6c` at `a3f8925`.
The completed fixes are on `seatify/resolve-pr1-20261111-4bd0a72e`.
Publishing to GitHub requires separate approval.

## Local validation

- `npm test`: 46 tests passed across six suites, using real React components,
  deferred HTTP mocks, and a test adapter that blocks unmocked HTTP requests.
- `npm run build`: passed; the existing large-JavaScript-chunk warning remains.
- `npm run lint`: five existing errors and two warnings; no new diagnostics.
  Baseline was five errors and three warnings. The remaining errors are the mixed
  exports in AuthContext and the existing AdminEditMovie/AdminMovieList diagnostics.
- Original CSS, assets, responsive rules, payment demo source, and backend files
  are unchanged. Whitespace and conflict-marker checks passed.
- Vitest 5 requires Node 22.12 or newer; the installed Node 24 runtime was used.
- No live browser visual checks, backend writes, MySQL changes, GitHub pushes, or
  PR merges were performed. Live booking concurrency/recovery validation is still pending.

## Blocked: inherited showtime price and language (issue 9)

The backend's `ShowtimeResponseDto` returns effective `ticketPrice` and `language`.
`ShowtimeDetails` replaces null overrides with the movie defaults. The response
does not expose the stored override values or inheritance flags. `PUT /showtimes/{id}`
then replaces both stored fields with the request values; omission also becomes null.

An inherited price of 200 and an explicit price override of 200 therefore produce
the same response. Comparing with the movie or tracking dirty form fields cannot
safely reconstruct that distinction. The frontend edit behavior is left unchanged.

Required backend contract: expose nullable `ticketPriceOverride` and
`languageOverride` alongside the existing effective fields (or equivalent explicit
inheritance flags). The edit form can then submit the original null/value until the
admin explicitly changes it. Existing nullable request fields can remain unchanged.
No backend files or database data were modified.

## Investigated: booking response loss and recovery

`POST /bookings` supports replay with the same authenticated user, idempotency key,
showtime ID, and seat set. It returns the existing booking before checking whether
the show has started or the seats are taken. A reused key with different selections
returns 409. This is confirmed from `BookingService.createBooking`.

There is no read-only lookup by idempotency key, and booking responses omit that
key. The current frontend key is in component memory, so refresh loses it. A safe
follow-up would persist a pending checkout identity scoped to the authenticated
account and normalized selection, then let the user explicitly retry that exact
POST or inspect My Bookings. A recovery POST can create a booking if the original
never committed, so it must not run automatically when a page mounts.

Recovery is documented, not implemented in this pass. Live transaction/network
failure and concurrent database booking tests were not run, to avoid modifying MySQL.

## Baseline lint

Before these changes: five errors and three warnings. Errors were in AuthContext
(mixed component/hook exports), AdminEditMovie (state update in effect), and
AdminMovieList (two unused variables and state update in effect). Warnings were the
AdminEditMovie effect dependency and React Hook Form compiler warnings in
AdminAddMovie and Register. These are tracked separately from new diagnostics.

## Changed files

- docs/pr1-follow-up.md
- eslint.config.js
- package-lock.json
- package.json
- src/api.jsx
- src/auth/AuthContext.jsx
- src/auth/returnPath.js
- src/components/common/ProtectedRoute.jsx
- src/components/common/ScrollToTop.jsx
- src/components/pages/AdminAddMovie.jsx
- src/components/pages/BookingConfirmation.jsx
- src/components/pages/Home.jsx
- src/components/pages/Login.jsx
- src/components/pages/MovieDetails.jsx
- src/components/pages/Register.jsx
- src/components/pages/SeatSelection.jsx
- src/components/pages/Showtimes.jsx
- tests/admin-add-movie.test.jsx
- tests/api.test.js
- tests/auth.test.jsx
- tests/booking-pages.test.jsx
- tests/fixtures.js
- tests/registration.test.jsx
- tests/setup.js
- tests/showtimes-navigation.test.jsx
- vitest.config.js
