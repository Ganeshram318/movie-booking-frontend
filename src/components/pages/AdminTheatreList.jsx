import { Link } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import { useEffect, useState } from 'react'
import api from '../../api'

function AdminTheatreList() {
  const [theatres, setTheatres] = useState([])
  const [filteredTheatres, setFilteredTheatres] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTheatres = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/theatres')
      setTheatres(response.data)
      setFilteredTheatres(response.data)
    } catch (error) {
      console.error('Error fetching theatres:', error)
      setError('Failed to load theatres. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTheatres()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTheatres(theatres)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = theatres.filter(
        (theatre) =>
          theatre.name?.toLowerCase().includes(term) ||
          theatre.city?.toLowerCase().includes(term)
      )
      setFilteredTheatres(filtered)
    }
  }, [searchTerm, theatres])

  const handleDeleteTheatre = async (theatreId, theatreName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${theatreName}"?`
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/theatres/${theatreId}`)
      alert('Theatre deleted successfully!')
      setTheatres(theatres.filter((t) => t.id !== theatreId))
    } catch (error) {
      console.error('Delete Error:', error)
      alert('Failed to delete theatre')
    }
  }

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <header className="admin-movie-heading admin-list-heading">
          <span className="admin-movie-kicker">SEATIFY · THEATRES</span>
          <h1>Theatre Management</h1>
          <p>Review and organize theatres in your catalogue.</p>
        </header>

        <div className="admin-list-toolbar">
          <span className="admin-list-count">
            {filteredTheatres.length} theatre{filteredTheatres.length !== 1 ? 's' : ''}
          </span>
          <label className="admin-list-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.6" />
              <path d="m16 16 4.3 4.3" />
            </svg>
            <input
              type="search"
              aria-label="Search theatres"
              placeholder="Search theatres by name or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <Link className="admin-add-link" to="/admin/theatres/add">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Theatre
          </Link>
        </div>

        {loading ? (
          <section className="admin-table-card" aria-label="Loading">
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              Loading theatres...
            </div>
          </section>
        ) : error ? (
          <section className="admin-table-card" aria-label="Error">
            <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
              {error}
            </div>
          </section>
        ) : filteredTheatres.length > 0 ? (
          <section className="admin-table-card" aria-label="Theatre catalogue">
            <div className="admin-table-scroll">
              <table className="admin-movie-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Theatre Name</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Total Screens</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTheatres.map((theatre) => (
                    <tr key={theatre.id}>
                      <td>#{theatre.id}</td>
                      <td>
                        <span className="admin-table-title">{theatre.name}</span>
                      </td>
                      <td>{theatre.city}</td>
                      <td>{theatre.address}</td>
                      <td>{theatre.totalscreens}</td>
                      <td>
                        <div className="admin-table-actions">
                          <Link
                            className="admin-row-action edit"
                            to={`/admin/theatres/edit/${theatre.id}`}
                            aria-label={`Edit ${theatre.name}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            className="admin-row-action delete"
                            type="button"
                            onClick={() => handleDeleteTheatre(theatre.id, theatre.name)}
                            aria-label={`Delete ${theatre.name}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                            </svg>
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
              <div className="admin-empty-state-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5h16v14H4zM4 9h16M8 5l2 4m4-4 2 4" />
                </svg>
              </div>
              <h2>No theatres yet</h2>
              <p>
                Your theatre catalogue is empty. Add a theatre to see it listed
                here.
              </p>
              <Link className="admin-add-link" to="/admin/theatres/add">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add your first theatre
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default AdminTheatreList
