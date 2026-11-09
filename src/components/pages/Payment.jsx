import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api';
import { createBooking, fetchSeatMap, fetchShowtime, formatCurrency, formatShowDate, formatTime, isUpcoming, parseId } from '../../services/seatify';
import { Header } from './Home';
import '../../styles/Payment.css'

const SEAT_PATTERN = /^[A-Z]\d{1,2}$/;

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidCardNumber(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showtimeId = parseId(searchParams.get('showtimeId'));
  const seatsParam = searchParams.get('seats') ?? '';
  const seats = useMemo(() => [...new Set(seatsParam.split(',').map((seat) => seat.trim().toUpperCase()).filter(Boolean))], [seatsParam]);
  const validRequest = Boolean(showtimeId) && seats.length > 0 && seats.every((seat) => SEAT_PATTERN.test(seat));
  const [show, setShow] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [result, setResult] = useState({ key: null, status: 'loading' });
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('UPI');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // One key per checkout so a double submit or retry cannot create two bookings
  const [idempotencyKey] = useState(newIdempotencyKey);

  const requestKey = `${showtimeId}:${seatsParam}`;
  const status = !validRequest ? 'invalid' : result.key !== requestKey ? 'loading' : result.status;

  useEffect(() => {
    if (!validRequest) {
      return undefined;
    }
    let active = true;
    const finish = (value) => setResult({ key: requestKey, status: value });
    Promise.all([fetchShowtime(showtimeId), fetchSeatMap(showtimeId)])
      .then(([showData, seatData]) => {
        if (!active) return;
        setShow(showData);
        setSeatMap(seatData);
        const seatStatus = new Map(seatData.rows.flatMap((row) => row.seats.map((seat) => [seat.id, seat.status])));
        if (!isUpcoming(showData)) {
          setLoadError('This show has already started. Please choose another showtime.');
          finish('unavailable');
        } else if (seats.some((seat) => !seatStatus.has(seat))) {
          setLoadError('Some selected seats do not exist for this show. Please select your seats again.');
          finish('unavailable');
        } else if (seats.some((seat) => seatStatus.get(seat) !== 'AVAILABLE')) {
          setLoadError(`Sorry, ${seats.filter((seat) => seatStatus.get(seat) !== 'AVAILABLE').join(', ')} ${seats.length === 1 ? 'is' : 'are'} no longer available. Please select your seats again.`);
          setConflict(true);
          finish('unavailable');
        } else {
          finish('ready');
        }
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error.response?.status === 404 ? 'This show could not be found.' : getErrorMessage(error, 'Unable to load your booking details.'));
        finish('unavailable');
      });
    return () => { active = false; };
  }, [validRequest, showtimeId, seats, requestKey]);

  const seatPrices = useMemo(() => new Map((seatMap?.rows ?? []).flatMap((row) => row.seats.map((seat) => [seat.id, Number(row.price)]))), [seatMap]);
  const ticketTotal = seats.reduce((sum, seat) => sum + (seatPrices.get(seat) ?? 0), 0);
  const convenienceFee = Number(seatMap?.convenienceFee ?? 0);
  const booking = show ? {
    movie: show.movieName,
    theatre: [show.theatreName, show.theatreCity].filter(Boolean).join(', '),
    date: formatShowDate(show.showDate),
    showtime: formatTime(show.startTime),
    seats,
    ticketCount: seats.length,
    ticketPrice: ticketTotal,
    convenienceFee,
    total: ticketTotal + convenienceFee,
    backPath: `/movie/${show.movieId}/showtimes/${show.id}/seats`,
  } : null;
  const backPath = booking?.backPath ?? '/';

  const validatePayment = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const nextErrors = {};

    if (method === 'UPI') {
      const upiId = String(values.get('upiId') ?? '').trim();
      if (!upiId) nextErrors.upiId = 'Enter your UPI ID.';
      else if (!/^[\w.-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,63}$/.test(upiId)) nextErrors.upiId = 'Enter a valid UPI ID.';
    }

    if (method === 'CARD') {
      const cardNumber = String(values.get('cardNumber') ?? '');
      const name = String(values.get('nameOnCard') ?? '').trim();
      const expiry = String(values.get('expiry') ?? '').trim();
      const cvv = String(values.get('cvv') ?? '').trim();
      if (!cardNumber.trim()) nextErrors.cardNumber = 'Enter your card number.';
      else if (!isValidCardNumber(cardNumber)) nextErrors.cardNumber = 'Enter a valid card number.';
      if (!name) nextErrors.nameOnCard = 'Enter the name on your card.';
      if (!expiry) nextErrors.expiry = 'Enter the expiry date.';
      else {
        const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (!match) nextErrors.expiry = 'Use MM/YY format.';
        else {
          const month = Number(match[1]);
          const year = 2000 + Number(match[2]);
          const now = new Date();
          if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) nextErrors.expiry = 'This card has expired.';
        }
      }
      if (!cvv) nextErrors.cvv = 'Enter your CVV.';
      else if (!/^\d{3,4}$/.test(cvv)) nextErrors.cvv = 'CVV must be 3 or 4 digits.';
    }

    if (method === 'BANK' && !values.get('bank')) nextErrors.bank = 'Select a bank to continue.';

    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length || submitting || status !== 'ready') return;

    // No payment gateway is connected: the booking is created on the server and marked as not charged
    setSubmitting(true);
    createBooking({ showtimeId, seats, idempotencyKey })
      .then((created) => navigate(`/bookings/${created.id}`, { replace: true, state: { justBooked: true } }))
      .catch((error) => {
        setConflict(error.response?.status === 409);
        setSubmitError(getErrorMessage(error, 'Booking failed. Please try again.'));
        setSubmitting(false);
      });
  };

  const changeMethod = (nextMethod) => {
    setMethod(nextMethod);
    setErrors({});
    setSubmitError('');
  };

  if (status !== 'ready') {
    return <div className="seatify-app payment-page">
      <Header query={query} setQuery={setQuery}/>
      <main className="payment-main">
        <div className="payment-page-heading"><div><span className="payment-kicker">SEATIFY CHECKOUT</span><h1>{status === 'loading' ? 'Loading checkout...' : status === 'invalid' ? 'No booking in progress' : 'Seats unavailable'}</h1></div><Link className="payment-back-link" to={backPath}>← Back</Link></div>
        {status !== 'loading' && <section className="payment-card"><p>{status === 'invalid' ? 'Choose a movie, showtime and seats to start a booking.' : loadError}</p><Link className="payment-submit" to={status === 'invalid' ? '/' : backPath}>{status === 'invalid' ? 'Browse movies' : 'Choose seats again'} <span>→</span></Link></section>}
      </main>
    </div>;
  }

  return <div className="seatify-app payment-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="payment-main">
      <div className="payment-page-heading"><div><span className="payment-kicker">SEATIFY CHECKOUT</span><h1>Secure Payment</h1></div><Link className="payment-back-link" to={backPath}>← Back</Link></div>
      <div className="payment-layout">
        <section className="payment-card payment-form-card" aria-labelledby="payment-details-title">
          <div className="payment-card-heading"><span className="payment-step">01</span><div><h2 id="payment-details-title">Payment Details</h2><p>Choose a method to continue with this demo checkout.</p></div></div>
          <div className="payment-methods" role="group" aria-label="Payment method">
            {[['UPI', 'UPI'], ['CARD', 'Credit / Debit Card'], ['BANK', 'Net Banking']].map(([value, label]) => <button key={value} className={method === value ? 'is-active' : ''} type="button" aria-pressed={method === value} onClick={() => changeMethod(value)}>{label}</button>)}
          </div>

          <form className="payment-form" noValidate onSubmit={validatePayment} aria-busy={submitting}>
            {method === 'UPI' && <div className="payment-field"><label htmlFor="payment-upi">UPI ID</label><input id="payment-upi" name="upiId" type="text" autoComplete="off" placeholder="Enter your UPI ID" aria-invalid={Boolean(errors.upiId)} aria-describedby={errors.upiId ? 'payment-upi-error' : undefined}/>{errors.upiId && <span id="payment-upi-error" className="payment-field-error" role="alert">{errors.upiId}</span>}<small>Example: name@bank</small></div>}
            {method === 'CARD' && <div className="payment-fields-grid">
              <div className="payment-field payment-field-wide"><label htmlFor="payment-card-number">Card Number</label><input id="payment-card-number" name="cardNumber" type="text" inputMode="numeric" autoComplete="cc-number" placeholder="XXXX XXXX XXXX XXXX" maxLength={23} aria-invalid={Boolean(errors.cardNumber)} aria-describedby={errors.cardNumber ? 'payment-card-number-error' : undefined} onInput={(event) => { const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 19); event.currentTarget.value = digits.replace(/(.{4})/g, '$1 ').trim(); }}/>{errors.cardNumber && <span id="payment-card-number-error" className="payment-field-error" role="alert">{errors.cardNumber}</span>}</div>
              <div className="payment-field payment-field-wide"><label htmlFor="payment-card-name">Name on Card</label><input id="payment-card-name" name="nameOnCard" type="text" autoComplete="cc-name" placeholder="Name as shown on card" aria-invalid={Boolean(errors.nameOnCard)} aria-describedby={errors.nameOnCard ? 'payment-card-name-error' : undefined}/>{errors.nameOnCard && <span id="payment-card-name-error" className="payment-field-error" role="alert">{errors.nameOnCard}</span>}</div>
              <div className="payment-field"><label htmlFor="payment-expiry">Expiry Date</label><input id="payment-expiry" name="expiry" type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} aria-invalid={Boolean(errors.expiry)} aria-describedby={errors.expiry ? 'payment-expiry-error' : undefined} onInput={(event) => { const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 4); event.currentTarget.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; }}/>{errors.expiry && <span id="payment-expiry-error" className="payment-field-error" role="alert">{errors.expiry}</span>}</div>
              <div className="payment-field"><label htmlFor="payment-cvv">CVV</label><input id="payment-cvv" name="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="XXX" maxLength={4} aria-invalid={Boolean(errors.cvv)} aria-describedby={errors.cvv ? 'payment-cvv-error' : undefined} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 4); }}/>{errors.cvv && <span id="payment-cvv-error" className="payment-field-error" role="alert">{errors.cvv}</span>}</div>
            </div>}
            {method === 'BANK' && <div className="payment-field"><label htmlFor="payment-bank">Select Bank</label><select id="payment-bank" name="bank" defaultValue="" aria-invalid={Boolean(errors.bank)} aria-describedby={errors.bank ? 'payment-bank-error' : undefined}><option value="">Choose your bank</option>{['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => <option key={bank} value={bank}>{bank}</option>)}</select>{errors.bank && <span id="payment-bank-error" className="payment-field-error" role="alert">{errors.bank}</span>}</div>}
            <p className="payment-demo-note">Demo checkout: no payment gateway is connected and you will not be charged. Payment details are checked in your browser and are never sent or saved. Confirming reserves your seats on the server.</p>
            {submitError && <p className="payment-field-error" role="alert">{submitError} {conflict && <Link to={backPath}>Choose different seats</Link>}</p>}
            <button className="payment-submit" type="submit" disabled={submitting}>{submitting ? 'Confirming booking...' : <>Confirm Booking (Demo) <span>→</span></>}</button>
          </form>
        </section>

        <aside className="payment-card payment-summary-card" aria-labelledby="booking-summary-title">
          <div className="payment-card-heading"><span className="payment-step">02</span><div><h2 id="booking-summary-title">Booking Summary</h2><p>Your selected show · final total is confirmed by the server</p></div></div>
          <div className="payment-movie-summary"><span className="payment-summary-label">MOVIE</span><strong>{booking.movie}</strong></div>
          <div className="payment-summary-detail"><span>Theatre</span><strong>{booking.theatre}</strong></div>
          <div className="payment-summary-detail"><span>Date &amp; time</span><strong>{booking.date} · {booking.showtime}</strong></div>
          <div className="payment-summary-detail"><span>Seats</span><strong>{booking.seats?.length ? booking.seats.join(', ') : '—'}</strong></div>
          <div className="payment-summary-detail"><span>Tickets</span><strong>{booking.ticketCount ?? booking.seats?.length ?? 0}</strong></div>
          <div className="payment-summary-rule"/>
          <div className="payment-summary-detail"><span>Ticket price</span><strong>{formatCurrency(booking.ticketPrice)}</strong></div>
          <div className="payment-summary-detail"><span>Convenience fee</span><strong>{formatCurrency(booking.convenienceFee)}</strong></div>
          <div className="payment-total"><span>Total amount</span><strong>{formatCurrency(booking.total)}</strong></div>
        </aside>
      </div>
    </main>
  </div>;
}

export default Payment;
