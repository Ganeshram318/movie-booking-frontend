import React from 'react'

function Footer2() {
  return (
    <footer className="site-footer footer-variant-two mt-5">
      <div className="container py-5">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-5">
            <span className="footer-eyebrow">Launch Faster</span>
            <h2 className="footer-hero mt-3">Ready to build your next digital product?</h2>
            <p className="footer-text mt-3">
              Strategy, branding, UI design, and development in one place for
              teams that want momentum.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <a className="btn btn-light px-4" href="#register">
                Register
              </a>
              <a className="btn btn-outline-light px-4" href="#contact">
                Book a Call
              </a>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <h5 className="footer-title">Product</h5>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#updates">Updates</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <h5 className="footer-title">Resources</h5>
            <ul className="footer-links">
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <h5 className="footer-title">Contact</h5>
            <ul className="footer-contact-list">
              <li>hello@creativehub.com</li>
              <li>+91 98765 43210</li>
              <li>Bangalore, India</li>
            </ul>
            <div className="footer-socials mt-3">
              <a href="#x">X</a>
              <a href="#dribbble">Dribbble</a>
              <a href="#behance">Behance</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-5 pt-4">
          <p className="mb-0">&copy; 2026 CreativeHub Studio.</p>
          <div className="footer-bottom-links d-flex flex-wrap gap-3">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer2
