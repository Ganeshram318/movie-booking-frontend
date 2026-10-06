import React from 'react'

function Navbar2() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid px-4">
        <a className="navbar-brand text-uppercase fw-bold" href="/">
          StartupX
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTwo"
          aria-controls="navbarTwo"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTwo">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#features">
                Features
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#pricing">
                Pricing
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#team">
                Team
              </a>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <a className="btn btn-outline-light" href="#login">
              Login
            </a>
            <a className="btn btn-warning" href="#register">
              Register
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar2
