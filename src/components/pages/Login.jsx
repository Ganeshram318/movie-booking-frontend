import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import './Register.css';
import './Login.css';

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });

  const submitValidForm = () => setSuccess(true);

  return <main className="register-page login-page">
    <section className="register-story" aria-label="Seatify introduction">
      <div className="story-backdrop" />
      <div className="story-content">
        <Link className="register-brand" to="/" aria-label="Seatify home">
          <img src="/assets/seatify-logo.png" alt="" />
          <span>SEATIFY<small>YOUR MOVIE, YOUR MOMENT</small></span>
        </Link>
        <div className="story-copy">
          <span className="story-kicker"><i/> YOUR NEXT NIGHT OUT STARTS HERE</span>
          <h1>Your Seat.<br/>Your Movie.<br/><em>Your Experience.</em></h1>
          <p>Make room for the stories, scenes and nights you’ll remember.</p>
        </div>
        <div className="story-bottom"><span>01 <i/> THE MAGIC STARTS WITH A SEAT</span><span>SEATIFY CINEMA CLUB</span></div>
      </div>
    </section>

    <section className="register-panel">
      <div className="register-card login-card">
        <div className="register-heading">
          <span className="form-eyebrow">WELCOME TO YOUR MOVIE MOMENT</span>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your SEATIFY experience.</p>
        </div>
        <form className="register-form" noValidate onSubmit={handleSubmit(submitValidForm)}>
          <div className="form-grid login-grid">
            <div className="register-field">
              <label htmlFor="loginEmail">Email Address<span aria-hidden="true">*</span></label>
              <input id="loginEmail" type="email" autoComplete="email" placeholder="Enter your email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'loginEmail-error' : undefined}
                {...register('email', { required: 'Email address is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })}/>
              {errors.email && <p className="field-error" id="loginEmail-error" role="alert">{errors.email.message}</p>}
            </div>
            <div className="register-field">
              <label htmlFor="loginPassword">Password<span aria-hidden="true">*</span></label>
              <div className="password-control">
                <input id="loginPassword" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'loginPassword-error' : undefined}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}/>
                <button type="button" className="visibility-toggle" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((value) => !value)}>
                  {passwordVisible ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.7 4.8 9.5 6.1a1.6 1.6 0 0 1 0 1.8 14 14 0 0 1-3.1 3.4M6.2 6.2a15 15 0 0 0-3.7 4.9 1.6 1.6 0 0 0 0 1.8C3.3 14.2 6.8 19 12 19c.9 0 1.7-.1 2.5-.4"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>}
                </button>
              </div>
              {errors.password && <p className="field-error" id="loginPassword-error" role="alert">{errors.password.message}</p>}
            </div>
          </div>

          <div className="login-options">
            <label className="remember-option">
              <input type="checkbox" aria-label="Remember me" {...register('rememberMe')}/><span>Remember me</span>
            </label>
            <a href="#forgot-password" onClick={(event) => event.preventDefault()}>Forgot Password?</a>
          </div>
          {success && <p className="register-success" role="status">✓ Login details are valid!</p>}
          <button className="create-account" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Validating…' : 'Sign In'}<span aria-hidden="true">↗</span></button>
        </form>
        <p className="login-prompt">Don’t have an account? <Link to="/register">Sign Up</Link></p>
      </div>
    </section>
  </main>;
}

export default Login
