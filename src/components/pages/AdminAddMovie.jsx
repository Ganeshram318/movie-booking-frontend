import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import api, { getErrorMessage } from '../../api'
import AdminNavigation from '../common/AdminNavigation'

const genres = ['Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Horror', 'Sci-Fi', 'Animation', 'Adventure', 'Sports']
const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Other']

function validUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function AdminAddMovie() {
  const submissionInFlight = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMovie, setPreviewMovie] = useState(null)
  const [posterFailed, setPosterFailed] = useState(false)
  const [apiMessage,setApiMesaage] = useState(' ')
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', genre: '', language: '', duration: '', releaseDate: '', posterUrl: '', bannerUrl: '', rating: '', price: '', featured: false, director: '', cast: '', certification: '' },
  })
  const posterUrl = watch('posterUrl')
  const showPoster = validUrl(posterUrl) && posterUrl && !posterFailed

  const submitMovie = async (data) => {
    if (submissionInFlight.current) return
    submissionInFlight.current = true
    setIsSubmitting(true)
    try {
      const movieData = {
        name: data.title,
        language: data.language,
        genre: data.genre,
        duration: Number(data.duration),
        price: Number(data.price),
        description: data.description,
        releaseDate: data.releaseDate,
        posterUrl: data.posterUrl,
        bannerUrl: data.bannerUrl,
        rating: data.rating === '' ? 0 : Number(data.rating),
        featured: data.featured,
        director: data.director.trim() || null,
        cast: data.cast.trim() || null,
        certification: data.certification.trim() || null,
      }
      setApiMesaage('')
      const response = await api.post('/movies', movieData)
      setPreviewMovie({ ...data, title: response.data.name, duration: response.data.duration, price: response.data.price })
      setApiMesaage('Movie saved successfully to the database!')
      reset()
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to add movie. Please try again later.'))
    } finally {
      submissionInFlight.current = false
      setIsSubmitting(false)
    }
  }

  const clearForm = () => {
    reset()
    setPreviewMovie(null)
    setPosterFailed(false)
  }

  const field = (name, label, control, options = {}) => (
    <div className={`admin-movie-field ${options.full ? 'full-width' : ''}`}>
      <label htmlFor={name}>{label}{options.required && <span aria-hidden="true"> *</span>}</label>
      {control}
      {errors[name] && <small className="admin-field-error" role="alert">{errors[name].message}</small>}
    </div>
  )

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <Link className="admin-back-link" to="/" aria-label="Back to home"><span aria-hidden="true">←</span> Back to Home</Link>
        <header className="admin-movie-heading">
          <span className="admin-movie-kicker">SEATIFY · CATALOGUE</span>
          <h1>Add New Movie</h1>
          <p>Add movie information to the Seatify movie catalogue.</p>
        </header>

        <form className="admin-movie-form" noValidate onSubmit={handleSubmit(submitMovie)}>
          <div className="admin-form-grid">
            {field('title', 'Movie Title', <input id="title" placeholder="e.g. The Grand Adventure" {...register('title', { required: 'Movie title is required.' })} />, { required: true })}
            {field('genre', 'Genre', <select id="genre" {...register('genre', { required: 'Please select a genre.' })}><option value="">Select a genre</option>{genres.map((genre) => <option key={genre}>{genre}</option>)}</select>, { required: true })}
            {field('description', 'Description', <textarea id="description" rows="5" placeholder="Tell audiences what makes this movie special..." {...register('description', { required: 'Description is required.' })} />, { required: true, full: true })}
            {field('language', 'Language', <select id="language" {...register('language', { required: 'Please select a language.' })}><option value="">Select a language</option>{languages.map((language) => <option key={language}>{language}</option>)}</select>, { required: true })}
            {field('duration', 'Duration (minutes)', <input id="duration" type="number" min="1" step="1" placeholder="e.g. 140" {...register('duration', { required: 'Duration is required.', valueAsNumber: true, min: { value: 1, message: 'Duration must be a positive number.' }, validate: (value) => Number.isInteger(value) || 'Enter duration in whole minutes.' })} />, { required: true })}
            {field('releaseDate', 'Release Date', <input id="releaseDate" type="date" {...register('releaseDate', { required: 'Release date is required.' })} />, { required: true })}
            {field('rating', 'Rating (0–10)', <input id="rating" type="number" min="0" max="10" step="0.1" placeholder="e.g. 8.5" {...register('rating', { validate: (value) => value === '' || (Number(value) >= 0 && Number(value) <= 10) || 'Rating must be between 0 and 10.' })} />)}
            {field('price', 'Ticket Price (₹)', <input id="price" type="number" min="0.01" step="0.01" placeholder="e.g. 250" {...register('price', { required: 'Ticket price is required.', valueAsNumber: true, min: { value: 0.01, message: 'Price must be greater than zero.' } })} />, { required: true })}
            {field('director', 'Director', <input id="director" placeholder="e.g. Lokesh Kanagaraj" maxLength={255} {...register('director')} />)}
            {field('certification', 'Certification', <input id="certification" placeholder="e.g. UA 16+" maxLength={255} {...register('certification')} />)}
            {field('cast', 'Cast (comma separated)', <input id="cast" placeholder="e.g. Actor One, Actor Two" maxLength={1000} {...register('cast')} />, { full: true })}
            {field('posterUrl', 'Movie Poster URL', <input id="posterUrl" type="url" placeholder="https://example.com/poster.jpg" {...register('posterUrl', { validate: (value) => validUrl(value) || 'Enter a valid http or https URL.' })} />, { full: true })}
            {field('bannerUrl', 'Banner Image URL', <input id="bannerUrl" type="url" placeholder="https://example.com/banner.jpg" {...register('bannerUrl', { validate: (value) => validUrl(value) || 'Enter a valid http or https URL.' })} />, { full: true })}
            <div className="admin-poster-preview" aria-live="polite">
              {showPoster ? <img src={posterUrl} alt="Movie poster preview" onError={() => setPosterFailed(true)} /> : <div className="admin-poster-placeholder"><span aria-hidden="true">▧</span><small>Poster preview</small></div>}
            </div>
            <label className="admin-feature-toggle"><input type="checkbox" {...register('featured')} /><span className="admin-checkmark"/><span><b>Featured Movie</b><small>Highlight this movie in the catalogue</small></span></label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Movie'} <span aria-hidden="true">↗</span></button>
            <button className="admin-clear-button" type="button" onClick={clearForm} disabled={isSubmitting}>Clear Form</button>
          </div>
        </form>
{apiMessage && (<p role='status'>{apiMessage}</p>)}
        {previewMovie && <section className="admin-submission" aria-live="polite">
          <div className="admin-success"><span aria-hidden="true">✓</span><div><b>Movie saved successfully!</b><small>It is now available to customers on the Seatify home page.</small></div></div>
          <article className="admin-movie-card">
            <div className="admin-card-poster">{validUrl(previewMovie.posterUrl) && !posterFailed ? <img src={previewMovie.posterUrl} alt={`${previewMovie.title} poster`} onError={() => setPosterFailed(true)} /> : <span aria-hidden="true">▧</span>}</div>
            <div className="admin-card-content">{previewMovie.featured && <div className="admin-card-topline"><span className="admin-featured-tag">FEATURED</span></div>}<h2>{previewMovie.title}</h2><p>{previewMovie.genre} <i/> {previewMovie.language} <i/> {previewMovie.duration} min</p><p className="admin-card-description">{previewMovie.description}</p><div className="admin-card-meta">{previewMovie.releaseDate && <span>Release {previewMovie.releaseDate}</span>}{previewMovie.rating !== '' && <span>★ {previewMovie.rating}/10</span>}<span>₹{previewMovie.price}</span></div></div>
          </article>
        </section>}
      </div>
    </main>
  )
}

export default AdminAddMovie
