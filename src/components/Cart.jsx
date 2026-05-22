
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Cart = ({ onClose }) => {
  const { items, addItem, removeItem, total, checkout } = useCart();
  const { isLogged } = useAuth();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setMsg(null);
    const result = await checkout();
    setLoading(false);
    if (result.success) setDone(true);
    else setMsg(result.message);
  };

  if (done) {
    return (
      <div style={styles.cart}>
        <div style={styles.success}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <strong>¡Orden creada!</strong>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Te contactaremos para coordinar el envío.</p>
          <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.cart}>
      <div style={styles.header}>
        <h3 style={{ fontSize: 15, margin: 0 }}>🛒 Carrito</h3>
        <button onClick={onClose} style={styles.xBtn}>✕</button>
      </div>
      {items.length === 0 && <p style={styles.empty}>El carrito está vacío</p>}
      <div style={styles.itemList}>
        {items.map((item) => (
          <div key={item.id} style={styles.item}>
            <img src={item.image} alt={item.name} style={styles.thumb} />
            <div style={styles.itemInfo}>
              <span style={styles.itemName}>{item.name}</span>
              <span style={styles.itemPrice}>${(item.price * item.qty).toLocaleString()}</span>
            </div>
            <div style={styles.qtyControl}>
              <button onClick={() => removeItem(item.id)} style={styles.qtyBtn}>−</button>
              <span style={styles.qty}>{item.qty}</span>
              <button onClick={() => addItem(item)} style={styles.qtyBtn}>+</button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <span>Total</span>
            <span style={styles.totalAmount}>${total.toLocaleString()}</span>
          </div>
          {msg && <div style={styles.msgBox}>{msg}</div>}
          {!isLogged ? (
            <div style={styles.loginHint}>
              <p style={{ margin: "0 0 8px" }}>Para finalizar necesitás una cuenta.</p>
              <Link to="/login" onClick={onClose} style={styles.loginLink}>Iniciar sesión</Link>
              {" · "}
              <Link to="/register" onClick={onClose} style={styles.loginLink}>Registrarse</Link>
            </div>
          ) : (
            <button onClick={handleCheckout} disabled={loading} style={styles.buyBtn}>
              {loading ? "Procesando..." : "✅ Finalizar compra"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  cart: { position: "fixed", top: 64, right: 16, background: "#1a1a1a", border: "1px solid #2a2a2a", padding: 16, borderRadius: 12, width: 300, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 1500 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  xBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 },
  empty: { color: "#666", fontSize: 13 },
  itemList: { display: "flex", flexDirection: "column", gap: 10 },
  item: { display: "flex", alignItems: "center", gap: 10, background: "#242424", borderRadius: 8, padding: "8px 10px" },
  thumb: { width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 },
  itemInfo: { flex: 1, overflow: "hidden" },
  itemName: { display: "block", fontSize: 12, color: "#ddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemPrice: { display: "block", fontSize: 12, color: "#fff", fontWeight: "bold", marginTop: 2 },
  qtyControl: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  qtyBtn: { background: "#333", border: "none", color: "white", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 13, color: "#fff", minWidth: 16, textAlign: "center" },
  divider: { height: 1, background: "#2a2a2a", margin: "12px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#ccc", marginBottom: 12 },
  totalAmount: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  msgBox: { background: "#2a0000", border: "1px solid #f87171", borderRadius: 6, padding: "8px 12px", color: "#f87171", fontSize: 12, marginBottom: 10 },
  loginHint: { fontSize: 12, color: "#aaa", textAlign: "center", padding: "10px 0" },
  loginLink: { color: "#ff3c00", textDecoration: "none" },
  buyBtn: { width: "100%", padding: 10, background: "#25D366", border: "none", color: "white", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer" },
  success: { textAlign: "center", padding: "24px 0" },
  closeBtn: { marginTop: 12, padding: "8px 20px", background: "#333", border: "none", color: "white", borderRadius: 8, cursor: "pointer" },
};

export default Cart;
