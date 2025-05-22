import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="d-flex justify-content-between w-100">
        <Link className="navbar-brand" to="/">RTSP Stream Viewer</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Streams</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add">Add Stream</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/grid">Grid View</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;