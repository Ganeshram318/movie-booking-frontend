import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { movies, movieDetails } from '../../data/movies';
import { theatres } from '../../data/showtimes';
import { Header } from './Home';
import '../../styles/Showtimes.css'

const days = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 9, 7 + index);
  return {
    value: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date).toUpperCase(),
    day: date.getDate(), month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase(),
  };
});

function getHour(time) {
  const [clock, period] = time.split(' ');
  let hour = Number(clock.split(':')[0]) % 12;
  if (period === 'PM') hour += 12;
  return hour;
}

function Showtimes() {
  const { id } = useParams();
  const movie = movies.find((item) => String(item.id) === id);
  const details = movie ? movieDetails[movie.id] : null;
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [date, setDate] = useState(days[0].value);
  const [language, setLanguage] = useState('All languages');
  const [format, setFormat] = useState('All formats');
  const [price, setPrice] = useState('Any price');
  const [time, setTime] = useState('Any time');
  const [availability, setAvailability] = useState('Any availability');
  const [sort, setSort] = useState('Recommended');
  const [lateNight, setLateNight] = useState(false);
  const [earlyMorning, setEarlyMorning] = useState(false);
  const [cancelable, setCancelable] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set());
  const [selectedShow, setSelectedShow] = useState(null);

  const filteredTheatres = useMemo(() => {
    const result = theatres.map((theatre) => {
      const shows = theatre.shows.filter((show) => {
        const hour = getHour(show.time);
        const timeMatches = time === 'Any time' || (time === 'Morning' && hour < 12) || (time === 'Afternoon' && hour >= 12 && hour < 17) || (time === 'Evening' && hour >= 17 && hour < 21) || (time === 'Night' && hour >= 21);
        const priceMatches = price === 'Any price' || (price === '₹100–₹200' && show.price >= 100 && show.price <= 200) || (price === '₹200–₹300' && show.price > 200 && show.price <= 300) || (price === '₹300+' && show.price > 300);
        const availabilityMatches = availability === 'Any availability' || show.availability === availability.toUpperCase();
        const lateMatches = !lateNight || hour >= 22 || hour < 4;
        const earlyMatches = !earlyMorning || (hour >= 5 && hour < 10);
        return (language === 'All languages' || show.language === language) && (format === 'All formats' || show.format === format) && priceMatches && timeMatches && availabilityMatches && lateMatches && earlyMatches;
      });
      return { ...theatre, shows };
    }).filter((theatre) => theatre.shows.length && (!cancelable || theatre.cancellationAvailable));

    if (sort === 'Earliest') result.sort((a, b) => getHour(a.shows[0].time) - getHour(b.shows[0].time));
    if (sort === 'Lowest price') result.sort((a, b) => Math.min(...a.shows.map((show) => show.price)) - Math.min(...b.shows.map((show) => show.price)));
    return result;
  }, [language, format, price, time, availability, lateNight, earlyMorning, cancelable, sort]);

  const toggleFavorite = (theatreId) => setFavorites((current) => {
    const next = new Set(current);
    if (next.has(theatreId)) next.delete(theatreId); else next.add(theatreId);
    return next;
  });

  return <div className="seatify-app showtimes-page">
    <Header query={query} setQuery={setQuery} city={city} setCity={setCity}/>
    {!movie ? <main className="showtimes-not-found"><span className="section-kicker">SEATIFY SHOWTIMES</span><h1>Movie not found</h1><p>We couldn't find a movie with that ID.</p><Link className="primary-btn" to="/">Back to Home</Link></main> : <main className="showtimes-main">
      <Link className="showtimes-back" to={`/movie/${movie.id}`}>← <span>Back to Movie</span></Link>
      <section className="showtimes-movie-heading">
        <div className="showtimes-poster"><img src={movie.poster} alt=""/></div>
        <div className="showtimes-movie-copy"><span className="section-kicker">NOW SHOWING NEAR YOU</span><h1>{movie.title}</h1>
          <div className="showtimes-metadata"><span>{movie.duration}</span><i/>{movie.genre.split(',').map((item) => <span key={item}>{item.trim()}</span>)}<b>{details?.certification ?? 'TBA'}</b><b>{movie.language}</b></div>
          <p>Choose a date and find your perfect seat at a cinema near you.</p>
        </div>
        <div className="showtimes-city"><span>SHOWING IN</span><strong>⌖ &nbsp;{city}</strong></div>
      </section>

      <div className="showtimes-control-panel">
      <section className="showtimes-date-section" aria-label="Choose a date"><div className="showtimes-section-top"><div><span className="section-kicker">PICK YOUR DAY</span><h2>Choose a date</h2></div><span className="showtimes-month">OCTOBER 2026</span></div>
        <div className="showtimes-dates">{days.map((day) => <button className={`showtimes-date ${date === day.value ? 'is-active' : ''}`} key={day.value} type="button" onClick={() => { setDate(day.value); setSelectedShow(null); }}><span>{day.weekday}</span><strong>{day.day}</strong><span>{day.month}</span></button>)}</div>
      </section>

      <section className="showtimes-filters" aria-label="Filter showtimes">
        <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>All languages</option>{[...new Set(theatres.flatMap((venue) => venue.shows.map((show) => show.language)))].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Format<select value={format} onChange={(event) => setFormat(event.target.value)}><option>All formats</option>{['2D', '3D', 'IMAX'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Price range<select value={price} onChange={(event) => setPrice(event.target.value)}><option>Any price</option><option>₹100–₹200</option><option>₹200–₹300</option><option>₹300+</option></select></label>
        <label>Preferred time<select value={time} onChange={(event) => setTime(event.target.value)}>{['Any time', 'Morning', 'Afternoon', 'Evening', 'Night'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Availability<select value={availability} onChange={(event) => setAvailability(event.target.value)}>{['Any availability', 'Available', 'Fast filling'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}>{['Recommended', 'Earliest', 'Lowest price'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="showtimes-cancel-filter"><input type="checkbox" checked={cancelable} onChange={(event) => setCancelable(event.target.checked)}/> Cancellation available</label>
      </section>
      </div>

      <section className="showtimes-listing">
        <div className="showtimes-listing-top"><div><span className="section-kicker">YOUR CINEMA OPTIONS</span><h2>{filteredTheatres.length} theatres <span>near Mumbai</span></h2></div>
          <div className="showtimes-quick-filters"><button type="button" className={lateNight ? 'is-active' : ''} onClick={() => { setLateNight(!lateNight); setEarlyMorning(false); }}>☾ Late night</button><button type="button" className={earlyMorning ? 'is-active' : ''} onClick={() => { setEarlyMorning(!earlyMorning); setLateNight(false); }}>☀ Early morning</button></div>
        </div>
        <div className="showtimes-legend"><span><i className="legend-available"/>Available</span><span><i className="legend-fast"/>Fast filling</span><span><i className="legend-sold"/>Sold out</span></div>
        <div className="showtimes-theatres">{filteredTheatres.map((theatre) => <article className="showtimes-theatre" key={theatre.id}>
          <div className="theatre-heading"><div className="theatre-logo" aria-hidden="true">{theatre.initials}</div><div className="theatre-title"><h3>{theatre.name}</h3><p>{theatre.location}</p><div className="theatre-badges"><span className={theatre.cancellationAvailable ? 'cancel-yes' : 'cancel-no'}>{theatre.cancellationAvailable ? '✓ Cancellation available' : 'Cancellation unavailable'}</span>{theatre.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div></div>
            <button className={`theatre-favorite ${favorites.has(theatre.id) ? 'is-favorite' : ''}`} type="button" aria-label={favorites.has(theatre.id) ? 'Remove theatre from favourites' : 'Add theatre to favourites'} onClick={() => toggleFavorite(theatre.id)}>{favorites.has(theatre.id) ? '♥' : '♡'}</button></div>
          <div className="theatre-showtimes">{theatre.shows.map((show, index) => { const showId = `${theatre.id}-${show.time.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; return <button key={`${show.time}-${show.format}-${index}`} type="button" disabled={show.availability === 'SOLD OUT'} aria-pressed={selectedShow?.theatreId === theatre.id && selectedShow?.time === show.time} className={`showtime-choice show-${show.availability.toLowerCase().replace(' ', '-')} ${selectedShow?.theatreId === theatre.id && selectedShow?.time === show.time ? 'is-selected' : ''}`} onClick={() => setSelectedShow({ theatreId: theatre.id, theatreName: theatre.name, ...show, id: showId })}><strong>{show.time}</strong><span>{show.format} · ₹{show.price}</span><small>{show.availability === 'FAST FILLING' ? 'Few seats left' : show.availability === 'SOLD OUT' ? 'Sold out' : show.availability.toLowerCase()}</small></button>; })}</div>
        </article>)}</div>
        {!filteredTheatres.length && <div className="showtimes-empty"><span>⌕</span><h3>No shows available for the selected filters</h3><p>Try changing your filters to see more showtimes.</p><button type="button" onClick={() => { setLanguage('All languages'); setFormat('All formats'); setPrice('Any price'); setTime('Any time'); setAvailability('Any availability'); setLateNight(false); setEarlyMorning(false); setCancelable(false); }}>Clear filters</button></div>}
      </section>
      {selectedShow && <aside className="showtimes-selection" aria-live="polite"><div><span className="section-kicker">YOUR SELECTED SHOW</span><strong>{selectedShow.theatreName}</strong><span>{selectedShow.time} · {selectedShow.format} · ₹{selectedShow.price}</span></div><Link className="primary-btn" to={`/movie/${movie.id}/showtimes/${selectedShow.id}/seats?date=${encodeURIComponent(date)}`}>Select Seats <span>→</span></Link></aside>}
    </main>}
  </div>;
}

export default Showtimes;
