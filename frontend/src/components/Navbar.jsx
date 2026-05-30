import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

const Navbar = ({ toggleCart }) => {
  const { user, isAdmin, isLogged, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);   // user dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // burger menu

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 769) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMobile}>
          🏍️ <span className="navbar__logo-text">FosiMotoShop MX</span>
        </Link>

        {/* Desktop links — hidden on mobile via CSS */}
        <div className="navbar__desktop-links">
          <Link to="/" className="navbar__link">Inicio</Link>
          <Link to="/products" className="navbar__link">Productos</Link>
          {isAdmin && <Link to="/admin" className="navbar__link navbar__link--admin">⚙️ Admin</Link>}
          {isLogged && <Link to="/orders" className="navbar__link">Mis Órdenes</Link>}
        </div>

        {/* Right side — always visible */}
        <div className="navbar__right">
          {/* Cart */}
          <button onClick={toggleCart} className="navbar__cart-btn" id="cart-toggle" aria-label="Carrito">
            🛒 {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </button>

          {/* User menu — desktop only */}
          {isLogged ? (
            <div className="navbar__user-menu navbar__hide-mobile">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="navbar__user-btn"
                id="user-menu-btn"
              >
                👤 {user.name.split(" ")[0]} ▾
              </button>
              {menuOpen && (
                <>
                  <div className="navbar__dropdown fade-in">
                    <div className="navbar__dropdown-name">{user.name}</div>
                    <div className="navbar__dropdown-email">{user.email}</div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="navbar__dropdown-link">
                      📦 Mis Órdenes
                    </Link>
                    <div className="navbar__dropdown-divider" />
                    <button onClick={handleLogout} className="navbar__dropdown-logout">
                      Cerrar sesión
                    </button>
                  </div>
                  <div className="navbar__dropdown-overlay" onClick={() => setMenuOpen(false)} />
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__login-btn navbar__hide-mobile">Ingresar</Link>
          )}

          {/* Burger button — mobile only */}
          <button
            className="navbar__burger navbar__hide-desktop"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            <span className={`navbar__bar ${mobileOpen ? "navbar__bar--top-open" : ""}`} />
            <span className={`navbar__bar ${mobileOpen ? "navbar__bar--mid-open" : ""}`} />
            <span className={`navbar__bar ${mobileOpen ? "navbar__bar--bot-open" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={`navbar__mobile-drawer ${mobileOpen ? "navbar__mobile-drawer--open" : ""}`}>
        <nav className="navbar__mobile-nav">
          <Link to="/" className="navbar__mobile-link" onClick={closeMobile}>
            <span className="navbar__mobile-link-icon">🏠</span> Inicio
          </Link>
          <Link to="/products" className="navbar__mobile-link" onClick={closeMobile}>
            <span className="navbar__mobile-link-icon">🛍️</span> Productos
          </Link>
          {isLogged && (
            <Link to="/orders" className="navbar__mobile-link" onClick={closeMobile}>
              <span className="navbar__mobile-link-icon">📦</span> Mis Órdenes
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="navbar__mobile-link navbar__mobile-link--admin" onClick={closeMobile}>
              <span className="navbar__mobile-link-icon">⚙️</span> Admin
            </Link>
          )}

          <div className="navbar__mobile-divider" />

          {isLogged ? (
            <>
              <div className="navbar__mobile-user">
                <span className="navbar__mobile-user-name">👤 {user.name}</span>
                <span className="navbar__mobile-user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-link--logout">
                <span className="navbar__mobile-link-icon">🚪</span> Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar__mobile-link-cta" onClick={closeMobile}>
              👤 Iniciar sesión
            </Link>
          )}
        </nav>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="navbar__mobile-overlay" onClick={closeMobile} />
      )}
    </>
  );
};

export default Navbar;
