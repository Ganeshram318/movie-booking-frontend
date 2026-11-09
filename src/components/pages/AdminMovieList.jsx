import { Link } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import { useEffect, useState } from 'react'
import api from '../../api'

// TODO: Replace these UI samples with your GET /movies response when you implement API integration.
const sampleMovies = [
  
]

function AdminMovieList() {
 const [movie, setMovie] = useState([]);

 const fetchMovie = async ()=>{
  
  try {
    const response = await api.get("/movies")
    setMovie(response.data);
  } catch (error) {
    alert("Something went wrong")
  }
 }


 useEffect(() => {
  fetchMovie();
}, []);

const handleDeleteMovie = async (movieId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this movie?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/movies/${movieId}`);

    alert("Movie deleted successfully!");

    setMovie(movie.filter((m) => m.id !== movieId));

  } catch (error) {
    console.error("Delete Error:", error);
    alert("Failed to delete movie");
  }
};



  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <header className="admin-movie-heading admin-list-heading">
          <span className="admin-movie-kicker">SEATIFY · CATALOGUE</span>
          <h1>Manage Movies</h1>
          <p>Review and organize movies in your catalogue.</p>
        </header>

        <div className="admin-list-toolbar">
          <span className="admin-list-count">{movie.length} sample movies</span>
          <label className="admin-list-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.3 4.3"/></svg>
            {/* TODO: Connect this input to your movie search/filter logic. */}
            <input type="search" aria-label="Search movies" placeholder="Search movies by title, genre, or language" />
          </label>
          <Link className="admin-add-link" to="/admin/add-movie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Add Movie</Link>
        </div>

        {movie.length > 0 ? (
          <section className="admin-table-card" aria-label="Movie catalogue">
            <div className="admin-table-scroll">
              <table className="admin-movie-table">
                <thead><tr><th>Poster</th><th>Movie</th><th>Genre</th><th>Language</th><th>Duration</th><th>Release Date</th><th>Rating</th><th>Ticket Price</th><th>Actions</th></tr></thead>
                <tbody>{movie.map((movie) => (
                  <tr key={movie.id}>
                    <td><img className="admin-table-poster" src={movie.posterUrl} alt={`${movie.name} poster`} /></td>
                    <td><span className="admin-table-title">{movie.name}</span>{movie.featured && <span className="admin-featured-pill">FEATURED</span>}</td>
                    <td>{movie.genre}</td><td>{movie.language}</td><td>{movie.duration}</td><td>{movie.releaseDate}</td><td>★ {movie.rating}/10</td><td>₹{movie.price}</td>
                    <td><div className="admin-table-actions">
                      {/* TODO: Add the edit handler and connect the selected movie when you implement CRUD. */}
                      <Link className="admin-row-action edit" to={`/admin/edit-movie/${movie.id}`} 
                      aria-label={`Edit ${movie.name}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z"/></svg>Edit</Link>
                      <button className="admin-row-action delete" type="button" onClick={() => handleDeleteMovie(movie.id)} aria-label={`Delete ${movie.name}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>Delete</button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="admin-table-card admin-empty-state">
            <div><div className="admin-empty-state-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 9h16M8 5l2 4m4-4 2 4"/></svg></div><h2>No movies yet</h2><p>Your movie catalogue is empty. Add a movie to see it listed here.</p><Link className="admin-add-link" to="/admin/add-movie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Add your first movie</Link></div>
          </section>
        )}
      </div>
    </main>
  )
}

export default AdminMovieList
