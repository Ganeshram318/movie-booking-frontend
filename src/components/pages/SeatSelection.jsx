import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { fetchMovie, fetchSeatMap, fetchShowtime, formatCurrency, formatShowDate, formatTime, isUpcoming, parseId } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/SeatSelection.css'

const MAX_TICKETS = 6;
const CATEGORY_ORDER = ['PREMIUM', 'GOLD', 'EXECUTIVE'];

function SeatSelection() {
  const navigate = useNavigate();
  const { id, showId } = useParams();
  const movieId = parseId(id);
  const showtimeId = parseId(showId);
  const [movie, setMovie] = useState(null);
  const [show, setShow] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [result, setResult] = useState({ key: null, status: 'loading' });
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [checking, setChecking] = useState(false);
  const [query, setQuery] = useState('');
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState('');

  const requestKey = `${movieId}:${showtimeId}:${reloadKey}`;
  const status = !movieId || !showtimeId ? 'not-found' : result.key !== requestKey ? 'loading' : result.status;

  useEffect(() => {
    if (!movieId || !showtimeId) {
      return undefined;
    }
    let active = true;
    const finish = (value) => setResult({ key: requestKey, status: value });
    Promise.all([fetchMovie(movieId), fetchShowtime(showtimeId), fetchSeatMap(showtimeId)])
      .then(([movieData, showData, seatData]) => {
        if (!active) return;
        // The show must belong to the movie in the URL and must not have started
        if (showData.movieId !== movieData.id || !isUpcoming(showData)) {
          setMovie(movieData);
          finish('unavailable');
          return;
        }
        setMovie(movieData);
        setShow(showData);
        setSeatMap(seatData);
        finish(seatData.availableSeats > 0 ? 'ready' : 'unavailable');
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 404) {
          finish('not-found');
        } else {
          setErrorMessage(getErrorMessage(error, 'Unable to load seats for this show.'));
          finish('error');
        }
      });
    return () => { active = false; };
  }, [movieId, showtimeId, requestKey]);

  const rows = useMemo(() => [...(seatMap?.rows ?? [])].reverse(), [seatMap]);
  const seatById = useMemo(() => new Map(rows.flatMap((row) => row.seats.map((seat) => [seat.id, { ...seat, row: row.row, category: row.category, price: Number(row.price) }]))), [rows]);
  const categories = useMemo(() => CATEGORY_ORDER.map((category) => rows.find((row) => row.category === category)).filter(Boolean), [rows]);
  const maxTickets = Math.max(1, Math.min(MAX_TICKETS, seatMap?.availableSeats ?? MAX_TICKETS));
  const dateLabel = show ? formatShowDate(show.showDate, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }) : '';

  // Display estimate from server prices; the backend recalculates the final total when booking
  const subtotal = selectedSeats.reduce((total, seatId) => total + (seatById.get(seatId)?.price ?? 0), 0);
  const convenienceFee = selectedSeats.length ? Number(seatMap?.convenienceFee ?? 0) : 0;
  const total = subtotal + convenienceFee;

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const selectSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
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

  // Re-check availability with the server right before leaving the seat map
  const continueToPayment = async () => {
    setChecking(true);
    try {
      const latest = await fetchSeatMap(show.id);
      const booked = new Set(latest.rows.flatMap((row) => row.seats.filter((seat) => seat.status !== 'AVAILABLE').map((seat) => seat.id)));
      const taken = selectedSeats.filter((seatId) => booked.has(seatId));
      setSeatMap(latest);
      if (taken.length) {
        setSelectedSeats((current) => current.filter((seatId) => !booked.has(seatId)));
        notify(`Sorry, ${taken.join(', ')} ${taken.length === 1 ? 'was' : 'were'} just booked. Please choose again.`);
        return;
      }
      const params = new URLSearchParams({ showtimeId: String(show.id), seats: selectedSeats.join(',') });
      navigate(`/payment?${params.toString()}`);
    } catch (error) {
      notify(getErrorMessage(error, 'Could not verify seat availability. Please try again.'));
    } finally {
      setChecking(false);
    }
  };

  if (status === 'loading') {
    return <div className="seatify-app seat-selection-page"><Header query={query} setQuery={setQuery}/><main className="seat-not-found"><span className="section-kicker">SEATIFY SEATING</span><h1>Loading seats...</h1><p>Fetching live seat availability.</p></main></div>;
  }

  if (status === 'error') {
    return <div className="seatify-app seat-selection-page"><Header query={query} setQuery={setQuery}/><main className="seat-not-found"><span className="section-kicker">SEATIFY SEATING</span><h1>Something went wrong</h1><p>{errorMessage}</p><button className="primary-btn" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try Again</button></main></div>;
  }

  if (status !== 'ready') {
    return <div className="seatify-app seat-selection-page"><Header query={query} setQuery={setQuery}/><main className="seat-not-found"><span className="section-kicker">SEATIFY SEATING</span><h1>{status === 'unavailable' ? 'Show unavailable' : 'Show not found'}</h1><p>{status === 'unavailable' ? 'This show has started, is sold out, or is not playing this movie. Please choose another showtime.' : 'This show is unavailable. Please choose another showtime.'}</p><Link className="primary-btn" to={movie ? `/movie/${movie.id}/showtimes` : movieId ? `/movie/${movieId}/showtimes` : '/'}>Back to Showtimes</Link></main></div>;
  }

  return <div className="seatify-app seat-selection-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="seat-selection-main">
      <section className="seat-booking-heading">
        <div className="seat-booking-top"><Link to={`/movie/${movie.id}/showtimes`} className="seat-back-link">← <span>Back to showtimes</span></Link></div>
        <div className="seat-movie-show"><div className="seat-movie-mark">S</div><div className="seat-movie-info"><span className="section-kicker">SEATIFY · PICK YOUR SEATS</span><h1>{movie.title}</h1><p>{[show.theatreName, show.theatreAddress, show.theatreCity].filter(Boolean).join(', ')}</p><div className="seat-show-meta"><span>{dateLabel}</span><i/><span>{formatTime(show.startTime)}</span><i/><span>Screen {show.screenNumber}</span>{show.format && <><i/><span>{show.format}</span></>}{show.language && <><i/><span>{show.language}</span></>}</div></div><div className="ticket-count-badge"><strong>{ticketCount}</strong><span>{ticketCount === 1 ? 'Ticket' : 'Tickets'}</span></div></div>
      </section>

      <section className="seat-map-card" aria-label="Cinema seat map">
        <div className="seat-map-topline"><div><span className="section-kicker">SCREENING ROOM</span><h2>Select your seats</h2><p>Tap seats to select or deselect. Seats are only reserved once your booking is confirmed. {seatMap.availableSeats} of {seatMap.totalSeats} seats available.</p></div>
          <div className="seat-map-actions">
            <div className="seat-zoom-controls" aria-label="Seat map zoom controls"><button type="button" aria-label="Zoom out" disabled={zoom <= 0.8} onClick={() => setZoom((value) => Math.max(0.8, +(value - 0.2).toFixed(1)))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, +(value + 0.2).toFixed(1)))}>+</button></div>
            <label className="ticket-count-label">Tickets<select value={ticketCount} onChange={(event) => changeTicketCount(Number(event.target.value))}>{Array.from({ length: maxTickets }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'Ticket' : 'Tickets'}</option>)}</select></label>
          </div>
        </div>

        <div className="seat-category-key" aria-label="Seat categories">{categories.map((row) => <span key={row.category} className={`category-${row.category.toLowerCase()}`}>{row.category} <b>{formatCurrency(row.price)}</b></span>)}</div>
        <div className="seat-map-viewport"><div className="seat-map-inner" style={{ '--seat-zoom': zoom }}>
          <div className="seat-row-list">{rows.map((row) => <div className="seat-map-row" key={row.row}>
            <span className="seat-row-label">{row.row}</span>
            {[0, 1, 2].map((group) => <div className="seat-group" key={`${row.row}-${group}`}>{row.seats.slice(group * 4, group * 4 + 4).map((seat) => {
              const selected = selectedSeats.includes(seat.id);
              const seatStatus = selected ? 'SELECTED' : seat.status === 'AVAILABLE' ? 'AVAILABLE' : 'SOLD';
              const priceLabel = formatCurrency(row.price);
              return <button key={seat.id} type="button" aria-label={`Row ${row.row}, seat ${seat.number}, ${seatStatus.toLowerCase()}, ${row.category.toLowerCase()} ${priceLabel}`} aria-pressed={selected} disabled={seat.status !== 'AVAILABLE'} onClick={() => selectSeat(seat)} className={`cinema-seat seat-${seatStatus.toLowerCase()} seat-category-${row.category.toLowerCase()}`} title={`${seat.id} · ${row.category} · ${priceLabel}`}>{seat.number}</button>;
            })}</div>)}</div>)}</div>
        </div></div>
        <div className="seat-screen"><span>SCREEN THIS WAY</span></div>
        <div className="seat-legend"><span><i className="seat-legend-available"/>Available</span><span><i className="seat-legend-sold"/>Sold</span><span><i className="seat-legend-selected"/>Selected</span></div>
      </section>

      <section className="seat-selection-details">
        <div className="selected-seats-card"><span className="section-kicker">YOUR SELECTION</span><h2>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected</h2><p>{selectedSummary}</p><small>Choose up to {ticketCount} seats</small></div>
        <div className="seat-price-card"><span className="section-kicker">PRICE SUMMARY</span><div><span>Tickets ({selectedSeats.length})</span><strong>{formatCurrency(subtotal)}</strong></div><div><span>Convenience fee</span><strong>{formatCurrency(convenienceFee)}</strong></div><div className="seat-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div></div>
      </section>
    </main>

    <aside className="seat-sticky-summary"><div className="seat-sticky-info"><span className="section-kicker">{selectedSeats.length ? `${selectedSeats.length} ${selectedSeats.length === 1 ? 'SEAT' : 'SEATS'} SELECTED` : 'SELECT YOUR SEATS'}</span><strong>{selectedSummary}</strong></div><div className="seat-sticky-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div><button className="seat-continue-button" type="button" disabled={!selectedSeats.length || checking} onClick={continueToPayment}>{checking ? 'Checking...' : <>Continue <span>→</span></>}</button></aside>
    {toast && <div className="toast-message seat-toast" role="status">{toast}</div>}
  </div>;
}

export default SeatSelection;
