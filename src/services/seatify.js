import api from '../api';

export const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&h=980&q=85';
export const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1900&h=1000&q=85';

export const formatDuration = (minutes) => {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) {
    return '';
  }
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
};

// Backend ratings are already on a 10-point scale
export const formatRating = (rating) => {
  const value = Number(rating);
  return Number.isFinite(value) && value > 0 ? value.toFixed(1) : null;
};

const splitList = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const mapMovie = (movie) => {
  const description = String(movie.description ?? '').trim();
  return {
    id: movie.id,
    title: movie.name || 'Untitled',
    description,
    blurb: description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description,
    genre: movie.genre || '',
    language: movie.language || '',
    durationMinutes: movie.duration,
    duration: formatDuration(movie.duration),
    rating: Number(movie.rating) || 0,
    ratingLabel: formatRating(movie.rating),
    price: Number(movie.price) || 0,
    poster: movie.posterUrl || FALLBACK_POSTER,
    banner: movie.bannerUrl || movie.posterUrl || FALLBACK_BANNER,
    releaseDate: movie.releaseDate || null,
    featured: Boolean(movie.featured),
    director: movie.director || '',
    cast: splitList(movie.cast),
    certification: movie.certification || '',
    tag: movie.featured ? 'SEATIFY FEATURED' : (movie.genre ? `${movie.genre} · NOW BOOKING`.toUpperCase() : 'NOW BOOKING'),
  };
};

// "18:45:00" -> "6:45 PM"
export const formatTime = (time) => {
  const [hourText, minuteText = '00'] = String(time ?? '').split(':');
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) {
    return '';
  }
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText.padStart(2, '0')} ${suffix}`;
};

// "2026-11-10" -> local Date at midnight (avoids UTC shift and zero-based month mistakes)
export const parseDate = (dateText) => {
  const [year, month, day] = String(dateText ?? '').split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

export const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const showStartsAt = (show) => {
  const date = parseDate(show.showDate);
  if (!date) {
    return null;
  }
  const [hours = 0, minutes = 0] = String(show.startTime ?? '').split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const isUpcoming = (show, now = new Date()) => {
  const startsAt = showStartsAt(show);
  return Boolean(startsAt) && startsAt > now;
};

export const formatShowDate = (dateText, options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) => {
  const date = parseDate(dateText);
  return date ? date.toLocaleDateString('en-IN', options) : '';
};

export const formatCurrency = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const fetchMovies = async () => (await api.get('/movies')).data.map(mapMovie);

export const fetchMovie = async (id) => mapMovie((await api.get(`/movies/${id}`)).data);

export const fetchTheatres = async () => (await api.get('/theatres')).data;

export const fetchShowtimes = async () => (await api.get('/showtimes')).data;

export const fetchShowtimesByMovie = async (movieId) => (await api.get(`/showtimes/movie/${movieId}`)).data;

export const fetchShowtime = async (id) => (await api.get(`/showtimes/${id}`)).data;

export const fetchSeatMap = async (showtimeId) => (await api.get(`/showtimes/${showtimeId}/seats`)).data;

export const createBooking = async (payload) => (await api.post('/bookings', payload)).data;

export const fetchBooking = async (id) => (await api.get(`/bookings/${id}`)).data;

export const fetchMyBookings = async () => (await api.get('/bookings/my')).data;

// Route params must be positive integers before they are sent to the backend
export const parseId = (value) => (/^\d+$/.test(String(value ?? '')) && Number(value) > 0 ? Number(value) : null);
