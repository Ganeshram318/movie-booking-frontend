import React from 'react'

function Footer3() {
  return (
    <footer className="site-footer footer-variant-three mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <div className="footer-brand">
              <span className="footer-brand-mark">C</span>
              <span>CreativeHub</span>
            </div>
            <p className="footer-text mt-3">
              A clean, compact footer for portfolios, agencies, and startup
              landing pages.
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-title">Explore</h5>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#portfolio">Portfolio</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-title">Account</h5>
            <ul className="footer-links">
              <li><a href="#login">Login</a></li>
              <li><a href="#register">Register</a></li>
              <li><a href="#support">Support</a></li>
              <li><a href="#settings">Settings</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-5">
            <div className="footer-card">
              <h5 className="footer-title mb-2">Join Our Newsletter</h5>
              <p className="footer-text mb-3">
                Monthly design notes, launch tips, and product ideas.
              </p>
              <form className="footer-subscribe d-flex flex-column flex-sm-row gap-2">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your email address"
                  aria-label="Email address"
                />
                <button type="button" className="btn btn-primary px-4">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-4 pt-4">
          <p className="mb-0">&copy; 2026 CreativeHub. Designed for modern web pages.</p>
          <div className="footer-bottom-links d-flex flex-wrap gap-3">
            <a href="#instagram">Instagram</a>
            <a href="#linkedin">LinkedIn</a>
            <a href="#youtube">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer3
