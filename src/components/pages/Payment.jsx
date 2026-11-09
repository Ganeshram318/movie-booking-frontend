import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from './Home';
import '../../styles/Payment.css'

const demoBooking = {
  movie: 'Demo movie',
  theatre: 'Demo theatre',
  date: 'Sample date',
  showtime: 'Sample time',
  seats: ['A1', 'A2'],
  ticketCount: 2,
  ticketPrice: 600,
  convenienceFee: 40,
  total: 640,
  backPath: '/',
};

const formatCurrency = (value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`;

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
  const location = useLocation();
  const booking = location.state?.booking ?? demoBooking;
  const hasBooking = Boolean(location.state?.booking);
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('UPI');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    if (Object.keys(nextErrors).length) return;

    setSuccess(true);
    event.currentTarget.reset();
  };

  const changeMethod = (nextMethod) => {
    setMethod(nextMethod);
    setErrors({});
    setSuccess(false);
  };

  return <div className="seatify-app payment-page">
    <Header query={query} setQuery={setQuery}/>
    <main className="payment-main">
      <div className="payment-page-heading"><div><span className="payment-kicker">SEATIFY CHECKOUT</span><h1>Secure Payment</h1></div><Link className="payment-back-link" to={booking.backPath || '/'}>← Back</Link></div>
      <div className="payment-layout">
        <section className="payment-card payment-form-card" aria-labelledby="payment-details-title">
          <div className="payment-card-heading"><span className="payment-step">01</span><div><h2 id="payment-details-title">Payment Details</h2><p>Choose a method to continue with this demo checkout.</p></div></div>
          <div className="payment-methods" role="group" aria-label="Payment method">
            {[['UPI', 'UPI'], ['CARD', 'Credit / Debit Card'], ['BANK', 'Net Banking']].map(([value, label]) => <button key={value} className={method === value ? 'is-active' : ''} type="button" aria-pressed={method === value} onClick={() => changeMethod(value)}>{label}</button>)}
          </div>

          <form className="payment-form" noValidate onSubmit={validatePayment}>
            {method === 'UPI' && <div className="payment-field"><label htmlFor="payment-upi">UPI ID</label><input id="payment-upi" name="upiId" type="text" autoComplete="off" placeholder="Enter your UPI ID" aria-invalid={Boolean(errors.upiId)} aria-describedby={errors.upiId ? 'payment-upi-error' : undefined}/>{errors.upiId && <span id="payment-upi-error" className="payment-field-error" role="alert">{errors.upiId}</span>}<small>Example: name@bank</small></div>}
            {method === 'CARD' && <div className="payment-fields-grid">
              <div className="payment-field payment-field-wide"><label htmlFor="payment-card-number">Card Number</label><input id="payment-card-number" name="cardNumber" type="text" inputMode="numeric" autoComplete="cc-number" placeholder="XXXX XXXX XXXX XXXX" maxLength={23} aria-invalid={Boolean(errors.cardNumber)} aria-describedby={errors.cardNumber ? 'payment-card-number-error' : undefined} onInput={(event) => { const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 19); event.currentTarget.value = digits.replace(/(.{4})/g, '$1 ').trim(); }}/>{errors.cardNumber && <span id="payment-card-number-error" className="payment-field-error" role="alert">{errors.cardNumber}</span>}</div>
              <div className="payment-field payment-field-wide"><label htmlFor="payment-card-name">Name on Card</label><input id="payment-card-name" name="nameOnCard" type="text" autoComplete="cc-name" placeholder="Name as shown on card" aria-invalid={Boolean(errors.nameOnCard)} aria-describedby={errors.nameOnCard ? 'payment-card-name-error' : undefined}/>{errors.nameOnCard && <span id="payment-card-name-error" className="payment-field-error" role="alert">{errors.nameOnCard}</span>}</div>
              <div className="payment-field"><label htmlFor="payment-expiry">Expiry Date</label><input id="payment-expiry" name="expiry" type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} aria-invalid={Boolean(errors.expiry)} aria-describedby={errors.expiry ? 'payment-expiry-error' : undefined} onInput={(event) => { const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 4); event.currentTarget.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; }}/>{errors.expiry && <span id="payment-expiry-error" className="payment-field-error" role="alert">{errors.expiry}</span>}</div>
              <div className="payment-field"><label htmlFor="payment-cvv">CVV</label><input id="payment-cvv" name="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="XXX" maxLength={4} aria-invalid={Boolean(errors.cvv)} aria-describedby={errors.cvv ? 'payment-cvv-error' : undefined} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 4); }}/>{errors.cvv && <span id="payment-cvv-error" className="payment-field-error" role="alert">{errors.cvv}</span>}</div>
            </div>}
            {method === 'BANK' && <div className="payment-field"><label htmlFor="payment-bank">Select Bank</label><select id="payment-bank" name="bank" defaultValue="" aria-invalid={Boolean(errors.bank)} aria-describedby={errors.bank ? 'payment-bank-error' : undefined}><option value="">Choose your bank</option>{['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => <option key={bank} value={bank}>{bank}</option>)}</select>{errors.bank && <span id="payment-bank-error" className="payment-field-error" role="alert">{errors.bank}</span>}</div>}
            <p className="payment-demo-note">Demo only. Payment details are checked in your browser and are never sent or saved.</p>
            {success && <p className="payment-success" role="status">Demo payment successful. No payment was processed.</p>}
            <button className="payment-submit" type="submit">{method === 'BANK' ? 'Continue to Pay' : 'Pay Now'} <span>→</span></button>
          </form>
        </section>

        <aside className="payment-card payment-summary-card" aria-labelledby="booking-summary-title">
          <div className="payment-card-heading"><span className="payment-step">02</span><div><h2 id="booking-summary-title">Booking Summary</h2><p>{hasBooking ? 'Your selected show' : 'Sample data for page preview'}</p></div></div>
          {!hasBooking && <span className="payment-sample-badge">SAMPLE DATA</span>}
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
