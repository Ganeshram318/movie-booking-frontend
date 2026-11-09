import { NavLink } from 'react-router-dom'

function AdminNavigation() {
  return (
    <nav className="admin-navigation" aria-label="Admin navigation">
      <span className="admin-navigation-brand">SEATIFY <small>ADMIN</small></span>
      <div className="admin-navigation-links">
        <NavLink to="/admin/movies">Manage Movies</NavLink>
        <NavLink to="/admin/add-movie">Add Movie</NavLink>
        <NavLink to="/admin/theatres">Manage Theatres</NavLink>
        <NavLink to="/admin/theatres/add">Add Theatre</NavLink>
      </div>
    </nav>
  )
}

export default AdminNavigation
