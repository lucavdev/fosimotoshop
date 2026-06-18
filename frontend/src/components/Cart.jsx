import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = ({ onClose }) => {
  const { items, addItem, removeItem, removeItemCompletely, subtotal } = useCart();
  const { isLogged } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.cart} onClick={(e) => e.stopPropagation()} className="slide-in">
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>🛒 Mi carrito</h3>
          <button onClick={onClose} style={styles.xBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {items.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
              <p style={{ color: "#666", fontSize: 13 }}>El carrito está vacío</p>
              <button onClick={onClose} style={{ ...styles.closeBtn, marginTop: 12 }}>Seguir comprando</button>
            </div>
          ) : (
            <>
              <div style={styles.itemList}>
                {items.map((item) => (
                  <div key={item._key} style={styles.item}>
                    <img src={item.image || `https://picsum.photos/seed/${item.id}/100/100`}
                      alt={item.name} style={styles.thumb}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100`; }}
                    />
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{item.name}</span>
                      {(item.size || item.color) && (
                        <span style={styles.itemVariant}>
                          {item.size && `Talle: ${item.size}`}
                          {item.size && item.color && " · "}
                          {item.color && `Color: ${item.color}`}
                        </span>
                      )}
                      <span style={styles.itemPrice}>${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                    <div style={styles.qtyControl}>
                      <button onClick={() => removeItem(item._key)} style={styles.qtyBtn}>−</button>
                      <span style={styles.qty}>{item.qty}</span>
                      <button onClick={() => addItem(item)} style={styles.qtyBtn}>+</button>
                    </div>
                    <button onClick={() => removeItemCompletely(item._key)} style={styles.deleteBtn} title="Eliminar">🗑</button>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />
              <div style={styles.totalRow}>
                <span style={{ color: "#aaa" }}>Subtotal</span>
                <span style={styles.totalAmount}>${subtotal.toLocaleString()}</span>
              </div>

              {!isLogged ? (
                <div style={styles.loginHint}>
                  <p style={{ margin: "0 0 10px", fontSize: 13 }}>Necesitás una cuenta para finalizar.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to="/login" onClick={onClose} style={styles.loginLink}>Iniciar sesión</Link>
                    <Link to="/register" onClick={onClose} style={styles.registerLink}>Registrarse</Link>
                  </div>
                </div>
              ) : (
                <button onClick={handleContinue} style={styles.continueBtn}>
                  Continuar con la compra →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", justifyContent: "flex-end", backdropFilter: "blur(4px)" },
  cart: { background: "#111", borderLeft: "1px solid #222", width: "min(420px, 100vw)", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.7)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#fff" },
  xBtn: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18, padding: 4 },
  body: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 0 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  itemList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 },
  item: { display: "flex", alignItems: "center", gap: 10, background: "#1a1a1a", borderRadius: 10, padding: "10px 12px", border: "1px solid #222" },
  thumb: { width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  itemInfo: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 },
  itemName: { fontSize: 13, color: "#ddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 },
  itemVariant: { fontSize: 11, color: "#555" },
  itemPrice: { fontSize: 13, color: "#fff", fontWeight: 700 },
  qtyControl: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  qtyBtn: { background: "#2a2a2a", border: "none", color: "white", width: 24, height: 24, borderRadius: 6, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" },
  qty: { fontSize: 14, color: "#fff", minWidth: 20, textAlign: "center", fontWeight: 700 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: 0.5, transition: "opacity 0.2s", flexShrink: 0, padding: 2 },
  divider: { height: 1, background: "#1e1e1e", margin: "12px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 15, color: "#ccc", marginBottom: 16 },
  totalAmount: { color: "#fff", fontWeight: 800, fontSize: 18 },
  loginHint: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#888" },
  loginLink: { flex: 1, textAlign: "center", padding: "8px", background: "#ff3c00", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" },
  registerLink: { flex: 1, textAlign: "center", padding: "8px", background: "#1a1a1a", border: "1px solid #333", color: "#aaa", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" },
  continueBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #ff3c00, #ff5722)", border: "none", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  closeBtn: { background: "#222", border: "none", color: "#ddd", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14, marginTop: 8 },
};

export default Cart;
