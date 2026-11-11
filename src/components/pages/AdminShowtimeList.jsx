import { Link, useLocation } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { getErrorMessage } from '../../api'
import { formatCurrency, formatShowDate, formatTime, isUpcoming } from '../../services/seatify'

function AdminShowtimeList() {
  const location = useLocation()
  const [showtimes, setShowtimes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPast, setShowPast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(location.state?.message ?? '')

  const fetchShowtimes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/showtimes')
      setShowtimes(response.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load showtimes. Please try again later.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShowtimes()
  }, [fetchShowtimes])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return showtimes
      .filter((show) => showPast || isUpcoming(show))
      .filter((show) => !term || [show.movieName, show.theatreName, show.theatreCity].some((value) => value?.toLowerCase().includes(term)))
      .sort((a, b) => `${a.showDate} ${a.startTime}`.localeCompare(`${b.showDate} ${b.startTime}`))
  }, [showtimes, searchTerm, showPast])

  const handleDelete = async (show) => {
    if (!window.confirm(`Delete the ${formatTime(show.startTime)} show of "${show.movieName}" on ${formatShowDate(show.showDate)}?`)) return
    try {
      await api.delete(`/showtimes/${show.id}`)
      setMessage('Showtime deleted successfully.')
      await fetchShowtimes()
    } catch (err) {
      setMessage('')
      alert(getErrorMessage(err, 'Failed to delete showtime'))
    }
  }

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <header className="admin-movie-heading admin-list-heading">
          <span className="admin-movie-kicker">SEATIFY · SHOWTIMES</span>
          <h1>Showtime Management</h1>
          <p>Schedule movies across your theatres and screens.</p>
        </header>

        {message && <div className="admin-success" role="status"><span aria-hidden="true">✓</span><div><b>{message}</b></div></div>}

        <div className="admin-list-toolbar">
          <span className="admin-list-count">{filtered.length} showtime{filtered.length !== 1 ? 's' : ''}</span>
          <label className="admin-list-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.3 4.3" /></svg>
            <input type="search" aria-label="Search showtimes" placeholder="Search by movie, theatre or city" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </label>
          <label className="admin-list-count" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> Include past shows</label>
          <Link className="admin-add-link" to="/admin/showtimes/add">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Add Showtime
          </Link>
        </div>

        {loading ? (
          <section className="admin-table-card" aria-label="Loading"><div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading showtimes...</div></section>
        ) : error ? (
          <section className="admin-table-card" aria-label="Error"><div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>{error}</div></section>
        ) : filtered.length > 0 ? (
          <section className="admin-table-card" aria-label="Showtime schedule">
            <div className="admin-table-scroll">
              <table className="admin-movie-table">
                <thead>
                  <tr><th>ID</th><th>Movie</th><th>Theatre</th><th>Date</th><th>Time</th><th>Screen</th><th>Format</th><th>Price</th><th>Seats</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((show) => (
                    <tr key={show.id}>
                      <td>#{show.id}</td>
                      <td><span className="admin-table-title">{show.movieName}</span></td>
                      <td>{show.theatreName}{show.theatreCity ? `, ${show.theatreCity}` : ''}</td>
                      <td>{formatShowDate(show.showDate)}</td>
                      <td>{formatTime(show.startTime)}</td>
                      <td>{show.screenNumber}</td>
                      <td>{show.format || '—'}</td>
                      <td>{formatCurrency(show.ticketPrice)}</td>
                      <td>{show.bookedSeats}/{show.totalSeats} booked</td>
                      <td>
                        <div className="admin-table-actions">
                          <Link className="admin-row-action edit" to={`/admin/showtimes/edit/${show.id}`} aria-label={`Edit showtime ${show.id}`}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" /></svg>
                            Edit
                          </Link>
                          <button className="admin-row-action delete" type="button" onClick={() => handleDelete(show)} aria-label={`Delete showtime ${show.id}`}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="admin-table-card admin-empty-state">
            <div>
              <div className="admin-empty-state-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 9h16M8 5l2 4m4-4 2 4" /></svg></div>
              <h2>{showtimes.length ? 'No matching showtimes' : 'No showtimes yet'}</h2>
              <p>{showtimes.length ? 'Try a different search or include past shows.' : 'Schedule a movie in a theatre to make it bookable.'}</p>
              <Link className="admin-add-link" to="/admin/showtimes/add"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Add Showtime</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default AdminShowtimeList
