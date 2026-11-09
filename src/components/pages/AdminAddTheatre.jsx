import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/AdminAddMovie.css'
import '../../styles/AdminMovieManagement.css'
import api from '../../api'
import AdminNavigation from '../common/AdminNavigation'

function AdminAddTheatre() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      city: '',
      address: '',
      totalscreens: ''
    }
  })

  const submitTheatre = async (data) => {
    setIsSubmitting(true)
    setSubmitMessage('')

    const theatreData = {
      name: data.name,
      city: data.city,
      address: data.address,
      totalscreens: Number(data.totalscreens)
    }

    try {
      const response = await api.post('/theatres', theatreData)
      console.log('Theatre added successfully:', response.data)
      setSubmitMessage('Theatre saved successfully to the database!')
      reset()

      setTimeout(() => {
        navigate('/admin/theatres')
      }, 1500)
    } catch (error) {
      console.error('Error adding theatre:', error)
      setSubmitMessage('Failed to add theatre. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearForm = () => {
    reset()
    setSubmitMessage('')
  }

  const field = (name, label, control, options = {}) => (
    <div className={`admin-movie-field ${options.full ? 'full-width' : ''}`}>
      <label htmlFor={name}>
        {label}
        {options.required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {errors[name] && (
        <small className="admin-field-error" role="alert">
          {errors[name].message}
        </small>
      )}
    </div>
  )

  return (
    <main className="admin-movie-page">
      <div className="admin-movie-shell">
        <AdminNavigation />
        <Link className="admin-back-link" to="/admin/theatres" aria-label="Back to theatre list">
          <span aria-hidden="true">←</span> Back to Theatre List
        </Link>
        <header className="admin-movie-heading">
          <span className="admin-movie-kicker">SEATIFY · THEATRES</span>
          <h1>Add New Theatre</h1>
          <p>Add theatre information to the Seatify theatre catalogue.</p>
        </header>

        <form className="admin-movie-form" noValidate onSubmit={handleSubmit(submitTheatre)}>
          <div className="admin-form-grid">
            {field(
              'name',
              'Theatre Name',
              <input
                id="name"
                placeholder="e.g. PVR Cinemas"
                {...register('name', { required: 'Theatre name is required.' })}
              />,
              { required: true }
            )}
            {field(
              'city',
              'City',
              <input
                id="city"
                placeholder="e.g. Mumbai"
                {...register('city', { required: 'City is required.' })}
              />,
              { required: true }
            )}
            {field(
              'address',
              'Address',
              <textarea
                id="address"
                rows="3"
                placeholder="Enter the complete address..."
                {...register('address', { required: 'Address is required.' })}
              />,
              { required: true, full: true }
            )}
            {field(
              'totalscreens',
              'Total Screens',
              <input
                id="totalscreens"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5"
                {...register('totalscreens', {
                  required: 'Total screens is required.',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Total screens must be at least 1.' },
                  validate: (value) =>
                    Number.isInteger(value) || 'Enter a whole number.'
                })}
              />,
              { required: true }
            )}
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Theatre...' : 'Add Theatre'}
              <span aria-hidden="true">↗</span>
            </button>
            <button
              className="admin-clear-button"
              type="button"
              onClick={clearForm}
              disabled={isSubmitting}
            >
              Clear Form
            </button>
            <Link
              className="admin-cancel-link"
              to="/admin/theatres"
              style={{ marginLeft: 'auto' }}
            >
              Cancel
            </Link>
          </div>
        </form>

        {submitMessage && (
          <div
            role="status"
            style={{
              marginTop: '16px',
              padding: '13px 16px',
              borderRadius: '8px',
              backgroundColor: submitMessage.includes('success')
                ? '#ECFDF3'
                : '#FEF2F2',
              color: submitMessage.includes('success') ? '#15803D' : '#B42332',
              border: `1px solid ${
                submitMessage.includes('success')
                  ? 'rgba(34, 197, 94, 0.35)'
                  : 'rgba(244, 63, 94, 0.35)'
              }`,
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {submitMessage}
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminAddTheatre
