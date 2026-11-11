
import { Link } from "react-router-dom";
import { Utensils, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <Utensils size={23} />
        </span>
        <span>Foodie<span className="brand-orange">Bot</span></span>
      </Link>

      <button
        className="mobile-menu"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`nav-links ${menuOpen ? "show-menu" : ""}`}>
        <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#categories" onClick={() => setMenuOpen(false)}>Explore Food</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>

        <div className="nav-actions">
          <Link to="/login" className="login-link">Log In</Link>
          <Link to="/register" className="signup-btn">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

