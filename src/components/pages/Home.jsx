import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchMovies, fetchTheatres, FALLBACK_POSTER, FALLBACK_BANNER } from '../../services/seatify';

import '../../styles/Home.css'
import { getErrorMessage } from '../../api';

const categories = [
  ['✦', 'Action', 'adventure'], ['☻', 'Comedy', 'comedy'], ['♡', 'Romance', 'romance'], ['◈', 'Drama', 'drama'],
  ['◉', 'Thriller', 'thriller'], ['☾', 'Horror', 'horror'], ['✧', 'Animation', 'animation'], ['⌁', 'Adventure', 'adventure'],
];
const offers = [['FIRST FRAME', 'Your first movie night, on us.', 'Get ₹150 off your first booking', 'WELCOME150', '✦'], ['WEEKEND PLANS', 'Make Saturday a little bigger.', 'Save 20% on weekend shows', 'WEEKEND20', '◷'], ['THE PERFECT PAIR', 'A great film deserves great snacks.', 'Movie + snacks from ₹499', 'COMBO499', '♨'], ['STUDENT CUT', 'Big-screen moments. Smaller prices.', 'Up to 25% off with student ID', 'STUDENT25', '✳']];
const defaultLanguages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi'];
const defaultGenres = ['Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Horror'];
const ratingOptions = ['All', '8+', '7+', '5+'];
const withBackendValues = (defaults, values) => ['All', ...new Set([...defaults, ...values.filter(Boolean)])];
const MAX_HERO_MOVIES = 5;

function Icon({ children }) { return <span className="seat-icon" aria-hidden="true">{children}</span>; }

function NavIcon({ name }) {
  const icons = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    movies: <><path d="M4 4h16v16H4zM4 9h16M9 4l3 5m3-5 3 5M9 9l3 5m3-5 3 5" /></>,
    theatres: <><path d="M3 21h18M5 21V5l7-3 7 3v16M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-4h4v4" /></>,
    events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2m4 0h2" /></>,
    offers: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1 0-2.8l7.2-7.2A2 2 0 0 1 12 3h7a2 2 0 0 1 2 2v7a2 2 0 0 1-.4 1.4Z" /><circle cx="16" cy="8" r="1" /></>,
    bookings: <><path d="M4 6a2 2 0 0 0 0 4v4a2 2 0 0 0 0 4h16a2 2 0 0 0 0-4v-4a2 2 0 0 0 0-4H4Z" /><path d="M13 6v2m0 3v2m0 3v2" /></>,
  };
  return <span className="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg></span>;
}

export function Header({ query, setQuery, city: selectedCity, setCity: setSelectedCity }) {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [localCity, setLocalCity] = useState('Mumbai');
  const city = selectedCity ?? localCity;
  const setCity = setSelectedCity ?? setLocalCity;
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);
  return <header className={`seat-header ${scrolled ? 'scrolled' : ''}`}><div className="header-inner">
    <a href="#top" className="brand"><img className="brand-mark-img" src="/assets/seatify-logo.png" alt="" aria-hidden="true" /><span className="brand-name">SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span></a>
    <label className="search-box"><Icon><svg viewBox="0 0 24 24" focusable="false"><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.3 4.3" /></svg></Icon><input aria-label="Search movies, theatres, and events" placeholder="Search movies, theatres, events..." value={query} onChange={(e) => setQuery(e.target.value)} /><kbd>⌘ K</kbd></label>
    <div className="header-actions"><label className="city-picker" onClick={(event) => { if (event.target.tagName !== 'SELECT') { event.preventDefault(); const select = event.currentTarget.querySelector('select'); if (typeof select?.showPicker === 'function') select.showPicker(); else select?.click(); } }}><Icon><svg viewBox="0 0 24 24" focusable="false"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></svg></Icon><select aria-label="Choose city" value={city} onChange={(e) => setCity(e.target.value)}>{['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map((place) => <option key={place}>{place}</option>)}</select><span><svg viewBox="0 0 16 16" focusable="false"><path d="m4 6 4 4 4-4" /></svg></span></label>{user ? <div className="account-control"><button className="sign-in account-button" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>{user.firstName || user.email}<span>⌄</span></button>{accountOpen && <div className="account-dropdown"><strong>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</strong><button type="button" onClick={() => setAccountOpen(false)}>My Profile</button><Link to="/bookings" onClick={() => setAccountOpen(false)}>My Bookings</Link>{isAdmin && <Link to="/admin/movies" onClick={() => setAccountOpen(false)}>Admin Panel</Link>}{isAdmin && <hr />}<button type="button" onClick={() => { logout(); setAccountOpen(false); navigate('/'); }}>Logout</button></div>}</div> : <Link className="sign-in" to="/login">Sign in <span>↗</span></Link>}</div>
    <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="seatify-navigation"><span /><span /><span /></button>
  </div><nav id="seatify-navigation" aria-label="Main navigation" className={`nav-row ${menuOpen ? 'open' : ''}`}><div className="nav-links"><Link to="/" onClick={() => setMenuOpen(false)}><NavIcon name="home" />Home</Link>{[
    ['Movies', 'movies', '#movies', true],
    ['Theatres', 'theatres', '#theatres', false],
    ['Events', 'events', '#movies', false],
    ['Offers', 'offers', '#offers', false],
    ['My Bookings', 'bookings', '/bookings', false],
  ].map(([item, icon, href, selected]) => href.startsWith('/') ? <Link key={item} className={selected ? 'selected' : ''} to={href} onClick={() => setMenuOpen(false)}><NavIcon name={icon} />{item}</Link> : <a key={item} className={selected ? 'selected' : ''} href={href} onClick={() => setMenuOpen(false)}><NavIcon name={icon} />{item}</a>)}{isAdmin && <Link to="/admin/movies" onClick={() => setMenuOpen(false)}><NavIcon name="movies" />Admin Dashboard</Link>}</div><span className="nav-note"><i /> CURATED FOR YOUR CITY</span></nav></header>;
}

function Hero({ onBook, heroMovies, status }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = active < heroMovies.length ? active : 0;
  const movie = heroMovies[current];
  useEffect(() => { if (paused || heroMovies.length < 2) return undefined; const timer = setInterval(() => setActive((n) => (n + 1) % heroMovies.length), 6500); return () => clearInterval(timer); }, [paused, heroMovies.length]);
  if (!movie) return <section className="hero-shell"><div className="hero-backdrop" style={{ backgroundImage: `url(${FALLBACK_BANNER})` }} /><div className="hero-shade" /><div className="hero-content"><div className="hero-copy"><div className="eyebrow"><i />SEATIFY</div><h1>{status === 'loading' ? 'Loading movies...' : status === 'error' ? 'Movies unavailable' : 'No movies yet'}</h1><p>{status === 'loading' ? 'Fetching what is playing near you.' : status === 'error' ? 'We could not load movies right now. Please try again shortly.' : 'New movies will appear here once they are added.'}</p></div></div></section>;
  const move = (step) => setActive((current + step + heroMovies.length) % heroMovies.length);
  return <section className="hero-shell" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><div className="hero-backdrop" key={movie.id} style={{ backgroundImage: `url(${movie.banner})` }} /><div className="hero-shade" /><div className="hero-content" key={`content-${movie.id}`}><div className="hero-copy"><div className="eyebrow"><i />{movie.tag}</div><h1>{movie.title}</h1><div className="hero-meta"><span>{movie.genre}</span><b>·</b><span>{movie.language}</span><b>·</b><span>{movie.duration}</span></div><p>{movie.blurb}</p>{movie.ratingLabel && <div className="hero-rating"><span>★</span> {movie.ratingLabel}/10 <i /> <small>{movie.featured ? 'SEATIFY PICK' : 'NOW BOOKING'}</small></div>}<div className="hero-buttons"><button onClick={() => onBook(movie)} className="primary-btn">BOOK TICKETS <span>↗</span></button><a className="outline-btn" href="#movies"><span className="play-icon">▶</span> EXPLORE FILM</a></div></div><div className="hero-poster"><img src={movie.poster} alt={`${movie.title} poster`} onError={(e) => { e.currentTarget.src = FALLBACK_POSTER; }} /></div></div><div className="hero-controls"><button onClick={() => move(-1)} aria-label="Previous movie">←</button><div className="hero-dots">{heroMovies.map((m, i) => <button key={m.id} aria-label={`Show ${m.title}`} className={i === current ? 'on' : ''} onClick={() => setActive(i)} />)}</div><button onClick={() => move(1)} aria-label="Next movie">→</button><span className="slide-count">{String(current + 1).padStart(2, '0')}<i />{String(heroMovies.length).padStart(2, '0')}</span></div><div className="hero-vertical">A BETTER NIGHT OUT</div></section>;
}

function MovieCard({ movie, onBook }) {
  return <article className="movie-card"><div className="poster-wrap"><img loading="lazy" src={movie.poster} alt={`${movie.title} poster`} onError={(e) => { e.currentTarget.src = FALLBACK_POSTER; }} /><div className="poster-overlay" />{movie.ratingLabel && <span className="rating-chip">★ {movie.ratingLabel}</span>}<button className="quick-book" onClick={() => onBook(movie)}>BOOK NOW <span>↗</span></button>{movie.duration && <span className="card-duration">{movie.duration}</span>}</div><div className="movie-info"><h3>{movie.title}</h3><p>{movie.language} <i /> {movie.genre}</p></div></article>;
}

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('All');
  const [genre, setGenre] = useState('All');
  const [rating, setRating] = useState('All');
  const [toast, setToast] = useState('');
  const [showAll, setShowAll] = useState(false);
  // const searchFiltered = useMemo(() => localMovies.filter((m) => `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(query.toLowerCase())), [query]);


  const book = (movie) => navigate(`/movie/${movie.id}`);

  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [theatres, setTheatres] = useState([]);

  useEffect(() => {
    let active = true;
    fetchMovies()
      .then((data) => { if (active) { setMovies(data); setStatus('ready'); } })
      .catch((error) => { if (active) { console.error('Error fetching movies:', getErrorMessage(error)); setStatus('error'); } });
    fetchTheatres()
      .then((data) => { if (active) setTheatres(data); })
      .catch((error) => console.error('Error fetching theatres:', getErrorMessage(error)));
    return () => { active = false; };
  }, []);

  const heroMovies = useMemo(() => {
    const featured = movies.filter((m) => m.featured);
    return (featured.length ? featured : movies).slice(0, MAX_HERO_MOVIES);
  }, [movies]);
  const languages = useMemo(() => withBackendValues(defaultLanguages, movies.map((m) => m.language)), [movies]);
  const genres = useMemo(() => withBackendValues(defaultGenres, movies.map((m) => m.genre)), [movies]);

  const searchFiltered = useMemo(
    () =>
      movies.filter((m) =>
        `${m.title} ${m.genre} ${m.language}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [movies, query]
  );

const recommended = query
  ? searchFiltered
  : movies;

const availableMovies = searchFiltered.filter(
  (m) =>
    (language === 'All' || m.language === language) &&
    (genre === 'All' || m.genre === genre) &&
    (rating === 'All' || m.rating >= parseFloat(rating))
);

  return <div className="seatify-app" id="top"><Header query={query} setQuery={setQuery} /><main><Hero onBook={book} heroMovies={heroMovies} status={status} /><div className="home-main">
    <section className="content-section recommended-section" id="movies"><div className="section-heading"><div><span className="section-kicker">HANDPICKED FOR YOU</span><h2>Recommended<span>.</span></h2></div><a className="text-link" href="#available-movies">VIEW ALL <b>↗</b></a></div>{recommended.length ? <div className="movie-grid">{recommended.slice(0, showAll ? undefined : 5).map((movie) => <MovieCard key={movie.id} movie={movie} onBook={book} />)}</div> : <div className="empty-state">{status === 'loading' ? 'Loading movies...' : status === 'error' ? 'Movies could not be loaded. Please check your connection and try again.' : query ? 'No films match your search.' : 'No movies are available right now.'}</div>}</section>
    <section className="content-section showing-section" id="available-movies"><div className="section-heading"><div><span className="section-kicker">AVAILABLE FOR BOOKING</span><h2>Available Movies<span>.</span></h2></div><button className="text-link view-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'SHOW LESS' : 'VIEW ALL'} <b>↗</b></button></div><div className="filter-bar"><span className="filter-label">FIND YOUR FILM</span><label>LANGUAGE<select value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((v) => <option key={v}>{v}</option>)}</select></label><label>GENRE<select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((v) => <option key={v}>{v}</option>)}</select></label><label>RATING<select value={rating} onChange={(e) => setRating(e.target.value)}>{ratingOptions.map((v) => <option key={v}>{v}</option>)}</select></label><span className="result-count">{availableMovies.length} FILMS</span></div>{availableMovies.length ? <div className="movie-grid">{availableMovies.slice(0, showAll ? undefined : 5).map((movie) => <MovieCard key={movie.id} movie={movie} onBook={book} />)}</div> : <div className="empty-state">{status === 'loading' ? 'Loading movies...' : status === 'error' ? 'Movies could not be loaded.' : movies.length ? 'No films match those filters. Try another combination.' : 'No movies are available right now.'}</div>}</section>
    <section className="content-section category-section"><div className="section-heading"><div><span className="section-kicker">WHAT ARE YOU IN THE MOOD FOR?</span><h2>Pick a feeling<span>.</span></h2></div></div><div className="category-grid">{categories.map(([icon, name, style]) => <button key={name} className={`category-card ${style}`} onClick={() => { setGenre(genres.includes(name) ? name : 'All'); document.getElementById('available-movies')?.scrollIntoView({ behavior: 'smooth' }); }}><span>{icon}</span><b>{name}</b><i>↗</i></button>)}</div></section>
    <section className="theatre-section" id="theatres"><div className="section-heading"><div><span className="section-kicker">YOUR CITY, BIG SCREEN</span><h2>Local favourites<span>.</span></h2></div><a className="text-link" href="#theatres">EXPLORE VENUES <b>↗</b></a></div>{theatres.length ? <div className="theatre-grid">{theatres.slice(0, 6).map((theatre, i) => <article className="theatre-card" key={theatre.id}><div className={`theatre-avatar t${i % 6}`}><span>{String(theatre.name || '').split(' ').map((x) => x[0]).join('').slice(0, 2)}</span></div><div className="theatre-detail"><h3>{theatre.name}</h3><p>{[theatre.address, theatre.city].filter(Boolean).join(' · ')}</p><div>{theatre.totalscreens ? `${theatre.totalscreens} ${theatre.totalscreens === 1 ? 'screen' : 'screens'}` : ''}</div></div><span className="theatre-arrow">↗</span></article>)}</div> : <div className="empty-state">No theatres have been added yet.</div>}</section>
    <section className="content-section offer-section" id="offers"><div className="section-heading"><div><span className="section-kicker">A LITTLE EXTRA MAGIC</span><h2>Made for movie nights<span>.</span></h2></div><a className="text-link" href="#offers">ALL OFFERS <b>↗</b></a></div><div className="offer-grid">{offers.map(([tag, title, desc, code, icon], i) => <article className={`offer-card offer-${i}`} key={code}><div className="offer-top"><span>{tag}</span><b>{icon}</b></div><h3>{title}</h3><p>{desc}</p><button onClick={() => { setToast(`Use code ${code} at checkout`); window.setTimeout(() => setToast(''), 2800); }}>REVEAL OFFER <span>↗</span></button><small>{code}</small></article>)}</div></section>
  </div></main><footer className="seat-footer"><div className="footer-main"><div className="footer-about"><a className="brand" href="#top"><img className="brand-mark-img" src="/assets/seatify-logo.png" alt="" aria-hidden="true" /><span className="brand-name">SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span></a><p>Your Seat. Your Movie.<br />Your Experience.</p><span className="footer-note">MADE FOR THE LOVE OF CINEMA <i>✦</i></span></div><div className="footer-col"><b>EXPLORE</b><a href="#movies">Movies</a><a href="#theatres">Theatres</a><a href="#offers">Offers</a><a href="#top">Events</a></div><div className="footer-col"><b>THE DETAILS</b><a href="#top">About us</a><a href="#top">Contact</a><a href="#top">Help & support</a><a href="#top">Terms & privacy</a></div><div className="footer-social"><b>FOLLOW THE STORY</b><p>For the scenes that stay with you.</p><div>{['ig', 'f', '▶', 'in'].map((social) => <a key={social} href="#top" aria-label={`Seatify ${social}`}>{social}</a>)}</div></div></div><div className="footer-bottom"><span>© 2026 SEATIFY. ALL RIGHTS RESERVED.</span><span>MADE WITH <i>♥</i> AND A LITTLE MOVIE MAGIC</span></div></footer>{toast && <div className="toast-message"><span>✦</span>{toast}</div>}</div>;
}

export default Home;
