import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import { useEffect, useState, useCallback } from 'react'
import api, { getErrorMessage } from '../../api'

function AdminEditTheatre() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [theatre, setTheatre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTheatreById = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const response = await api.get('/theatres')

      const selectedTheatre = response.data.find(
        (theatre) => String(theatre.id) === id
      )

      if (selectedTheatre) {
        setTheatre(selectedTheatre)
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error('Error fetching theatre:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTheatreById()
  }, [fetchTheatreById])

  const handleUpdateTheatre = async () => {
    if (!theatre) return

    setIsSubmitting(true)

    const theatreData = {
      name: theatre.name,
      city: theatre.city,
      address: theatre.address,
      totalscreens: Number(theatre.totalscreens)
    }

    console.log('PUT Request Body:', theatreData)

    try {
      const response = await api.put(`/theatres/${id}`, theatreData)

      console.log('Updated Theatre:', response.data)

      alert('Theatre updated successfully!')

      navigate('/admin/theatres')
    } catch (error) {
      console.error('Update Error:', error)
      alert(getErrorMessage(error, 'Failed to update theatre'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="admin-movie-page">
        <div className="admin-movie-shell">
          <AdminNavigation />
          <header className="admin-movie-heading">
            <span className="admin-movie-kicker">SEATIFY · THEATRES</span>
            <h1>Edit Theatre</h1>
          </header>
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            Loading theatre details...
          </div>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="admin-movie-page">
        <div className="admin-movie-shell">
          <AdminNavigation />
          <header className="admin-movie-heading">
            <span className="admin-movie-kicker">SEATIFY · THEATRES</span>
            <h1>Theatre Not Found</h1>
          </header>
          <section className="admin-table-card admin-empty-state">
            <div>
              <div className="admin-empty-state-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5h16v14H4zM4 9h16M8 5l2 4m4-4 2 4" />
                </svg>
              </div>
              <h2>Theatre not found</h2>
              <p>
                The theatre you're looking for doesn't exist or has been deleted.
              </p>
              <Link className="admin-add-link" to="/admin/theatres">
                Back to Theatre List
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />

        <header className="admin-movie-heading">
          <span className="admin-movie-kicker">SEATIFY · THEATRES</span>
          <h1>Edit Theatre</h1>
          <p>Update the theatre information shown in your catalogue.</p>
        </header>

        <div
          className="admin-movie-form admin-edit-form"
          role="group"
          aria-label="Theatre details"
        >
          <div className="admin-form-grid">
            {/* THEATRE NAME */}
            <div className="admin-movie-field">
              <label htmlFor="edit-name">Theatre Name</label>
              <input
                id="edit-name"
                type="text"
                placeholder="Enter theatre name"
                value={theatre?.name ?? ''}
                onChange={(e) =>
                  setTheatre({
                    ...theatre,
                    name: e.target.value
                  })
                }
              />
            </div>

            {/* CITY */}
            <div className="admin-movie-field">
              <label htmlFor="edit-city">City</label>
              <input
                id="edit-city"
                type="text"
                placeholder="e.g. Mumbai"
                value={theatre?.city ?? ''}
                onChange={(e) =>
                  setTheatre({
                    ...theatre,
                    city: e.target.value
                  })
                }
              />
            </div>

            {/* ADDRESS */}
            <div className="admin-movie-field full-width">
              <label htmlFor="edit-address">Address</label>
              <textarea
                id="edit-address"
                rows="3"
                placeholder="Enter the complete address..."
                value={theatre?.address ?? ''}
                onChange={(e) =>
                  setTheatre({
                    ...theatre,
                    address: e.target.value
                  })
                }
              />
            </div>

            {/* TOTAL SCREENS */}
            <div className="admin-movie-field">
              <label htmlFor="edit-totalscreens">Total Screens</label>
              <input
                id="edit-totalscreens"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5"
                value={theatre?.totalscreens ?? ''}
                onChange={(e) =>
                  setTheatre({
                    ...theatre,
                    totalscreens:
                      e.target.value === '' ? '' : Number(e.target.value)
                  })
                }
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="admin-edit-actions">
            <button
              className="admin-submit-button"
              type="button"
              onClick={handleUpdateTheatre}
              disabled={!theatre || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Theatre'}
              <span aria-hidden="true"> ↗</span>
            </button>

            <Link className="admin-cancel-link" to="/admin/theatres">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminEditTheatre
