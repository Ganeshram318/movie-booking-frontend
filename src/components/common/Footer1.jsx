import React from 'react'

function Footer1() {
  return (
    <footer className="site-footer footer-variant-one mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-brand">
              <span className="footer-brand-mark">C</span>
              <span>CreativeHub</span>
            </div>
            <p className="footer-text mt-3 mb-0">
              We build modern digital experiences with clean design, reliable
              code, and a strong focus on growth.
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-title">Company</h5>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="footer-title">Support</h5>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>

          <div className="col-12 col-lg-4">
            <h5 className="footer-title">Stay Updated</h5>
            <p className="footer-text">
              Get product updates, design ideas, and practical tips in your
              inbox.
            </p>
            <form className="footer-subscribe d-flex flex-column flex-sm-row gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                aria-label="Email address"
              />
              <button type="button" className="btn btn-primary px-4">
                Subscribe
              </button>
            </form>
            <div className="footer-socials mt-3">
              <a href="#facebook">Facebook</a>
              <a href="#instagram">Instagram</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-5 pt-4">
          <p className="mb-0">&copy; 2026 CreativeHub. All rights reserved.</p>
          <div className="footer-bottom-links d-flex flex-wrap gap-3">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer1
