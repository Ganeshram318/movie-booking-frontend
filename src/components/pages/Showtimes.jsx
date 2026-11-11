import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { fetchMovie, fetchShowtimesByMovie, formatCurrency, formatTime, isUpcoming, parseDate, parseId, showStartsAt, toDateKey, FALLBACK_POSTER } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/Showtimes.css'

const BASE_DAYS = 7;
const FAST_FILLING_RATIO = 0.2;

function toDay(date) {
  return {
    value: toDateKey(date),
    weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date).toUpperCase(),
    day: date.getDate(), month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase(),
  };
}

// The next seven days plus any later dates that have shows
function buildDays(shows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys = new Set(Array.from({ length: BASE_DAYS }, (_, index) => toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + index))));
  shows.forEach((show) => keys.add(show.showDate));
  return [...keys].sort().map((key) => toDay(parseDate(key)));
}

function getHour(time) {
  return Number(String(time).split(':')[0]) || 0;
}

function getAvailability(show) {
  const available = show.availableSeats ?? show.totalSeats;
  if (available <= 0) return 'SOLD OUT';
  if (show.totalSeats && available / show.totalSeats <= FAST_FILLING_RATIO) return 'FAST FILLING';
  return 'AVAILABLE';
}

function getInitials(name) {
  return String(name || '').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

function Showtimes() {
  const { id } = useParams();
  const movieId = parseId(id);
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [result, setResult] = useState({ key: null, status: 'loading' });
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [date, setDate] = useState(null);
  const [language, setLanguage] = useState('All languages');
  const [format, setFormat] = useState('All formats');
  const [price, setPrice] = useState('Any price');
  const [time, setTime] = useState('Any time');
  const [availability, setAvailability] = useState('Any availability');
  const [sort, setSort] = useState('Recommended');
  const [lateNight, setLateNight] = useState(false);
  const [earlyMorning, setEarlyMorning] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set());
  const [selectedShow, setSelectedShow] = useState(null);

  const requestKey = `${movieId}:${reloadKey}`;
  const status = !movieId ? 'not-found' : result.key !== requestKey ? 'loading' : result.status;

  useEffect(() => {
    if (!movieId) {
      return undefined;
    }
    let active = true;
    const finish = (value) => setResult({ key: requestKey, status: value });
    Promise.all([fetchMovie(movieId), fetchShowtimesByMovie(movieId)])
      .then(([movieData, showData]) => {
        if (!active) return;
        const upcoming = showData.filter((show) => isUpcoming(show));
        setMovie(movieData);
        setShows(upcoming);
        setDate((current) => current ?? (upcoming.length ? [...upcoming].sort((a, b) => showStartsAt(a) - showStartsAt(b))[0].showDate : toDateKey(new Date())));
        finish('ready');
      })
      .catch((error) => {
        if (!active) return;
        setMovie(null);
        if (error.response?.status === 404) {
          finish('not-found');
        } else {
          setErrorMessage(getErrorMessage(error, 'Unable to load showtimes.'));
          finish('error');
        }
      });
    return () => { active = false; };
  }, [movieId, requestKey]);

  const days = useMemo(() => buildDays(shows), [shows]);
  const selectedDate = date ?? days[0]?.value;
  const monthLabel = selectedDate ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(parseDate(selectedDate)).toUpperCase() : '';
  const showsForDate = useMemo(() => shows.filter((show) => show.showDate === selectedDate), [shows, selectedDate]);
  const languages = useMemo(() => [...new Set(shows.map((show) => show.language).filter(Boolean))], [shows]);
  const formats = useMemo(() => [...new Set(shows.map((show) => show.format).filter(Boolean))], [shows]);
  const cities = useMemo(() => [...new Set(shows.map((show) => show.theatreCity).filter(Boolean))], [shows]);

  const filteredTheatres = useMemo(() => {
    const matching = showsForDate.filter((show) => {
      const hour = getHour(show.startTime);
      const showPrice = Number(show.ticketPrice) || 0;
      const timeMatches = time === 'Any time' || (time === 'Morning' && hour < 12) || (time === 'Afternoon' && hour >= 12 && hour < 17) || (time === 'Evening' && hour >= 17 && hour < 21) || (time === 'Night' && hour >= 21);
      const priceMatches = price === 'Any price' || (price === '₹100–₹200' && showPrice >= 100 && showPrice <= 200) || (price === '₹200–₹300' && showPrice > 200 && showPrice <= 300) || (price === '₹300+' && showPrice > 300);
      const availabilityMatches = availability === 'Any availability' || getAvailability(show) === availability.toUpperCase();
      const lateMatches = !lateNight || hour >= 22 || hour < 4;
      const earlyMatches = !earlyMorning || (hour >= 5 && hour < 10);
      return (city === 'All cities' || show.theatreCity === city) && (language === 'All languages' || show.language === language) && (format === 'All formats' || show.format === format) && priceMatches && timeMatches && availabilityMatches && lateMatches && earlyMatches;
    });

    const byTheatre = new Map();
    matching.forEach((show) => {
      if (!byTheatre.has(show.theatreId)) {
        byTheatre.set(show.theatreId, { id: show.theatreId, name: show.theatreName, location: [show.theatreAddress, show.theatreCity].filter(Boolean).join(', '), initials: getInitials(show.theatreName), shows: [] });
      }
      byTheatre.get(show.theatreId).shows.push(show);
    });
    const result = [...byTheatre.values()];
    result.forEach((theatre) => theatre.shows.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))));

    if (sort === 'Recommended') result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort === 'Earliest') result.sort((a, b) => String(a.shows[0].startTime).localeCompare(String(b.shows[0].startTime)));
    if (sort === 'Lowest price') result.sort((a, b) => Math.min(...a.shows.map((show) => Number(show.ticketPrice))) - Math.min(...b.shows.map((show) => Number(show.ticketPrice))));
    return result;
  }, [showsForDate, city, language, format, price, time, availability, lateNight, earlyMorning, sort]);

  const listingPlace = city !== 'All cities' ? `in ${city}` : cities.length === 1 ? `in ${cities[0]}` : 'across all cities';
  const visibleSelectedShow = filteredTheatres.flatMap((theatre) => theatre.shows).find((show) => show.id === selectedShow?.id);
  const changeCity = (value) => { setCity(value); setSelectedShow(null); };
  const changeFilter = (setter) => (event) => { setter(event.target.value); setSelectedShow(null); };

  const toggleFavorite = (theatreId) => setFavorites((current) => {
    const next = new Set(current);
    if (next.has(theatreId)) next.delete(theatreId); else next.add(theatreId);
    return next;
  });

  return <div className="seatify-app showtimes-page">
    <Header query={query} setQuery={setQuery} city={city} setCity={changeCity} cities={cities}/>
    {status === 'loading' ? <main className="showtimes-not-found"><span className="section-kicker">SEATIFY SHOWTIMES</span><h1>Loading showtimes...</h1><p>Finding shows for this movie.</p></main>
    : status === 'error' ? <main className="showtimes-not-found"><span className="section-kicker">SEATIFY SHOWTIMES</span><h1>Something went wrong</h1><p>{errorMessage}</p><button className="primary-btn" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try Again</button></main>
    : !movie ? <main className="showtimes-not-found"><span className="section-kicker">SEATIFY SHOWTIMES</span><h1>Movie not found</h1><p>We couldn't find a movie with that ID.</p><Link className="primary-btn" to="/">Back to Home</Link></main> : <main className="showtimes-main">
      <Link className="showtimes-back" to={`/movie/${movie.id}`}>← <span>Back to Movie</span></Link>
      <section className="showtimes-movie-heading">
        <div className="showtimes-poster"><img src={movie.poster} alt="" onError={(event) => { event.currentTarget.src = FALLBACK_POSTER; }}/></div>
        <div className="showtimes-movie-copy"><span className="section-kicker">NOW SHOWING NEAR YOU</span><h1>{movie.title}</h1>
          <div className="showtimes-metadata">{movie.duration && <><span>{movie.duration}</span><i/></>}{movie.genre.split(',').filter((item) => item.trim()).map((item) => <span key={item}>{item.trim()}</span>)}{movie.certification && <b>{movie.certification}</b>}{movie.language && <b>{movie.language}</b>}</div>
          <p>Choose a date and find your perfect seat at a cinema near you.</p>
        </div>
        <div className="showtimes-city"><span>SHOWING IN</span><strong>⌖ &nbsp;{cities.length ? (cities.length > 2 ? `${cities.length} cities` : cities.join(', ')) : 'No cities yet'}</strong></div>
      </section>

      <div className="showtimes-control-panel">
      <section className="showtimes-date-section" aria-label="Choose a date"><div className="showtimes-section-top"><div><span className="section-kicker">PICK YOUR DAY</span><h2>Choose a date</h2></div><span className="showtimes-month">{monthLabel}</span></div>
        <div className="showtimes-dates">{days.map((day) => <button className={`showtimes-date ${selectedDate === day.value ? 'is-active' : ''}`} key={day.value} type="button" onClick={() => { setDate(day.value); setSelectedShow(null); }}><span>{day.weekday}</span><strong>{day.day}</strong><span>{day.month}</span></button>)}</div>
      </section>

      <section className="showtimes-filters" aria-label="Filter showtimes">
        {cities.length > 1 && <label>City<select value={city} onChange={changeFilter(setCity)}><option>All cities</option>{[...new Set([...cities, city].filter((item) => item !== 'All cities'))].map((item) => <option key={item}>{item}</option>)}</select></label>}
        <label>Language<select value={language} onChange={changeFilter(setLanguage)}><option>All languages</option>{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
        {formats.length > 0 && <label>Format<select value={format} onChange={changeFilter(setFormat)}><option>All formats</option>{formats.map((item) => <option key={item}>{item}</option>)}</select></label>}
        <label>Price range<select value={price} onChange={changeFilter(setPrice)}><option>Any price</option><option>₹100–₹200</option><option>₹200–₹300</option><option>₹300+</option></select></label>
        <label>Preferred time<select value={time} onChange={changeFilter(setTime)}>{['Any time', 'Morning', 'Afternoon', 'Evening', 'Night'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Availability<select value={availability} onChange={changeFilter(setAvailability)}>{['Any availability', 'Available', 'Fast filling'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Sort by<select value={sort} onChange={changeFilter(setSort)}>{['Recommended', 'Earliest', 'Lowest price'].map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>
      </div>

      <section className="showtimes-listing">
        <div className="showtimes-listing-top"><div><span className="section-kicker">YOUR CINEMA OPTIONS</span><h2>{filteredTheatres.length} {filteredTheatres.length === 1 ? 'theatre' : 'theatres'} <span>{listingPlace}</span></h2></div>
          <div className="showtimes-quick-filters"><button type="button" className={lateNight ? 'is-active' : ''} onClick={() => { setLateNight(!lateNight); setEarlyMorning(false); setSelectedShow(null); }}>☾ Late night</button><button type="button" className={earlyMorning ? 'is-active' : ''} onClick={() => { setEarlyMorning(!earlyMorning); setLateNight(false); setSelectedShow(null); }}>☀ Early morning</button></div>
        </div>
        <div className="showtimes-legend"><span><i className="legend-available"/>Available</span><span><i className="legend-fast"/>Fast filling</span><span><i className="legend-sold"/>Sold out</span></div>
        <div className="showtimes-theatres">{filteredTheatres.map((theatre) => <article className="showtimes-theatre" key={theatre.id}>
          <div className="theatre-heading"><div className="theatre-logo" aria-hidden="true">{theatre.initials}</div><div className="theatre-title"><h3>{theatre.name}</h3><p>{theatre.location}</p></div>
            <button className={`theatre-favorite ${favorites.has(theatre.id) ? 'is-favorite' : ''}`} type="button" aria-label={favorites.has(theatre.id) ? 'Remove theatre from favourites' : 'Add theatre to favourites'} onClick={() => toggleFavorite(theatre.id)}>{favorites.has(theatre.id) ? '♥' : '♡'}</button></div>
          <div className="theatre-showtimes">{theatre.shows.map((show) => { const showAvailability = getAvailability(show); const isSelected = selectedShow?.id === show.id; return <button key={show.id} type="button" disabled={showAvailability === 'SOLD OUT'} aria-pressed={isSelected} className={`showtime-choice show-${showAvailability.toLowerCase().replace(' ', '-')} ${isSelected ? 'is-selected' : ''}`} onClick={() => setSelectedShow(show)}><strong>{formatTime(show.startTime)}</strong><span>{[show.format, `Screen ${show.screenNumber}`, formatCurrency(show.ticketPrice)].filter(Boolean).join(' · ')}</span><small>{showAvailability === 'SOLD OUT' ? 'Sold out' : `${show.availableSeats} seats left`}</small></button>; })}</div>
        </article>)}</div>
        {!filteredTheatres.length && <div className="showtimes-empty"><span>⌕</span><h3>{!shows.length ? 'No upcoming shows for this movie yet' : !showsForDate.length ? 'No shows on this date' : 'No shows available for the selected filters'}</h3><p>{!shows.length ? 'Please check back later.' : !showsForDate.length ? 'Pick another date to see available showtimes.' : 'Try changing your filters to see more showtimes.'}</p>{showsForDate.length > 0 && <button type="button" onClick={() => { setCity('All cities'); setSelectedShow(null); setLanguage('All languages'); setFormat('All formats'); setPrice('Any price'); setTime('Any time'); setAvailability('Any availability'); setLateNight(false); setEarlyMorning(false); }}>Clear filters</button>}</div>}
      </section>
      {visibleSelectedShow && <aside className="showtimes-selection" aria-live="polite"><div><span className="section-kicker">YOUR SELECTED SHOW</span><strong>{visibleSelectedShow.theatreName}</strong><span>{[formatTime(visibleSelectedShow.startTime), visibleSelectedShow.format, formatCurrency(visibleSelectedShow.ticketPrice)].filter(Boolean).join(' · ')}</span></div><Link className="primary-btn" to={`/movie/${movie.id}/showtimes/${visibleSelectedShow.id}/seats`}>Select Seats <span>→</span></Link></aside>}
    </main>}
  </div>;
}

export default Showtimes;
