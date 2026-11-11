import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/Register.css'
import api from '../../api';

function Field({ id, label, error, className = '', children }) {
  return <div className={`register-field ${className}`}>
    <label htmlFor={id}>{label}<span aria-hidden="true">*</span></label>
    {children}
    {error && <p className="field-error" id={`${id}-error`} role="alert">{error.message}</p>}
  </div>;
}

function EyeIcon({ visible }) {
  return visible
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.7 4.8 9.5 6.1a1.6 1.6 0 0 1 0 1.8 14 14 0 0 1-3.1 3.4M6.2 6.2a15 15 0 0 0-3.7 4.9 1.6 1.6 0 0 0 0 1.8C3.3 14.2 6.8 19 12 19c.9 0 1.7-.1 2.5-.4"/></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>;
}

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { register, handleSubmit, watch, getValues, reset, formState: { errors, isSubmitting } } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false },
  });
  const password = watch('password', '');
  const passwordScore = [/[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), password.length >= 8, /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const strength = !password ? '' : passwordScore <= 2 ? 'Weak' : passwordScore <= 4 ? 'Medium' : 'Strong';

  const submitValidForm = async (data) => {
    try {
      const response = await api.post('/users', data);
      const registeredUser = response.data?.user ?? response.data ?? {};
      setUser({ ...data, ...registeredUser });
      reset();
      setPasswordVisible(false);
      setConfirmVisible(false);
      toast.success('Your account has been created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error(error);
    }
  };

  return <main className="register-page">
    <section className="register-story" aria-label="Seatify introduction">
      <div className="story-backdrop" />
      <div className="story-content">
        <a className="register-brand" href="/" aria-label="Seatify home">
          <img src="/assets/seatify-logo.png" alt="" />
          <span>SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span>
        </a>
        <div className="story-copy">
          <span className="story-kicker"><i/> YOUR NEXT NIGHT OUT STARTS HERE</span>
          <h1>Your Seat.<br/>Your Movie.<br/><em>Your Experience.</em></h1>
          <p>Create your account and make your next movie experience unforgettable.</p>
        </div>
        <div className="story-bottom"><span>01 <i/> THE MAGIC STARTS WITH A SEAT</span><span>SEATIFY CINEMA CLUB</span></div>
      </div>
    </section>

    <section className="register-panel">
      <div className="register-card">
        <div className="register-heading">
          <span className="form-eyebrow">A BETTER WAY TO GO TO THE MOVIES</span>
          <h2>Create Your Account</h2>
          <p>Join SEATIFY and book your next movie experience.</p>
        </div>

        <form className="register-form" noValidate onSubmit={handleSubmit(submitValidForm)}>
          <div className="form-grid">
            <Field id="firstName" label="First Name" error={errors.firstName}>
              <input id="firstName" type="text" autoComplete="given-name" placeholder="Enter your first name" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                {...register('firstName', {
                  required: 'First name is required',
                  maxLength: { value: 50, message: 'First name cannot exceed 50 characters' },
                  pattern: { value: /^[A-Za-z ]+$/, message: 'First name can contain only letters and spaces' },
                  validate: {
                    notBlank: (value) => value.trim().length > 0 || 'First name is required',
                    minCharacters: (value) => value.trim().length >= 2 || 'First name must be at least 2 characters',
                  },
                })}/>
            </Field>
            <Field id="lastName" label="Last Name" error={errors.lastName}>
              <input id="lastName" type="text" autoComplete="family-name" placeholder="Enter your last name" aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                {...register('lastName', {
                  required: 'Last name is required',
                  maxLength: { value: 50, message: 'Last name cannot exceed 50 characters' },
                  pattern: { value: /^[A-Za-z ]+$/, message: 'Last name can contain only letters and spaces' },
                  validate: {
                    notBlank: (value) => value.trim().length > 0 || 'Last name is required',
                    minCharacters: (value) => value.trim().length >= 2 || 'Last name must be at least 2 characters',
                  },
                })}/>
            </Field>
            <Field id="email" label="Email Address" error={errors.email}>
              <input id="email" type="email" autoComplete="email" placeholder="Enter your email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', { required: 'Email address is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })}/>
            </Field>
            <Field id="phone" label="Phone Number" error={errors.phone}>
              <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="Enter 10-digit mobile number" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone', { required: 'Phone number is required', pattern: { value: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' } })}/>
            </Field>
            <Field id="password" label="Password" error={errors.password}>
              <div className={`password-control ${errors.password ? 'invalid' : ''}`}>
                <input id="password" type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : 'password-help'}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: 'Use uppercase, lowercase, and a number' } })}/>
                <button type="button" className="visibility-toggle" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((value) => !value)}><EyeIcon visible={passwordVisible}/></button>
              </div>
              <div className="password-strength" id="password-help" aria-live="polite">
                <span>Password strength</span><div className={`strength-track ${strength.toLowerCase()}`}><i/><i/><i/></div><b className={strength.toLowerCase()}>{strength || '—'}</b>
              </div>
            </Field>
            <Field id="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
              <div className={`password-control ${errors.confirmPassword ? 'invalid' : ''}`}>
                <input id="confirmPassword" type={confirmVisible ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === getValues('password') || 'Passwords do not match' })}/>
                <button type="button" className="visibility-toggle" aria-label={confirmVisible ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setConfirmVisible((value) => !value)}><EyeIcon visible={confirmVisible}/></button>
              </div>
            </Field>
          </div>

          <div className="terms-row">
            <input id="terms" type="checkbox" aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? 'terms-error' : undefined}
              {...register('terms', { required: 'You must accept the terms and conditions' })}/>
            <label htmlFor="terms">I agree to the <a href="#terms" onClick={(event) => event.preventDefault()}>Terms &amp; Conditions</a> and <a href="#privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a></label>
          </div>
          {errors.terms && <p className="field-error terms-error" id="terms-error" role="alert">{errors.terms.message}</p>}
          <button className="create-account" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Validating…' : 'Create Account'}<span aria-hidden="true">↗</span></button>
        </form>

        <p className="login-prompt">Already have an account? <Link to="/login">Login</Link></p>
        <div className="register-legal">BY CONTINUING, YOU AGREE TO OUR <span>TERMS OF SERVICE</span></div>
      </div>
    </section>
  </main>;
}

export default Register;
