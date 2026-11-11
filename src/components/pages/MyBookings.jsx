import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { fetchMyBookings, formatCurrency, formatShowDate, formatTime } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/Payment.css'

function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetchMyBookings()
      .then((data) => { if (active) setBookings(data); })
      .catch((err) => { if (active) setError(getErrorMessage(err, 'Unable to load your bookings.')); });
    return () => { active = false; };
  }, []);

  return <div className="seatify-app payment-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="payment-main">
      <div className="payment-page-heading"><div><span className="payment-kicker">SEATIFY</span><h1>My Bookings</h1></div><Link className="payment-back-link" to="/">← Home</Link></div>
      {error && <section className="payment-card"><p className="payment-field-error" role="alert">{error}</p></section>}
      {!error && !bookings && <section className="payment-card"><p>Loading your bookings...</p></section>}
      {bookings?.length === 0 && <section className="payment-card"><p>You have no bookings yet.</p><Link className="payment-submit" to="/">Browse movies <span>→</span></Link></section>}
      {bookings?.map((booking) => <section className="payment-card" key={booking.id} style={{ marginBottom: 16 }}>
        <div className="payment-movie-summary"><span className="payment-summary-label">{booking.bookingReference}</span><strong>{booking.movieName}</strong></div>
        <div className="payment-summary-detail"><span>Theatre</span><strong>{[booking.theatreName, booking.theatreCity].filter(Boolean).join(', ')}</strong></div>
        <div className="payment-summary-detail"><span>Date &amp; time</span><strong>{formatShowDate(booking.showDate)} · {formatTime(booking.startTime)}</strong></div>
        <div className="payment-summary-detail"><span>Seats</span><strong>{booking.seats.join(', ')}</strong></div>
        <div className="payment-total"><span>Total</span><strong>{formatCurrency(booking.totalAmount)}</strong></div>
        <Link className="payment-back-link" to={`/bookings/${booking.id}`}>View details →</Link>
      </section>)}
    </main>
  </div>;
}

export default MyBookings;
