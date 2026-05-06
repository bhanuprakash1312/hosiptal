import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="nav-logo text-gradient">
            MediBook
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/doctor/login" className="nav-link-provider">For Providers</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/book-appointment" className="nav-btn">
            Book Appointment
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/doctor/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>For Providers</Link>
        <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
        <Link to="/book-appointment" className="mobile-btn" onClick={() => setIsMenuOpen(false)}>
          Book Appointment
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
