
import { Link, useParams } from 'react-router-dom'
import AdminNavigation from '../common/AdminNavigation'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import { useEffect, useState } from 'react'
import api from '../../api'

const genres = [
  'Action', 'Comedy', 'Drama', 'Romance', 'Thriller',
  'Horror', 'Sci-Fi', 'Animation', 'Adventure', 'Sports'
]

const languages = [
  'Hindi', 'English', 'Tamil', 'Telugu',
  'Malayalam', 'Kannada', 'Other'
]

function AdminEditMovie() {

  const { id } = useParams();

  const [movie, setMovie] = useState(null);

  // Fetch selected movie
  const fetchMovieById = async () => {
    try {
      const response = await api.get("/movies");

      const selectedMovie = response.data.find(
        (movie) => String(movie.id) === id
      );

      setMovie(selectedMovie || null);

      console.log("Selected Movie:", selectedMovie);

    } catch (error) {
      console.error("Error fetching movie:", error);
    }
  };

  useEffect(() => {
    fetchMovieById();
  }, [id]);

  // UPDATE MOVIE
  const handleUpdateMovie = async () => {
    if (!movie) return;

    const movieData = {
      name: movie.name,
      language: movie.language,
      genre: movie.genre,
      duration: Number(movie.duration),
      price: Number(movie.price),
      description: movie.description,
      releaseDate: movie.releaseDate,
      bannerUrl: movie.bannerUrl,
      rating: Number(movie.rating),
      featured: Boolean(movie.featured),
      posterUrl: movie.posterUrl
    };

    console.log("PUT Request Body:", movieData);

    try {
      const response = await api.put(`/movies/${id}`, movieData);

      console.log("Updated Movie:", response.data);

      alert("Movie updated successfully!");

    } catch (error) {
      console.error("Update Error:", error);
      alert("Failed to update movie");
    }
  };

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">

        <AdminNavigation />

        <header className="admin-movie-heading">
          <span className="admin-movie-kicker">
            SEATIFY · CATALOGUE
          </span>
          <h1>Edit Movie</h1>
          <p>
            Update the movie information shown in your catalogue.
          </p>
        </header>

        <div
          className="admin-movie-form admin-edit-form"
          role="group"
          aria-label="Movie details"
        >

          <div className="admin-form-grid">

            {/* MOVIE TITLE */}
            <div className="admin-movie-field">
              <label htmlFor="edit-title">Movie Title</label>
              <input
                id="edit-title"
                type="text"
                placeholder="Enter movie title"
                value={movie?.name ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    name: e.target.value
                  })
                }
              />
            </div>

            {/* GENRE */}
            <div className="admin-movie-field">
              <label htmlFor="edit-genre">Genre</label>

              <select
                id="edit-genre"
                value={movie?.genre ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    genre: e.target.value
                  })
                }
              >
                <option value="">Select genre</option>

                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="admin-movie-field full-width">
              <label htmlFor="edit-description">Description</label>

              <textarea
                id="edit-description"
                rows="5"
                placeholder="Add a short movie description"
                value={movie?.description ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    description: e.target.value
                  })
                }
              />
            </div>

            {/* LANGUAGE */}
            <div className="admin-movie-field">
              <label htmlFor="edit-language">Language</label>

              <select
                id="edit-language"
                value={movie?.language ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    language: e.target.value
                  })
                }
              >
                <option value="">Select language</option>

                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* DURATION */}
            <div className="admin-movie-field">
              <label htmlFor="edit-duration">
                Duration (minutes)
              </label>

              <input
                id="edit-duration"
                type="number"
                placeholder="e.g. 140"
                value={movie?.duration ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    duration:
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                  })
                }
              />
            </div>

            {/* RELEASE DATE */}
            <div className="admin-movie-field">
              <label htmlFor="edit-release-date">
                Release Date
              </label>

              <input
                id="edit-release-date"
                type="date"
                value={movie?.releaseDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    releaseDate: e.target.value
                  })
                }
              />
            </div>

            {/* RATING */}
            <div className="admin-movie-field">
              <label htmlFor="edit-rating">
                Rating (0–10)
              </label>

              <input
                id="edit-rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="e.g. 8.5"
                value={movie?.rating ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    rating:
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                  })
                }
              />
            </div>

            {/* POSTER URL */}
            <div className="admin-movie-field full-width">
              <label htmlFor="edit-poster-url">
                Movie Poster URL
              </label>

              <input
                id="edit-poster-url"
                type="url"
                placeholder="https://example.com/poster.jpg"
                value={movie?.posterUrl ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    posterUrl: e.target.value
                  })
                }
              />
            </div>

            {/* BANNER URL */}
            <div className="admin-movie-field full-width">
              <label htmlFor="edit-banner-url">
                Banner Image URL
              </label>

              <input
                id="edit-banner-url"
                type="url"
                placeholder="https://example.com/banner.jpg"
                value={movie?.bannerUrl ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    bannerUrl: e.target.value
                  })
                }
              />
            </div>

            {/* PRICE */}
            <div className="admin-movie-field">
              <label htmlFor="edit-price">
                Ticket Price (₹)
              </label>

              <input
                id="edit-price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 250"
                value={movie?.price ?? ""}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    price:
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                  })
                }
              />
            </div>

            {/* FEATURED MOVIE */}
            <label className="admin-feature-toggle">
              <input
                type="checkbox"
                checked={movie?.featured ?? false}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    featured: e.target.checked
                  })
                }
              />

              <span className="admin-checkmark" />

              <span>
                <b>Featured Movie</b>
                <small>
                  Highlight this movie in the catalogue
                </small>
              </span>
            </label>

          </div>

          {/* ACTION BUTTONS */}
          <div className="admin-edit-actions">

            <button
              className="admin-submit-button"
              type="button"
              onClick={handleUpdateMovie}
              disabled={!movie}
            >
              Update Movie
              <span aria-hidden="true"> ↗</span>
            </button>

            <Link
              className="admin-cancel-link"
              to="/admin/movies"
            >
              Cancel
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}

export default AdminEditMovie;
