import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import api, { getErrorMessage } from '../../api'
import { toDateKey } from '../../services/seatify'

export const MAX_SHOW_SEATS = 312
const formats = ['2D', '3D', 'IMAX', 'IMAX 3D', '4DX', 'Dolby Cinema']

const emptyForm = { movieId: '', theatreId: '', showDate: '', startTime: '', screenNumber: '', totalSeats: '', format: '', language: '', ticketPrice: '' }

const toForm = (show) => ({
  movieId: String(show.movieId ?? ''),
  theatreId: String(show.theatreId ?? ''),
  showDate: show.showDate ?? '',
  startTime: String(show.startTime ?? '').slice(0, 5),
  screenNumber: show.screenNumber ?? '',
  totalSeats: show.totalSeats ?? '',
  format: show.format ?? '',
  language: show.language ?? '',
  ticketPrice: show.ticketPrice ?? '',
})

function AdminShowtimeForm({ showtimeId = null }) {
  const navigate = useNavigate()
  const isEdit = showtimeId !== null
  const [form, setForm] = useState(emptyForm)
  const [movies, setMovies] = useState([])
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    const requests = [api.get('/movies'), api.get('/theatres')]
    if (isEdit) requests.push(api.get(`/showtimes/${showtimeId}`))
    Promise.all(requests)
      .then(([movieResponse, theatreResponse, showResponse]) => {
        if (!active) return
        setMovies(movieResponse.data)
        setTheatres(theatreResponse.data)
        if (showResponse) setForm(toForm(showResponse.data))
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error.response?.status === 404 ? 'Showtime not found. It may have been deleted.' : getErrorMessage(error, 'Failed to load form data.'))
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isEdit, showtimeId])

  const selectedTheatre = useMemo(() => theatres.find((theatre) => String(theatre.id) === form.theatreId), [theatres, form.theatreId])
  const selectedMovie = useMemo(() => movies.find((movie) => String(movie.id) === form.movieId), [movies, form.movieId])

  const update = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.movieId) next.movieId = 'Please select a movie.'
    if (!form.theatreId) next.theatreId = 'Please select a theatre.'
    if (!form.showDate) next.showDate = 'Show date is required.'
    if (!form.startTime) next.startTime = 'Start time is required.'
    if (form.showDate && form.startTime) {
      const [year, month, day] = form.showDate.split('-').map(Number)
      const [hours, minutes] = form.startTime.split(':').map(Number)
      if (new Date(year, month - 1, day, hours, minutes) <= new Date()) next.startTime = 'Show date and time must be in the future.'
    }
    const screen = Number(form.screenNumber)
    if (form.screenNumber === '') next.screenNumber = 'Screen number is required.'
    else if (!Number.isInteger(screen) || screen < 1) next.screenNumber = 'Screen number must be a positive whole number.'
    else if (selectedTheatre && screen > selectedTheatre.totalscreens) next.screenNumber = `This theatre has ${selectedTheatre.totalscreens} screen${selectedTheatre.totalscreens === 1 ? '' : 's'}.`
    const seats = Number(form.totalSeats)
    if (form.totalSeats === '') next.totalSeats = 'Seat capacity is required.'
    else if (!Number.isInteger(seats) || seats < 1) next.totalSeats = 'Seat capacity must be a positive whole number.'
    else if (seats > MAX_SHOW_SEATS) next.totalSeats = `Seat capacity cannot exceed ${MAX_SHOW_SEATS}.`
    if (form.ticketPrice !== '' && !(Number(form.ticketPrice) > 0)) next.ticketPrice = 'Ticket price must be greater than zero.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    setApiError('')
    if (!validate()) return
    setIsSubmitting(true)
    const payload = {
      movieId: Number(form.movieId),
      theatreId: Number(form.theatreId),
      showDate: form.showDate,
      startTime: `${form.startTime}:00`,
      screenNumber: Number(form.screenNumber),
      totalSeats: Number(form.totalSeats),
      format: form.format || null,
      language: form.language.trim() || null,
      ticketPrice: form.ticketPrice === '' ? null : Number(form.ticketPrice),
    }
    try {
      if (isEdit) await api.put(`/showtimes/${showtimeId}`, payload)
      else await api.post('/showtimes', payload)
      navigate('/admin/showtimes', { state: { message: isEdit ? 'Showtime updated successfully.' : 'Showtime added successfully.' } })
    } catch (error) {
      setApiError(getErrorMessage(error, isEdit ? 'Failed to update showtime.' : 'Failed to add showtime.'))
      setIsSubmitting(false)
    }
  }

  const field = (name, label, control, options = {}) => (
    <div className={`admin-movie-field ${options.full ? 'full-width' : ''}`}>
      <label htmlFor={`showtime-${name}`}>{label}{options.required && <span aria-hidden="true"> *</span>}</label>
      {control}
      {options.hint && !errors[name] && <small>{options.hint}</small>}
      {errors[name] && <small className="admin-field-error" role="alert">{errors[name]}</small>}
    </div>
  )

  const title = isEdit ? 'Edit Showtime' : 'Add Showtime'

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <Link className="admin-back-link" to="/admin/showtimes"><span aria-hidden="true">←</span> Back to Showtimes</Link>
        <header className="admin-movie-heading">
          <span className="admin-movie-kicker">SEATIFY · SHOWTIMES</span>
          <h1>{title}</h1>
          <p>Schedule a movie on a theatre screen. Customers can book seats as soon as it is saved.</p>
        </header>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
        ) : loadError ? (
          <section className="admin-table-card admin-empty-state"><div><h2>{isEdit ? 'Showtime unavailable' : 'Unable to load'}</h2><p>{loadError}</p><Link className="admin-add-link" to="/admin/showtimes">Back to Showtimes</Link></div></section>
        ) : !movies.length || !theatres.length ? (
          <section className="admin-table-card admin-empty-state"><div><h2>Add movies and theatres first</h2><p>A showtime needs at least one movie and one theatre.</p><Link className="admin-add-link" to={!movies.length ? '/admin/add-movie' : '/admin/theatres/add'}>{!movies.length ? 'Add a movie' : 'Add a theatre'}</Link></div></section>
        ) : (
          <form className="admin-movie-form" noValidate onSubmit={submit}>
            <div className="admin-form-grid">
              {field('movieId', 'Movie', <select id="showtime-movieId" value={form.movieId} onChange={update('movieId')}><option value="">Select a movie</option>{movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.name}</option>)}</select>, { required: true })}
              {field('theatreId', 'Theatre', <select id="showtime-theatreId" value={form.theatreId} onChange={update('theatreId')}><option value="">Select a theatre</option>{theatres.map((theatre) => <option key={theatre.id} value={theatre.id}>{theatre.name}{theatre.city ? ` · ${theatre.city}` : ''}</option>)}</select>, { required: true })}
              {field('showDate', 'Show Date', <input id="showtime-showDate" type="date" min={toDateKey(new Date())} value={form.showDate} onChange={update('showDate')} />, { required: true })}
              {field('startTime', 'Start Time', <input id="showtime-startTime" type="time" value={form.startTime} onChange={update('startTime')} />, { required: true })}
              {field('screenNumber', 'Screen Number', <input id="showtime-screenNumber" type="number" min="1" max={selectedTheatre?.totalscreens} step="1" placeholder="e.g. 1" value={form.screenNumber} onChange={update('screenNumber')} />, { required: true, hint: selectedTheatre ? `Screens 1–${selectedTheatre.totalscreens} available` : undefined })}
              {field('totalSeats', 'Seat Capacity', <input id="showtime-totalSeats" type="number" min="1" max={MAX_SHOW_SEATS} step="1" placeholder="e.g. 120" value={form.totalSeats} onChange={update('totalSeats')} />, { required: true, hint: 'Seats are arranged in rows of 12' })}
              {field('format', 'Format', <select id="showtime-format" value={form.format} onChange={update('format')}><option value="">Not specified</option>{[...new Set([...formats, form.format].filter(Boolean))].map((item) => <option key={item}>{item}</option>)}</select>)}
              {field('language', 'Language', <input id="showtime-language" type="text" maxLength={50} placeholder={selectedMovie?.language ? `Defaults to ${selectedMovie.language}` : 'Defaults to the movie language'} value={form.language} onChange={update('language')} />)}
              {field('ticketPrice', 'Ticket Price (₹)', <input id="showtime-ticketPrice" type="number" min="0.01" step="0.01" placeholder={selectedMovie ? `Defaults to ₹${selectedMovie.price}` : 'Defaults to the movie price'} value={form.ticketPrice} onChange={update('ticketPrice')} />)}
            </div>
            {apiError && <p className="admin-field-error" role="alert">{apiError}</p>}
            <div className="admin-form-actions">
              <button className="admin-submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : title} <span aria-hidden="true">↗</span></button>
              <Link className="admin-cancel-link" to="/admin/showtimes">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default AdminShowtimeForm
