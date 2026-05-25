import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const Navbar = ({ toggleCart }) => {
  const { user, isAdmin, isLogged, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>🏍️ <span style={styles.logoText}>FosiMotoShop MX</span></Link>

        {/* Desktop links */}
        <div style={styles.desktopLinks}>
          <Link to="/" style={styles.link}>Inicio</Link>
          <Link to="/products" style={styles.link}>Productos</Link>
          {isAdmin && <Link to="/admin" style={styles.linkAdmin}>⚙️ Admin</Link>}
          {isLogged && <Link to="/orders" style={styles.link}>Mis Órdenes</Link>}
        </div>

        <div style={styles.right}>
          <button onClick={toggleCart} style={styles.cartBtn} id="cart-toggle">
            🛒 {count > 0 && <span style={styles.badge}>{count}</span>}
          </button>
          {isLogged ? (
            <div style={styles.userMenu}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={styles.userBtn} id="user-menu-btn">
                👤 {user.name.split(" ")[0]} ▾
              </button>
              {menuOpen && (
                <div style={styles.dropdown} className="fade-in">
                  <div style={styles.dropdownName}>{user.name}</div>
                  <div style={styles.dropdownEmail}>{user.email}</div>
                  <div style={styles.dropdownDivider} />
                  <Link to="/orders" onClick={() => setMenuOpen(false)} style={styles.dropdownLink}>📦 Mis Órdenes</Link>
                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={styles.dropdownItemRed}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>Ingresar</Link>
          )}
          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={styles.hamburger} className="hide-desktop" aria-label="Menú">
            <span style={{ ...styles.bar, transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ ...styles.bar, opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ ...styles.bar, transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={styles.mobileDrawer} className="fade-in">
          <Link to="/" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🏠 Inicio</Link>
          <Link to="/products" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🛍️ Productos</Link>
          {isLogged && <Link to="/orders" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>📦 Mis Órdenes</Link>}
          {isAdmin && <Link to="/admin" style={{ ...styles.mobileLink, color: "#f59e0b" }} onClick={() => setMobileOpen(false)}>⚙️ Admin</Link>}
          <div style={{ height: 1, background: "#2a2a2a", margin: "8px 0" }} />
          {isLogged ? (
            <button onClick={handleLogout} style={{ ...styles.mobileLink, background: "none", border: "none", color: "#f87171", textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>🚪 Cerrar sesión</button>
          ) : (
            <Link to="/login" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>👤 Iniciar sesión</Link>
          )}
        </div>
      )}
      {mobileOpen && <div style={styles.overlay} onClick={() => setMobileOpen(false)} />}
    </>
  );
};

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "var(--nav-height, 64px)", background: "rgba(13,13,13,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 1000 },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #fff 40%, #ff3c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  desktopLinks: { display: "flex", gap: 4, alignItems: "center" },
  right: { display: "flex", gap: 10, alignItems: "center" },
  link: { color: "#aaa", textDecoration: "none", fontSize: 14, padding: "6px 12px", borderRadius: 6, transition: "color 0.2s, background 0.2s" },
  linkAdmin: { color: "#f59e0b", textDecoration: "none", fontSize: 14, padding: "6px 12px", borderRadius: 6 },
  cartBtn: { background: "#ff3c00", border: "none", color: "white", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "background 0.2s" },
  badge: { background: "white", color: "#ff3c00", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  loginBtn: { background: "transparent", border: "1.5px solid #ff3c00", color: "#ff3c00", padding: "7px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap" },
  userMenu: { position: "relative" },
  userBtn: { background: "transparent", border: "1px solid #333", color: "#ddd", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" },
  dropdown: { position: "absolute", right: 0, top: "110%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: "8px 0", minWidth: 200, zIndex: 1100, boxShadow: "0 12px 40px rgba(0,0,0,0.7)" },
  dropdownName: { padding: "10px 16px", fontSize: 14, fontWeight: 700, color: "#fff" },
  dropdownEmail: { padding: "0 16px 10px", fontSize: 12, color: "#888" },
  dropdownDivider: { height: 1, background: "#2a2a2a", margin: "2px 0" },
  dropdownLink: { display: "block", padding: "10px 16px", fontSize: 13, color: "#ccc", textDecoration: "none", transition: "background 0.15s" },
  dropdownItemRed: { display: "block", width: "100%", padding: "10px 16px", background: "transparent", border: "none", color: "#f87171", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  hamburger: { display: "flex", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 6 },
  bar: { display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s" },
  mobileDrawer: { position: "fixed", top: 64, left: 0, right: 0, background: "#111", borderBottom: "1px solid #222", zIndex: 999, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 },
  mobileLink: { display: "block", padding: "12px 20px", color: "#ddd", textDecoration: "none", fontSize: 15, borderRadius: 8, transition: "background 0.15s" },
  overlay: { position: "fixed", inset: 0, top: 64, zIndex: 998, background: "rgba(0,0,0,0.5)" },
};

// Hide desktop links on mobile via inline media check (workaround for inline styles)
const styleTag = document.createElement("style");
styleTag.textContent = `
  @media (max-width: 768px) {
    nav .desktop-links { display: none !important; }
  }
`;
if (!document.head.querySelector("[data-navbar-styles]")) {
  styleTag.setAttribute("data-navbar-styles", "1");
  document.head.appendChild(styleTag);
}

export default Navbar;
