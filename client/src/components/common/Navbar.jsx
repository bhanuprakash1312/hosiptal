import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-wrapper">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="nav-logo text-gradient">
            MediBook
          </span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/doctor/login" className="nav-link" style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
            For Providers
          </Link>
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/book-appointment" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem', fontSize: '1rem' }}>
            Book Appointment
          </Link>
        </div>

        {/* Mobile Icon */}
        <div className="md:hidden">
          <button className="text-gray-700 text-2xl" style={{color: 'var(--text-secondary)'}}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
