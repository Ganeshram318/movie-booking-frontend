import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { movies } from '../../data/movies';
import { theatres } from '../../data/showtimes';
import { seatRows } from '../../data/seats';
import { Header } from './Home';
import '../../styles/SeatSelection.css'

const showIdFor = (theatre, show) => `${theatre.id}-${show.time.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const formatDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(year, month, day));
};

function SeatSelection() {
  const navigate = useNavigate();
  const { id, showId } = useParams();
  const [searchParams] = useSearchParams();
  const movie = movies.find((item) => String(item.id) === id);
  const venue = theatres.find((theatre) => theatre.shows.some((show) => showIdFor(theatre, show) === showId));
  const show = venue?.shows.find((item) => showIdFor(venue, item) === showId);
  const [query, setQuery] = useState('');
  const date = searchParams.get('date') || '2026-9-7';
  const dateLabel = useMemo(() => {
    try { return formatDate(date); } catch { return 'Wed, 07 October 2026'; }
  }, [date]);
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState('');

  const subtotal = selectedSeats.reduce((total, seatId) => {
    const seat = seatRows.flatMap((row) => row.seats).find((item) => item.id === seatId);
    return total + (seat?.price ?? 0);
  }, 0);
  const convenienceFee = selectedSeats.length ? 40 : 0;
  const total = subtotal + convenienceFee;

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const selectSeat = (seat) => {
    if (seat.status === 'SOLD') return;
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((current) => current.filter((seatId) => seatId !== seat.id));
      return;
    }
    if (selectedSeats.length >= ticketCount) {
      notify(`You can select only ${ticketCount} seats.`);
      return;
    }
    setSelectedSeats((current) => [...current, seat.id]);
  };

  const changeTicketCount = (count) => {
    setTicketCount(count);
    setSelectedSeats((current) => current.slice(0, count));
  };

  const selectedSummary = selectedSeats.length ? selectedSeats.join(' · ') : 'No seats selected';
  const continueToPayment = () => navigate('/payment', { state: { booking: {
    movie: movie.title,
    theatre: venue.name,
    date: dateLabel,
    showtime: show.time,
    seats: selectedSeats,
    ticketCount: selectedSeats.length,
    ticketPrice: subtotal,
    convenienceFee,
    total,
    backPath: `/movie/${movie.id}/showtimes/${showId}/seats?date=${encodeURIComponent(date)}`,
  } } });

  if (!movie || !venue || !show || show.availability === 'SOLD OUT') {
    return <div className="seatify-app seat-selection-page"><Header query={query} setQuery={setQuery}/><main className="seat-not-found"><span className="section-kicker">SEATIFY SEATING</span><h1>Show not found</h1><p>This show is unavailable. Please choose another showtime.</p><Link className="primary-btn" to={movie ? `/movie/${movie.id}/showtimes` : '/'}>Back to Showtimes</Link></main></div>;
  }

  return <div className="seatify-app seat-selection-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="seat-selection-main">
      <section className="seat-booking-heading">
        <div className="seat-booking-top"><Link to={`/movie/${movie.id}/showtimes`} className="seat-back-link">← <span>Back to showtimes</span></Link></div>
        <div className="seat-movie-show"><div className="seat-movie-mark">S</div><div className="seat-movie-info"><span className="section-kicker">SEATIFY · PICK YOUR SEATS</span><h1>{movie.title}</h1><p>{venue.name}, {venue.location}</p><div className="seat-show-meta"><span>{dateLabel}</span><i/><span>{show.time}</span><i/><span>{show.format}</span><i/><span>{show.language}</span></div></div><div className="ticket-count-badge"><strong>{ticketCount}</strong><span>{ticketCount === 1 ? 'Ticket' : 'Tickets'}</span></div></div>
      </section>

      <section className="seat-map-card" aria-label="Cinema seat map">
        <div className="seat-map-topline"><div><span className="section-kicker">SCREENING ROOM</span><h2>Select your seats</h2><p>Tap seats to select or deselect. Your selection is held in this preview.</p></div>
          <div className="seat-map-actions">
            <div className="seat-zoom-controls" aria-label="Seat map zoom controls"><button type="button" aria-label="Zoom out" disabled={zoom <= 0.8} onClick={() => setZoom((value) => Math.max(0.8, +(value - 0.2).toFixed(1)))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, +(value + 0.2).toFixed(1)))}>+</button></div>
            <label className="ticket-count-label">Tickets<select value={ticketCount} onChange={(event) => changeTicketCount(Number(event.target.value))}>{Array.from({ length: 6 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'Ticket' : 'Tickets'}</option>)}</select></label>
          </div>
        </div>

        <div className="seat-category-key" aria-label="Seat categories"><span className="category-premium">PREMIUM <b>₹420</b></span><span className="category-gold">GOLD <b>₹300</b></span><span className="category-executive">EXECUTIVE <b>₹240</b></span></div>
        <div className="seat-map-viewport"><div className="seat-map-inner" style={{ '--seat-zoom': zoom }}>
          <div className="seat-row-list">{seatRows.map((row) => <div className="seat-map-row" key={row.row}>
            <span className="seat-row-label">{row.row}</span>
            {[0, 1, 2].map((group) => <div className="seat-group" key={`${row.row}-${group}`}>{row.seats.slice(group * 4, group * 4 + 4).map((seat) => {
              const selected = selectedSeats.includes(seat.id);
              const status = selected ? 'SELECTED' : seat.status;
              return <button key={seat.id} type="button" aria-label={`Row ${seat.row}, seat ${seat.number}, ${status.toLowerCase()}, ${seat.category.toLowerCase()} ₹${seat.price}`} aria-pressed={selected} disabled={seat.status === 'SOLD'} onClick={() => selectSeat(seat)} className={`cinema-seat seat-${status.toLowerCase()} seat-category-${seat.category.toLowerCase()}`} title={`${seat.row}${seat.number} · ${seat.category} · ₹${seat.price}`}>{seat.number}</button>;
            })}</div>)}</div>)}</div>
        </div></div>
        <div className="seat-screen"><span>SCREEN THIS WAY</span></div>
        <div className="seat-legend"><span><i className="seat-legend-available"/>Available</span><span><i className="seat-legend-sold"/>Sold</span><span><i className="seat-legend-best"/>Bestseller</span><span><i className="seat-legend-selected"/>Selected</span></div>
      </section>

      <section className="seat-selection-details">
        <div className="selected-seats-card"><span className="section-kicker">YOUR SELECTION</span><h2>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected</h2><p>{selectedSummary}</p><small>Choose up to {ticketCount} seats</small></div>
        <div className="seat-price-card"><span className="section-kicker">PRICE SUMMARY</span><div><span>Tickets ({selectedSeats.length})</span><strong>₹{subtotal}</strong></div><div><span>Convenience fee</span><strong>₹{convenienceFee}</strong></div><div className="seat-total"><span>Total</span><strong>₹{total}</strong></div></div>
      </section>
    </main>

    <aside className="seat-sticky-summary"><div className="seat-sticky-info"><span className="section-kicker">{selectedSeats.length ? `${selectedSeats.length} ${selectedSeats.length === 1 ? 'SEAT' : 'SEATS'} SELECTED` : 'SELECT YOUR SEATS'}</span><strong>{selectedSummary}</strong></div><div className="seat-sticky-total"><span>Total</span><strong>₹{total}</strong></div><button className="seat-continue-button" type="button" disabled={!selectedSeats.length} onClick={continueToPayment}>Continue <span>→</span></button></aside>
    {toast && <div className="toast-message seat-toast" role="status">{toast}</div>}
  </div>;
}

export default SeatSelection;
