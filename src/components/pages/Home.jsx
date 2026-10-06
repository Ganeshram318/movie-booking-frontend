import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroMovies, movies } from '../../data/movies';
import './Home.css';

const categories = [
  ['✦', 'Action', 'adventure'], ['☻', 'Comedy', 'comedy'], ['♡', 'Romance', 'romance'], ['◈', 'Drama', 'drama'],
  ['◉', 'Thriller', 'thriller'], ['☾', 'Horror', 'horror'], ['✧', 'Animation', 'animation'], ['⌁', 'Adventure', 'adventure'],
];
const theatres = [['PVR Cinemas', 'Phoenix Palladium · Lower Parel', '4.8', '12 screens'], ['INOX', 'R City Mall · Ghatkopar', '4.6', '9 screens'], ['Cinépolis', 'Nexus Seawoods · Nerul', '4.7', '10 screens'], ['Miraj Cinemas', 'Wadala Truck Terminal · Wadala', '4.4', '6 screens'], ['Metro INOX', 'Marine Lines · South Mumbai', '4.9', '4 screens']];
const offers = [['FIRST FRAME', 'Your first movie night, on us.', 'Get ₹150 off your first booking', 'WELCOME150', '✦'], ['WEEKEND PLANS', 'Make Saturday a little bigger.', 'Save 20% on weekend shows', 'WEEKEND20', '◷'], ['THE PERFECT PAIR', 'A great film deserves great snacks.', 'Movie + snacks from ₹499', 'COMBO499', '♨'], ['STUDENT CUT', 'Big-screen moments. Smaller prices.', 'Up to 25% off with student ID', 'STUDENT25', '✳']];
const languages = ['All', 'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi'];
const genres = ['All', 'Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Horror'];

function Icon({ children }) { return <span className="seat-icon" aria-hidden="true">{children}</span>; }

function Header({ query, setQuery }) {
  const [city, setCity] = useState('Mumbai');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);
  return <header className={`seat-header ${scrolled ? 'scrolled' : ''}`}><div className="header-inner">
    <a href="#top" className="brand"><img className="brand-mark-img" src="/assets/seatify-logo.png" alt="" aria-hidden="true" /><span className="brand-name">SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span></a>
    <label className="search-box"><Icon><svg viewBox="0 0 24 24" focusable="false"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.3 4.3"/></svg></Icon><input aria-label="Search movies, theatres, and events" placeholder="Search movies, theatres, events..." value={query} onChange={(e) => setQuery(e.target.value)} /><kbd>⌘ K</kbd></label>
    <div className="header-actions"><label className="city-picker"><Icon><svg viewBox="0 0 24 24" focusable="false"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></svg></Icon><select aria-label="Choose city" value={city} onChange={(e) => setCity(e.target.value)}>{['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map((place) => <option key={place}>{place}</option>)}</select><span><svg viewBox="0 0 16 16" focusable="false"><path d="m4 6 4 4 4-4"/></svg></span></label><Link className="sign-in" to="/login">Sign in <span>↗</span></Link></div>
    <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="seatify-navigation"><span/><span/><span/></button>
  </div><nav id="seatify-navigation" aria-label="Main navigation" className={`nav-row ${menuOpen ? 'open' : ''}`}><div className="nav-links">{['Movies', 'Theatres', 'Events', 'Offers', 'My Bookings'].map((item, i) => <a key={item} className={i === 0 ? 'selected' : ''} href={i === 3 ? '#offers' : i === 1 ? '#theatres' : '#movies'} onClick={() => setMenuOpen(false)}>{item}</a>)}</div><span className="nav-note"><i/> CURATED FOR YOUR CITY</span></nav></header>;
}

function Hero({ onBook }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const movie = heroMovies[active];
  useEffect(() => { if (paused) return undefined; const timer = setInterval(() => setActive((n) => (n + 1) % heroMovies.length), 6500); return () => clearInterval(timer); }, [paused]);
  const move = (step) => setActive((active + step + heroMovies.length) % heroMovies.length);
  return <section className="hero-shell" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><div className="hero-backdrop" key={movie.id} style={{ backgroundImage: `url(${movie.banner})` }}/><div className="hero-shade"/><div className="hero-content" key={`content-${movie.id}`}><div className="hero-copy"><div className="eyebrow"><i/>{movie.tag}</div><h1>{movie.title}</h1><div className="hero-meta"><span>{movie.genre}</span><b>·</b><span>{movie.language}</span><b>·</b><span>{movie.duration}</span></div><p>{movie.blurb}</p><div className="hero-rating"><span>★</span> {movie.rating} <i/> <small>SEATIFY PICK</small></div><div className="hero-buttons"><button onClick={() => onBook(movie)} className="primary-btn">BOOK TICKETS <span>↗</span></button><a className="outline-btn" href="#movies"><span className="play-icon">▶</span> EXPLORE FILM</a></div></div><div className="hero-poster"><img src={movie.poster} alt={`${movie.title} poster`}/><span>NOW SHOWING</span></div></div><div className="hero-controls"><button onClick={() => move(-1)} aria-label="Previous movie">←</button><div className="hero-dots">{heroMovies.map((m, i) => <button key={m.id} aria-label={`Show ${m.title}`} className={i === active ? 'on' : ''} onClick={() => setActive(i)}/>)}</div><button onClick={() => move(1)} aria-label="Next movie">→</button><span className="slide-count">0{active + 1}<i/>0{heroMovies.length}</span></div><div className="hero-vertical">A BETTER NIGHT OUT</div></section>;
}

function MovieCard({ movie, upcoming = false, onNotify, onBook }) {
  return <article className="movie-card"><div className="poster-wrap"><img loading="lazy" src={movie.poster} alt={`${movie.title} poster`} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'; }}/><div className="poster-overlay"/><span className="rating-chip">★ {movie.rating}</span><button className="quick-book" onClick={() => upcoming ? onNotify(movie) : onBook(movie)}>{upcoming ? 'NOTIFY ME' : 'BOOK NOW'} <span>↗</span></button><span className="card-duration">{upcoming ? `COMING ${movie.releaseDate.toUpperCase()}` : movie.duration}</span></div><div className="movie-info"><h3>{movie.title}</h3><p>{movie.language} <i/> {movie.genre}</p></div></article>;
}

function MovieSection({ title, subtitle, list, upcoming, onNotify, onBook }) {
  return <section className="content-section"><div className="section-heading"><div><span className="section-kicker">{subtitle}</span><h2>{title}<span>.</span></h2></div><a className="text-link" href="#now-showing">VIEW ALL <b>↗</b></a></div><div className="movie-grid">{list.map((movie) => <MovieCard key={movie.id} movie={movie} upcoming={upcoming} onNotify={onNotify} onBook={onBook}/>)}</div></section>;
}

function Home() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('All');
  const [genre, setGenre] = useState('All');
  const [rating, setRating] = useState('All');
  const [toast, setToast] = useState('');
  const [showAll, setShowAll] = useState(false);
  const notify = (movie) => { setToast(`Reminder set for ${movie.title}!`); window.setTimeout(() => setToast(''), 2800); };
  const searchFiltered = useMemo(() => movies.filter((m) => `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const nowShowing = searchFiltered.filter((m) => m.releaseDate === 'Now showing' && (language === 'All' || m.language === language) && (genre === 'All' || m.genre === genre) && (rating === 'All' || m.rating >= Number(rating)));
  const recommended = (query ? searchFiltered : movies.slice(0, 5));
  const upcoming = searchFiltered.filter((m) => m.releaseDate !== 'Now showing');
  const book = (movie) => { setToast(`${movie.title} selected · booking coming soon`); window.setTimeout(() => setToast(''), 2800); };
  return <div className="seatify-app" id="top"><Header query={query} setQuery={setQuery}/><main><Hero onBook={book}/><div className="home-main">
    <section className="content-section recommended-section" id="movies"><div className="section-heading"><div><span className="section-kicker">HANDPICKED FOR YOU</span><h2>Recommended<span>.</span></h2></div><a className="text-link" href="#now-showing">VIEW ALL <b>↗</b></a></div><div className="movie-grid">{recommended.slice(0, showAll ? 10 : 5).map((movie) => <MovieCard key={movie.id} movie={movie} upcoming={movie.releaseDate !== 'Now showing'} onNotify={notify} onBook={book}/>)}</div></section>
    <section className="content-section showing-section" id="now-showing"><div className="section-heading"><div><span className="section-kicker">IN CINEMAS RIGHT NOW</span><h2>Now Showing<span>.</span></h2></div><button className="text-link view-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'SHOW LESS' : 'VIEW ALL'} <b>↗</b></button></div><div className="filter-bar"><span className="filter-label">FIND YOUR FILM</span><label>LANGUAGE<select value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((v) => <option key={v}>{v}</option>)}</select></label><label>GENRE<select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((v) => <option key={v}>{v}</option>)}</select></label><label>RATING<select value={rating} onChange={(e) => setRating(e.target.value)}>{['All', '4+', '3+'].map((v) => <option key={v}>{v}</option>)}</select></label><span className="result-count">{nowShowing.length} FILMS</span></div>{nowShowing.length ? <div className="movie-grid">{nowShowing.slice(0, showAll ? 10 : 5).map((movie) => <MovieCard key={movie.id} movie={movie} onBook={book} onNotify={notify}/>)}</div> : <div className="empty-state">No films match those filters. Try another combination.</div>}</section>
    {upcoming.length > 0 && <MovieSection title="Coming Soon" subtitle="MARK YOUR CALENDAR" list={upcoming} upcoming onNotify={notify} onBook={book}/>}
    <section className="content-section category-section"><div className="section-heading"><div><span className="section-kicker">WHAT ARE YOU IN THE MOOD FOR?</span><h2>Pick a feeling<span>.</span></h2></div></div><div className="category-grid">{categories.map(([icon, name, style]) => <button key={name} className={`category-card ${style}`} onClick={() => { setGenre(genres.includes(name) ? name : 'All'); document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' }); }}><span>{icon}</span><b>{name}</b><i>↗</i></button>)}</div></section>
    <section className="theatre-section" id="theatres"><div className="section-heading"><div><span className="section-kicker">YOUR CITY, BIG SCREEN</span><h2>Local favourites<span>.</span></h2></div><a className="text-link" href="#theatres">EXPLORE VENUES <b>↗</b></a></div><div className="theatre-grid">{theatres.map(([name, location, stars, screens], i) => <article className="theatre-card" key={name}><div className={`theatre-avatar t${i}`}><span>{name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span></div><div className="theatre-detail"><h3>{name}</h3><p>{location}</p><div><span>★ {stars}</span><i/> {screens}</div></div><span className="theatre-arrow">↗</span></article>)}</div></section>
    <section className="content-section offer-section" id="offers"><div className="section-heading"><div><span className="section-kicker">A LITTLE EXTRA MAGIC</span><h2>Made for movie nights<span>.</span></h2></div><a className="text-link" href="#offers">ALL OFFERS <b>↗</b></a></div><div className="offer-grid">{offers.map(([tag, title, desc, code, icon], i) => <article className={`offer-card offer-${i}`} key={code}><div className="offer-top"><span>{tag}</span><b>{icon}</b></div><h3>{title}</h3><p>{desc}</p><button onClick={() => { setToast(`Use code ${code} at checkout`); window.setTimeout(() => setToast(''), 2800); }}>REVEAL OFFER <span>↗</span></button><small>{code}</small></article>)}</div></section>
  </div></main><footer className="seat-footer"><div className="footer-main"><div className="footer-about"><a className="brand" href="#top"><img className="brand-mark-img" src="/assets/seatify-logo.png" alt="" aria-hidden="true" /><span className="brand-name">SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span></a><p>Your Seat. Your Movie.<br/>Your Experience.</p><span className="footer-note">MADE FOR THE LOVE OF CINEMA <i>✦</i></span></div><div className="footer-col"><b>EXPLORE</b><a href="#movies">Movies</a><a href="#theatres">Theatres</a><a href="#offers">Offers</a><a href="#top">Events</a></div><div className="footer-col"><b>THE DETAILS</b><a href="#top">About us</a><a href="#top">Contact</a><a href="#top">Help & support</a><a href="#top">Terms & privacy</a></div><div className="footer-social"><b>FOLLOW THE STORY</b><p>For the scenes that stay with you.</p><div>{['ig', 'f', '▶', 'in'].map((social) => <a key={social} href="#top" aria-label={`Seatify ${social}`}>{social}</a>)}</div></div></div><div className="footer-bottom"><span>© 2026 SEATIFY. ALL RIGHTS RESERVED.</span><span>MADE WITH <i>♥</i> AND A LITTLE MOVIE MAGIC</span></div></footer>{toast && <div className="toast-message"><span>✦</span>{toast}</div>}</div>;
}

export default Home;
