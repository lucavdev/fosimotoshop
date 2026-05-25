import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { validateCoupon } from "../api";

const SHIPPING_COST = 15000;

// Step 1: Cart review
// Step 2: Shipping + Coupon + Confirm

const Cart = ({ onClose }) => {
  const { items, addItem, removeItem, removeItemCompletely, subtotal, checkout } = useCart();
  const { isLogged } = useAuth();
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Shipping
  const [shippingType, setShippingType] = useState("retiro");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingCost = shippingType === "correo" ? SHIPPING_COST : 0;
  const totalWithShipping = Math.max(0, subtotal - couponDiscount) + shippingCost;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await validateCoupon({ code: couponInput, subtotal });
      setCouponCode(couponInput.toUpperCase());
      setCouponDiscount(res.discountAmount);
      setCouponMsg({ type: "ok", text: `✓ Cupón aplicado: −$${Math.round(res.discountAmount).toLocaleString()}` });
    } catch (err) {
      setCouponMsg({ type: "err", text: err.message });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponDiscount(0);
    setCouponMsg(null);
  };

  const handleCheckout = async () => {
    if (shippingType === "correo" && (!province || !city || !address || !postalCode)) {
      setMsg("Completá todos los datos de envío.");
      return;
    }
    setLoading(true);
    setMsg(null);
    const result = await checkout({ shippingType, province, city, address, postalCode, couponCode });
    setLoading(false);
    if (result.success) setDone(true);
    else setMsg(result.message);
  };

  if (done) return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.cart} onClick={(e) => e.stopPropagation()}>
        <div style={styles.success}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¡Orden creada!</h3>
          <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>
            {shippingType === "correo"
              ? "Te enviaremos tu pedido por correo. Te contactaremos para confirmar."
              : "Podés pasar a retirar tu pedido por la sucursal."}
          </p>
          <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.cart} onClick={(e) => e.stopPropagation()} className="slide-in">
        {/* Header */}
        <div style={styles.header}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={styles.backBtn}>← Carrito</button>
          )}
          <h3 style={styles.headerTitle}>
            {step === 1 ? "🛒 Mi carrito" : "📦 Confirmar pedido"}
          </h3>
          <button onClick={onClose} style={styles.xBtn}>✕</button>
        </div>

        {/* Steps indicator */}
        <div style={styles.steps}>
          <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>1. Carrito</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>2. Envío</div>
        </div>

        <div style={styles.body}>
          {/* STEP 1: Cart items */}
          {step === 1 && (
            <>
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
                    <button onClick={() => setStep(2)} style={styles.continueBtn}>
                      Continuar con el envío →
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* STEP 2: Shipping + Coupon */}
          {step === 2 && (
            <>
              {/* Shipping type */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Tipo de envío</div>
                <label style={{ ...styles.radioCard, ...(shippingType === "retiro" ? styles.radioCardActive : {}) }}>
                  <input type="radio" name="shipping" value="retiro" checked={shippingType === "retiro"} onChange={() => setShippingType("retiro")} style={{ accentColor: "#ff3c00" }} />
                  <div>
                    <div style={styles.radioTitle}>🏪 Retiro en sucursal</div>
                    <div style={styles.radioSub}>Gratis · Coordinamos por WhatsApp</div>
                  </div>
                  <span style={{ ...styles.radioPrice, color: "#34d399" }}>Gratis</span>
                </label>
                <label style={{ ...styles.radioCard, ...(shippingType === "correo" ? styles.radioCardActive : {}) }}>
                  <input type="radio" name="shipping" value="correo" checked={shippingType === "correo"} onChange={() => setShippingType("correo")} style={{ accentColor: "#ff3c00" }} />
                  <div>
                    <div style={styles.radioTitle}>🚚 Envío por correo</div>
                    <div style={styles.radioSub}>Correo Argentino · 5–10 días hábiles</div>
                  </div>
                  <span style={styles.radioPrice}>${SHIPPING_COST.toLocaleString()}</span>
                </label>
              </div>

              {/* Address form */}
              {shippingType === "correo" && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Datos de envío</div>
                  <div style={styles.formGrid}>
                    <input placeholder="Provincia *" value={province} onChange={(e) => setProvince(e.target.value)} style={styles.input} />
                    <input placeholder="Ciudad *" value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} />
                    <input placeholder="Domicilio *" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...styles.input, gridColumn: "1/-1" }} />
                    <input placeholder="Código postal *" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={styles.input} />
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Cupón de descuento</div>
                {couponCode ? (
                  <div style={styles.couponApplied}>
                    <span>🎟 <strong>{couponCode}</strong> · −${Math.round(couponDiscount).toLocaleString()}</span>
                    <button onClick={removeCoupon} style={styles.removeCoupon}>Quitar</button>
                  </div>
                ) : (
                  <div style={styles.couponRow}>
                    <input placeholder="Código de cupón" value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{ ...styles.input, flex: 1 }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button onClick={applyCoupon} disabled={couponLoading} style={styles.applyCouponBtn}>
                      {couponLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                )}
                {couponMsg && (
                  <div style={{ ...styles.couponMsg, color: couponMsg.type === "ok" ? "#34d399" : "#f87171" }}>
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div style={styles.summary}>
                <div style={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                {couponDiscount > 0 && <div style={{ ...styles.summaryRow, color: "#34d399" }}><span>Descuento cupón</span><span>−${Math.round(couponDiscount).toLocaleString()}</span></div>}
                <div style={styles.summaryRow}><span>Envío</span><span style={{ color: shippingCost === 0 ? "#34d399" : "#fff" }}>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}</span></div>
                <div style={styles.divider} />
                <div style={{ ...styles.summaryRow, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  <span>Total</span><span>${Math.round(totalWithShipping).toLocaleString()}</span>
                </div>
              </div>

              {msg && <div style={styles.errMsg}>{msg}</div>}

              <button onClick={handleCheckout} disabled={loading} style={styles.buyBtn}>
                {loading ? "Procesando..." : "✅ Confirmar pedido"}
              </button>
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
  backBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#fff" },
  xBtn: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18, padding: 4 },
  steps: { display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #1e1e1e", gap: 0, flexShrink: 0 },
  step: { fontSize: 12, color: "#555", fontWeight: 600, flex: 1, textAlign: "center" },
  stepActive: { color: "#ff3c00" },
  stepLine: { flex: 2, height: 1, background: "#2a2a2a" },
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

  // Step 2
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 },
  radioCard: { display: "flex", alignItems: "center", gap: 12, background: "#1a1a1a", border: "1.5px solid #222", borderRadius: 10, padding: "12px 14px", cursor: "pointer", marginBottom: 8, transition: "border-color 0.15s" },
  radioCardActive: { borderColor: "#ff3c00", background: "rgba(255,60,0,0.05)" },
  radioTitle: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 },
  radioSub: { fontSize: 12, color: "#666" },
  radioPrice: { marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  input: { padding: "9px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" },
  couponRow: { display: "flex", gap: 8 },
  applyCouponBtn: { padding: "9px 14px", background: "#ff3c00", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" },
  couponApplied: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#34d399" },
  removeCoupon: { background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  couponMsg: { fontSize: 12, marginTop: 6, fontWeight: 500 },
  summary: { background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#888" },
  errMsg: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 12 },
  buyBtn: { width: "100%", padding: "15px", background: "linear-gradient(135deg, #25D366, #22c55e)", border: "none", color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(37,211,102,0.25)" },
  success: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", flex: 1, padding: "40px 24px" },
};

export default Cart;
