
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const Navbar = ({ toggleCart }) => {
  const { user, isAdmin, isLogged, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🏍️ FosiMotoShop MX</Link>
      <div style={styles.right}>
        <Link to="/" style={styles.link}>Inicio</Link>
        <Link to="/products" style={styles.link}>Productos</Link>
        {isAdmin && <Link to="/admin" style={styles.linkAdmin}>⚙️ Admin</Link>}
        <button onClick={toggleCart} style={styles.cartBtn}>
          🛒 {count > 0 && <span style={styles.badge}>{count}</span>}
        </button>
        {isLogged ? (
          <div style={styles.userMenu}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={styles.userBtn}>
              👤 {user.name.split(" ")[0]} ▾
            </button>
            {menuOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownName}>{user.name}</div>
                <div style={styles.dropdownEmail}>{user.email}</div>
                <div style={styles.divider} />
                <button onClick={handleLogout} style={styles.dropdownItem}>Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={styles.loginBtn}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "#111", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 1000 },
  logo: { fontSize: 18, fontWeight: "bold", color: "white", textDecoration: "none" },
  right: { display: "flex", gap: 16, alignItems: "center" },
  link: { color: "#aaa", textDecoration: "none", fontSize: 14 },
  linkAdmin: { color: "#f59e0b", textDecoration: "none", fontSize: 14 },
  cartBtn: { background: "#ff3c00", border: "none", color: "white", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 4 },
  badge: { background: "white", color: "#ff3c00", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  loginBtn: { background: "transparent", border: "1px solid #ff3c00", color: "#ff3c00", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontSize: 13 },
  userMenu: { position: "relative" },
  userBtn: { background: "transparent", border: "1px solid #333", color: "#ddd", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  dropdown: { position: "absolute", right: 0, top: "110%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "8px 0", minWidth: 180, zIndex: 1100 },
  dropdownName: { padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#fff" },
  dropdownEmail: { padding: "0 16px 8px", fontSize: 12, color: "#888" },
  divider: { height: 1, background: "#2a2a2a", margin: "4px 0" },
  dropdownItem: { display: "block", width: "100%", padding: "8px 16px", background: "transparent", border: "none", color: "#f87171", textAlign: "left", cursor: "pointer", fontSize: 13 },
};

export default Navbar;
