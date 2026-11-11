import { Link, useParams } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import AdminShowtimeForm from './AdminShowtimeForm'
import { parseId } from '../../services/seatify'

function AdminEditShowtime() {
  const showtimeId = parseId(useParams().id)
  if (!showtimeId) {
    return <main className="admin-movie-page"><div className="admin-movie-shell"><AdminNavigation /><section className="admin-table-card admin-empty-state"><div><h2>Showtime not found</h2><p>That showtime ID is not valid.</p><Link className="admin-add-link" to="/admin/showtimes">Back to Showtimes</Link></div></section></div></main>
  }
  return <AdminShowtimeForm key={showtimeId} showtimeId={showtimeId} />
}

export default AdminEditShowtime
