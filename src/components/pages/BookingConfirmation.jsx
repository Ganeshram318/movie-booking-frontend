import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { fetchBooking, formatCurrency, formatShowDate, formatTime, parseId } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/Payment.css'

function BookingConfirmation() {
  const { bookingId } = useParams();
  const location = useLocation();
  const id = parseId(bookingId);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(id ? '' : 'Booking not found.');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    fetchBooking(id)
      .then((data) => { if (active) setBooking(data); })
      .catch((err) => { if (active) setError(err.response?.status === 404 ? 'Booking not found.' : getErrorMessage(err, 'Unable to load this booking.')); });
    return () => { active = false; };
  }, [id]);

  return <div className="seatify-app payment-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="payment-main">
      <div className="payment-page-heading"><div><span className="payment-kicker">SEATIFY BOOKING</span><h1>{booking ? (location.state?.justBooked ? 'Booking Confirmed' : 'Booking Details') : error ? 'Booking unavailable' : 'Loading booking...'}</h1></div><Link className="payment-back-link" to="/bookings">My Bookings →</Link></div>
      {error && <section className="payment-card"><p>{error}</p><Link className="payment-submit" to="/">Browse movies <span>→</span></Link></section>}
      {booking && <div className="payment-layout">
        <section className="payment-card" aria-labelledby="confirmation-title">
          <div className="payment-card-heading"><span className="payment-step">✓</span><div><h2 id="confirmation-title">Your seats are reserved</h2><p>Booking reference</p></div></div>
          <div className="payment-movie-summary"><span className="payment-summary-label">REFERENCE</span><strong>{booking.bookingReference}</strong></div>
          <p className="payment-success" role="status">Status: {booking.status}. Payment: demo checkout, not charged.</p>
          <div className="payment-summary-detail"><span>Booked on</span><strong>{new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
          <Link className="payment-submit" to={`/movie/${booking.movieId}`}>View movie <span>→</span></Link>
        </section>
        <aside className="payment-card payment-summary-card" aria-labelledby="confirmation-summary-title">
          <div className="payment-card-heading"><span className="payment-step">02</span><div><h2 id="confirmation-summary-title">Booking Summary</h2><p>Saved on the server</p></div></div>
          <div className="payment-movie-summary"><span className="payment-summary-label">MOVIE</span><strong>{booking.movieName}</strong></div>
          <div className="payment-summary-detail"><span>Theatre</span><strong>{[booking.theatreName, booking.theatreCity].filter(Boolean).join(', ')}</strong></div>
          <div className="payment-summary-detail"><span>Screen</span><strong>{booking.screenNumber}{booking.format ? ` · ${booking.format}` : ''}</strong></div>
          <div className="payment-summary-detail"><span>Date &amp; time</span><strong>{formatShowDate(booking.showDate)} · {formatTime(booking.startTime)}</strong></div>
          <div className="payment-summary-detail"><span>Seats</span><strong>{booking.seats.join(', ')}</strong></div>
          <div className="payment-summary-detail"><span>Tickets</span><strong>{booking.seats.length} × {formatCurrency(booking.ticketPrice)}</strong></div>
          <div className="payment-summary-rule"/>
          <div className="payment-summary-detail"><span>Ticket price</span><strong>{formatCurrency(booking.subtotal)}</strong></div>
          <div className="payment-summary-detail"><span>Convenience fee</span><strong>{formatCurrency(booking.convenienceFee)}</strong></div>
          <div className="payment-total"><span>Total amount</span><strong>{formatCurrency(booking.totalAmount)}</strong></div>
        </aside>
      </div>}
    </main>
  </div>;
}

export default BookingConfirmation;
