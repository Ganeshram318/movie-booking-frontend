import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { fetchMovie, fetchShowtimesByMovie, formatShowDate, isUpcoming, parseId, FALLBACK_POSTER } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/MovieDetails.css'

function MovieDetails() {
  const { id } = useParams();
  const movieId = parseId(id);
  const [result, setResult] = useState({ key: null, status: 'loading', movie: null, formats: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [toast, setToast] = useState('');

  const requestKey = `${movieId}:${reloadKey}`;
  const movie = movieId && result.key === requestKey ? result.movie : null;
  const formats = movie ? result.formats : [];
  const errorMessage = result.key === requestKey ? result.errorMessage : '';
  const status = !movieId ? 'not-found' : result.key !== requestKey ? 'loading' : result.status;

  useEffect(() => {
    if (!movieId) {
      return undefined;
    }
    let active = true;
    fetchMovie(movieId)
      .then((data) => {
        if (!active) return;
        setResult({ key: requestKey, status: 'ready', movie: data, formats: [] });
        // Formats come from the movie's real upcoming showtimes
        fetchShowtimesByMovie(movieId)
          .then((shows) => {
            if (active) setResult((current) => ({ ...current, formats: [...new Set(shows.filter((show) => isUpcoming(show)).map((show) => show.format).filter(Boolean))] }));
          })
          .catch(() => { /* Movie details remain available if showtimes cannot be loaded. */ });
      })
      .catch((error) => {
        if (!active) return;
        setResult({ key: requestKey, status: error.response?.status === 404 ? 'not-found' : 'error', movie: null, formats: [], errorMessage: getErrorMessage(error, 'Unable to load this movie.') });
      });
    return () => { active = false; };
  }, [movieId, requestKey]);

  const releaseLabel = movie?.releaseDate ? formatShowDate(movie.releaseDate, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const meta = movie ? [movie.duration, movie.genre, movie.certification, releaseLabel].filter(Boolean) : [];

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const shareMovie = async () => {
    const shareData = { title: `${movie.title} | SEATIFY`, text: `Discover ${movie.title} on SEATIFY`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Movie link copied!');
      } else {
        showToast('Sharing is not available on this device.');
      }
    } catch {
      showToast('Sharing is not available on this device.');
    }
  };

  return <div className="seatify-app movie-details-page" id="movie-top">
    <Header query={query} setQuery={setQuery}/>
    {status === 'loading' ? <main className="movie-not-found"><div><span className="section-kicker">SEATIFY MOVIES</span><h1>Loading movie...</h1><p>Fetching the latest details.</p></div></main>
    : status === 'error' ? <main className="movie-not-found"><div><span className="section-kicker">SEATIFY MOVIES</span><h1>Something went wrong</h1><p>{errorMessage}</p><button className="primary-btn" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try Again <span>↗</span></button></div></main>
    : !movie ? <main className="movie-not-found"><div><span className="section-kicker">SEATIFY MOVIES</span><h1>Movie not found</h1><p>We couldn’t find a movie with that ID.</p><Link className="primary-btn" to="/">Back to Home <span>↗</span></Link></div></main> : <>
      <main>
        <section className="details-hero">
          <div className="details-backdrop" style={{ backgroundImage: `url(${movie.banner})` }}/>
          <div className="details-hero-content">
            <div className="details-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/#movies">Movies</Link><span>/</span><b>{movie.title}</b></div>
            <div className="details-main-row">
              <div className="details-poster-column">
                <div className="details-poster"><img src={movie.poster} alt={`${movie.title} poster`} onError={(event) => { event.currentTarget.src = FALLBACK_POSTER; }}/></div>
                <button className="outline-btn trailer-button" type="button" onClick={() => setTrailerOpen(true)}><span className="trailer-play" aria-hidden="true">▶</span> Watch Trailer</button>
              </div>
              <div className="details-copy">
                <span className="details-eyebrow">MOVIE DETAILS</span>
                <h1>{movie.title}</h1>
                <div className="details-rating"><span className="rating-star">★</span><strong>{movie.ratingLabel ?? 'N/A'}<small>/10</small></strong><button type="button" onClick={() => showToast('Rating is coming soon.')}>Rate Now <span>↗</span></button></div>
                <div className="details-meta">{meta.map((item, index) => <Fragment key={item}>{index > 0 && <i/>}<span>{item}</span></Fragment>)}</div>
                <div className="details-badges">{formats.length > 0 && <div className="format-badges">{formats.map((format) => <span key={format}>{format}</span>)}</div>}{movie.language && <span className="language-badge">{movie.language}</span>}</div>
                <p className="details-blurb">{movie.blurb}</p>
                <div className="details-actions"><Link className="primary-btn details-book" to={`/movie/${movie.id}/showtimes`}>Book Tickets <span>↗</span></Link><button className="outline-btn share-button" type="button" onClick={shareMovie}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.1"/></svg> Share</button></div>
              </div>
            </div>
          </div>
        </section>

        <div className="details-content">
          <section className="details-about">
            <div className="section-heading"><div><span className="section-kicker">THE STORY SO FAR</span><h2>About the Movie<span>.</span></h2></div></div>
            <p>{movie.description || 'No description is available for this movie yet.'}</p>
          </section>
          <section className="details-facts" aria-label="Movie information">
            {movie.director && <div><span>DIRECTOR</span><strong>{movie.director}</strong></div>}
            {movie.cast.length > 0 && <div><span>CAST</span><strong>{movie.cast.join(', ')}</strong></div>}
            {movie.language && <div><span>LANGUAGE</span><strong>{movie.language}</strong></div>}
            {movie.genre && <div><span>GENRE</span><strong>{movie.genre}</strong></div>}
            {releaseLabel && <div><span>RELEASE</span><strong>{releaseLabel}</strong></div>}
          </section>
        </div>
      </main>
      {trailerOpen && <div className="trailer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTrailerOpen(false); }}><section className="trailer-modal" role="dialog" aria-modal="true" aria-labelledby="trailer-title"><button className="modal-close" type="button" aria-label="Close trailer dialog" onClick={() => setTrailerOpen(false)}>×</button><span className="modal-play">▶</span><h2 id="trailer-title">Trailer coming soon</h2><p>The trailer for {movie.title} will be available here.</p></section></div>}
    </>}
    {toast && <div className="toast-message" role="status"><span>✦</span>{toast}</div>}
  </div>;
}

export default MovieDetails;
