import React from 'react'

function Navbar3() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light sticky-top"
      style={{
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(244,247,255,0.97) 100%)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container py-2">
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #0d6efd, #20c997)',
              boxShadow: '0 10px 25px rgba(13, 110, 253, 0.25)',
            }}
          >
            C
          </span>
          <span className="text-dark">CreativeHub</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarThree"
          aria-controls="navbarThree"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarThree">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-2">
            <li className="nav-item">
              <a className="nav-link fw-semibold text-dark" href="#services">
                Services
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold text-dark" href="#work">
                Our Work
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold text-dark" href="#pricing">
                Pricing
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold text-dark" href="#about">
                About
              </a>
            </li>
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 my-3 my-lg-0">
            <form className="d-flex">
              <input
                className="form-control rounded-pill border-0"
                type="search"
                placeholder="Search inspiration"
                aria-label="Search"
                style={{
                  minWidth: '220px',
                  backgroundColor: '#eef4ff',
                  paddingLeft: '1rem',
                }}
              />
            </form>
            <div className="d-flex gap-2">
              <a className="btn btn-outline-primary rounded-pill px-4" href="#login">
                Login
              </a>
              <a
                className="btn rounded-pill px-4 text-white"
                href="#register"
                style={{
                  background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                  border: 'none',
                  boxShadow: '0 12px 24px rgba(102, 16, 242, 0.25)',
                }}
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar3
