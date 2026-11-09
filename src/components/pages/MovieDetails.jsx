import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { movies, movieDetails } from '../../data/movies';
import { Header } from './Home';
import '../../styles/MovieDetails.css'

function MovieDetails() {
  const { id } = useParams();
  const movie = movies.find((item) => String(item.id) === id);
  const details = movie ? movieDetails[movie.id] : null;
  const [query, setQuery] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [toast, setToast] = useState('');

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
    {!movie ? <main className="movie-not-found"><div><span className="section-kicker">SEATIFY MOVIES</span><h1>Movie not found</h1><p>We couldn’t find a movie with that ID.</p><Link className="primary-btn" to="/">Back to Home <span>↗</span></Link></div></main> : <>
      <main>
        <section className="details-hero">
          <div className="details-backdrop" style={{ backgroundImage: `url(${movie.banner})` }}/>
          <div className="details-hero-content">
            <div className="details-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/#movies">Movies</Link><span>/</span><b>{movie.title}</b></div>
            <div className="details-main-row">
              <div className="details-poster-column">
                <div className="details-poster"><img src={movie.poster} alt={`${movie.title} poster`} onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80'; }}/></div>
                <button className="outline-btn trailer-button" type="button" onClick={() => setTrailerOpen(true)}><span className="trailer-play" aria-hidden="true">▶</span> Watch Trailer</button>
              </div>
              <div className="details-copy">
                <span className="details-eyebrow">MOVIE DETAILS</span>
                <h1>{movie.title}</h1>
                <div className="details-rating"><span className="rating-star">★</span><strong>{(movie.rating * 2).toFixed(1)}<small>/10</small></strong><span className="rating-votes">{details.votes}</span><button type="button" onClick={() => showToast('Rating is coming soon.')}>Rate Now <span>↗</span></button></div>
                <div className="details-meta"><span>{movie.duration}</span><i/><span>{movie.genre}</span><i/><span>{details.certification}</span><i/><span>{movie.releaseDate}</span></div>
                <div className="details-badges"><div className="format-badges">{details.formats.map((format) => <span key={format}>{format}</span>)}</div><span className="language-badge">{movie.language}</span></div>
                <p className="details-blurb">{movie.blurb}</p>
                <div className="details-actions"><Link className="primary-btn details-book" to={`/movie/${movie.id}/showtimes`}>Book Tickets <span>↗</span></Link><button className="outline-btn share-button" type="button" onClick={shareMovie}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.1"/></svg> Share</button></div>
              </div>
            </div>
          </div>
        </section>

        <div className="details-content">
          <section className="details-about">
            <div className="section-heading"><div><span className="section-kicker">THE STORY SO FAR</span><h2>About the Movie<span>.</span></h2></div></div>
            <p>{details.description}</p>
          </section>
          <section className="details-facts" aria-label="Movie information">
            <div><span>DIRECTOR</span><strong>{details.director}</strong></div>
            <div><span>CAST</span><strong>{details.cast.join(', ')}</strong></div>
            <div><span>LANGUAGE</span><strong>{movie.language}</strong></div>
            <div><span>GENRE</span><strong>{movie.genre}</strong></div>
            <div><span>RELEASE</span><strong>{movie.releaseDate}</strong></div>
          </section>
        </div>
      </main>
      {trailerOpen && <div className="trailer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTrailerOpen(false); }}><section className="trailer-modal" role="dialog" aria-modal="true" aria-labelledby="trailer-title"><button className="modal-close" type="button" aria-label="Close trailer dialog" onClick={() => setTrailerOpen(false)}>×</button><span className="modal-play">▶</span><h2 id="trailer-title">Trailer coming soon</h2><p>The trailer for {movie.title} will be available here.</p></section></div>}
    </>}
    {toast && <div className="toast-message" role="status"><span>✦</span>{toast}</div>}
  </div>;
}

export default MovieDetails;
