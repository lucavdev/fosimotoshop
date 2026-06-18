import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { validateCoupon } from "../api";

const SHIPPING_COST = 15000;

const PAYMENT_METHODS = [
  { id: "transferencia", label: "Transferencia bancaria", sub: "CBU / CVU · Sin recargo" },
  { id: "debito", label: "Tarjeta de débito", sub: "Sin recargo" },
  { id: "credito", label: "Tarjeta de crédito", sub: "Hasta 3 cuotas sin interés" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, checkout, clearCart } = useCart();
  const { isLogged } = useAuth();

  // Steps: 1 = método de pago, 2 = envío + datos, 3 = confirmación
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [finalTotal, setFinalTotal] = useState(0); // snapshot before cart is cleared

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("");

  // Card fields (debit/credit)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Transfer fields
  const [transferAlias, setTransferAlias] = useState("");

  // Shipping
  const [shippingType, setShippingType] = useState("retiro");

  // Personal data (always)
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");

  // Shipping address (only for "correo")
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

  // Step 1 validation
  const canGoStep2 = () => {
    if (!paymentMethod) return false;
    if (paymentMethod === "transferencia" && !transferAlias.trim()) return false;
    if ((paymentMethod === "debito" || paymentMethod === "credito") &&
      (!cardNumber.trim() || !cardName.trim() || !cardExp.trim() || !cardCvv.trim())) return false;
    return true;
  };

  // Step 2 validation
  const canConfirm = () => {
    if (!nombre.trim() || !dni.trim()) return false;
    if (shippingType === "correo" && (!province.trim() || !city.trim() || !address.trim() || !postalCode.trim())) return false;
    return true;
  };

  const handleCheckout = async () => {
    if (!canConfirm()) { setMsg("Completá todos los campos requeridos."); return; }
    setLoading(true);
    setMsg(null);
    // Snapshot total before checkout() calls clearCart() and resets subtotal to 0
    const snapshotTotal = totalWithShipping;
    const result = await checkout({ shippingType, province, city, address, postalCode, couponCode, paymentMethod, nombre, dni });
    setLoading(false);
    if (result.success) {
      setFinalTotal(snapshotTotal);
      setDone(true);
    } else setMsg(result.message);
  };

  if (!isLogged) return (
    <div style={styles.page}>
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>Iniciá sesión para continuar</h2>
        <p style={styles.emptySub}>Necesitás una cuenta para finalizar tu compra.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link to="/login" style={styles.mainBtn}>Iniciar sesión</Link>
          <Link to="/" style={styles.outlineBtn}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );

  if (items.length === 0 && !done) return (
    <div style={styles.page}>
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
        <p style={styles.emptySub}>Agregá productos antes de continuar.</p>
        <Link to="/products" style={{ ...styles.mainBtn, marginTop: 24 }}>Ver productos</Link>
      </div>
    </div>
  );

  if (done) return (
    <div style={styles.page}>
      <div style={styles.emptyState}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={{ ...styles.emptyTitle, color: "#34d399" }}>¡Pedido confirmado!</h2>
        <p style={styles.emptySub}>
          {shippingType === "correo"
            ? "Te enviaremos tu pedido por correo. Te contactaremos para confirmar los detalles."
            : "Podés pasar a retirar tu pedido por la sucursal. Coordinamos por WhatsApp."}
        </p>
        <div style={{ ...styles.successCard, marginTop: 24 }}>
          <div style={styles.successRow}><span style={styles.successLabel}>Método de pago</span><span style={styles.successVal}>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</span></div>
          <div style={styles.successRow}><span style={styles.successLabel}>Envío</span><span style={styles.successVal}>{shippingType === "correo" ? "Correo Argentino" : "Retiro en sucursal"}</span></div>
          <div style={styles.successRow}><span style={styles.successLabel}>Total abonado</span><span style={{ ...styles.successVal, color: "#fff", fontWeight: 800 }}>${Math.round(finalTotal).toLocaleString()}</span></div>
        </div>
        <Link to="/" style={{ ...styles.mainBtn, marginTop: 24 }}>Volver al inicio</Link>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Volver al carrito</button>

        <h1 style={styles.pageTitle}>Finalizar compra</h1>

        {/* Steps indicator */}
        <div style={styles.stepsBar}>
          {["Método de pago", "Datos y envío", "Confirmación"].map((label, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, ...(step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepCurrent : {}) }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ ...styles.stepLabel, color: step >= i + 1 ? "#fff" : "#555" }}>{label}</span>
              {i < 2 && <div style={{ ...styles.stepConnector, background: step > i + 1 ? "#ff3c00" : "#2a2a2a" }} />}
            </div>
          ))}
        </div>

        <div style={styles.layout}>
          {/* Left column - form */}
          <div style={styles.formCol}>

            {/* ── STEP 1: Payment ── */}
            {step === 1 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>Método de pago</div>

                <div style={styles.methodGrid}>
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} style={{ ...styles.methodCard, ...(paymentMethod === m.id ? styles.methodCardActive : {}) }}
                      onClick={() => setPaymentMethod(m.id)}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ display: "none" }} />
                      <div>
                        <div style={styles.methodLabel}>{m.label}</div>
                        <div style={styles.methodSub}>{m.sub}</div>
                      </div>
                      {paymentMethod === m.id && <span style={styles.checkMark}>✓</span>}
                    </label>
                  ))}
                </div>

                {/* Card fields */}
                {(paymentMethod === "debito" || paymentMethod === "credito") && (
                  <div style={{ marginTop: 20 }}>
                    <div style={styles.fieldLabel}>Número de tarjeta</div>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                      style={styles.input}
                      maxLength={19}
                    />
                    <div style={styles.fieldLabel}>Nombre en la tarjeta</div>
                    <input placeholder="JUAN PEREZ" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} style={styles.input} />
                    <div style={styles.twoCol}>
                      <div>
                        <div style={styles.fieldLabel}>Vencimiento</div>
                        <input placeholder="MM/AA" value={cardExp}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                            setCardExp(v);
                          }}
                          style={styles.input} maxLength={5} />
                      </div>
                      <div>
                        <div style={styles.fieldLabel}>CVV</div>
                        <input placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} style={styles.input} maxLength={4} type="password" />
                      </div>
                    </div>
                    {paymentMethod === "credito" && (
                      <div style={styles.infoBox}>
                        Podés abonar en hasta 3 cuotas sin interés con tarjeta de crédito.
                      </div>
                    )}
                  </div>
                )}

                {/* Transfer fields */}
                {paymentMethod === "transferencia" && (
                  <div style={{ marginTop: 20 }}>
                    <div style={styles.infoBox}>
                      Realizá la transferencia al siguiente alias y adjuntá el comprobante por WhatsApp.
                    </div>
                    <div style={styles.aliasBox}>
                      <span style={styles.aliasLabel}>Alias:</span>
                      <span style={styles.aliasValue}>FOSIMOTO.MX</span>
                    </div>
                    <div style={styles.fieldLabel}>Alias o CBU del remitente (para confirmar)</div>
                    <input placeholder="Tu alias o CBU" value={transferAlias} onChange={(e) => setTransferAlias(e.target.value)} style={styles.input} />
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!canGoStep2()}
                  style={{ ...styles.nextBtn, opacity: canGoStep2() ? 1 : 0.4, cursor: canGoStep2() ? "pointer" : "not-allowed" }}
                >
                  Continuar →
                </button>
              </div>
            )}

            {/* ── STEP 2: Shipping + Personal data ── */}
            {step === 2 && (
              <div style={styles.card}>
                <button onClick={() => setStep(1)} style={styles.stepBackBtn}>← Volver al pago</button>

                {/* Datos personales */}
                <div style={styles.cardTitle}>Datos personales</div>
                <div style={styles.twoCol}>
                  <div>
                    <div style={styles.fieldLabel}>Nombre completo *</div>
                    <input placeholder="Juan Pérez" value={nombre} onChange={(e) => setNombre(e.target.value)} style={styles.input} />
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>DNI *</div>
                    <input placeholder="12345678" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} style={styles.input} maxLength={8} />
                  </div>
                </div>

                {/* Tipo de envío */}
                <div style={{ ...styles.cardTitle, marginTop: 24 }}>Método de envío</div>
                <label style={{ ...styles.shippingCard, ...(shippingType === "retiro" ? styles.shippingCardActive : {}) }}>
                  <input type="radio" name="shipping" value="retiro" checked={shippingType === "retiro"} onChange={() => setShippingType("retiro")} style={{ accentColor: "#ff3c00" }} />
                  <div style={styles.shippingInfo}>
                    <div style={styles.shippingTitle}>Retiro en sucursal</div>
                    <div style={styles.shippingSub}>Gratis · Coordinamos por WhatsApp</div>
                  </div>
                  <span style={{ ...styles.shippingPrice, color: "#34d399" }}>Gratis</span>
                </label>
                <label style={{ ...styles.shippingCard, ...(shippingType === "correo" ? styles.shippingCardActive : {}) }}>
                  <input type="radio" name="shipping" value="correo" checked={shippingType === "correo"} onChange={() => setShippingType("correo")} style={{ accentColor: "#ff3c00" }} />
                  <div style={styles.shippingInfo}>
                    <div style={styles.shippingTitle}>Envío por correo</div>
                    <div style={styles.shippingSub}>Correo Argentino · 5–10 días hábiles</div>
                  </div>
                  <span style={styles.shippingPrice}>${SHIPPING_COST.toLocaleString()}</span>
                </label>

                {/* Address form - only for correo */}
                {shippingType === "correo" && (
                  <div style={{ marginTop: 16 }}>
                    <div style={styles.fieldLabel}>Domicilio *</div>
                    <input placeholder="Av. Siempre Viva 742" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
                    <div style={styles.twoCol}>
                      <div>
                        <div style={styles.fieldLabel}>Provincia *</div>
                        <input placeholder="Buenos Aires" value={province} onChange={(e) => setProvince(e.target.value)} style={styles.input} />
                      </div>
                      <div>
                        <div style={styles.fieldLabel}>Ciudad *</div>
                        <input placeholder="La Plata" value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} />
                      </div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>Código postal *</div>
                      <input placeholder="1900" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={{ ...styles.input, width: "50%" }} />
                    </div>
                  </div>
                )}

                {/* Coupon */}
                <div style={{ ...styles.cardTitle, marginTop: 24 }}>Cupón de descuento</div>
                {couponCode ? (
                  <div style={styles.couponApplied}>
                    <span><strong>{couponCode}</strong> · −${Math.round(couponDiscount).toLocaleString()}</span>
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

                {msg && <div style={styles.errMsg}>{msg}</div>}

                <button
                  onClick={() => { if (canConfirm()) { setMsg(null); setStep(3); } else { setMsg("Completá todos los campos requeridos."); } }}
                  style={{ ...styles.nextBtn, marginTop: 20 }}
                >
                  Revisar pedido →
                </button>
              </div>
            )}

            {/* ── STEP 3: Confirmation ── */}
            {step === 3 && (
              <div style={styles.card}>
                <button onClick={() => setStep(2)} style={styles.stepBackBtn}>← Volver a datos y envío</button>
                <div style={styles.cardTitle}>Revisá tu pedido</div>

                <div style={styles.confirmSection}>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Método de pago</span>
                    <span style={styles.confirmVal}>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</span>
                  </div>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Tipo de envío</span>
                    <span style={styles.confirmVal}>{shippingType === "correo" ? "Correo Argentino" : "Retiro en sucursal"}</span>
                  </div>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Titular</span>
                    <span style={styles.confirmVal}>{nombre} · DNI {dni}</span>
                  </div>
                  {shippingType === "correo" && (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmLabel}>Dirección</span>
                      <span style={styles.confirmVal}>{address}, {city}, {province} ({postalCode})</span>
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div style={styles.confirmItems}>
                  {items.map((item) => (
                    <div key={item._key} style={styles.confirmItem}>
                      <img src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} alt={item.name} style={styles.confirmThumb}
                        onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100`; }} />
                      <span style={styles.confirmItemName}>{item.name} × {item.qty}</span>
                      <span style={styles.confirmItemPrice}>${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {msg && <div style={styles.errMsg}>{msg}</div>}

                <button onClick={handleCheckout} disabled={loading} style={styles.buyBtn}>
                  {loading ? "Procesando..." : "Confirmar pedido"}
                </button>
              </div>
            )}
          </div>

          {/* Right column - order summary */}
          <div style={styles.summaryCol}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryTitle}>Resumen del pedido</div>

              {/* Items */}
              <div style={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item._key} style={styles.summaryItem}>
                    <img src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} alt={item.name} style={styles.summaryThumb}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100`; }} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.summaryItemName}>{item.name}</div>
                      <div style={styles.summaryItemQty}>Cant: {item.qty}</div>
                    </div>
                    <div style={styles.summaryItemPrice}>${(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              {couponDiscount > 0 && (
                <div style={{ ...styles.summaryRow, color: "#34d399" }}>
                  <span>Descuento cupón</span><span>−${Math.round(couponDiscount).toLocaleString()}</span>
                </div>
              )}
              <div style={styles.summaryRow}>
                <span>Envío</span>
                <span style={{ color: shippingCost === 0 ? "#34d399" : "#fff" }}>
                  {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                <span>Total</span><span>${Math.round(totalWithShipping).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#0d0d0d", paddingTop: 80, paddingBottom: 60 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" },
  backBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14, fontFamily: "inherit", padding: "0 0 20px 0", display: "flex", alignItems: "center", gap: 6 },
  pageTitle: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: 28 },

  // Steps bar
  stepsBar: { display: "flex", alignItems: "center", marginBottom: 36, gap: 0 },
  stepItem: { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", border: "2px solid #333", color: "#555", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" },
  stepCurrent: { background: "#ff3c00", border: "2px solid #ff3c00", color: "#fff" },
  stepDone: { background: "#22c55e", border: "2px solid #22c55e", color: "#fff" },
  stepLabel: { fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  stepConnector: { flex: 1, height: 2, minWidth: 20, borderRadius: 2, transition: "background 0.3s" },

  // Layout
  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" },
  formCol: { display: "flex", flexDirection: "column", gap: 0 },
  summaryCol: { position: "sticky", top: 90 },

  // Card
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "28px 28px", marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 },
  stepBackBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: "0 0 16px 0" },

  // Payment methods
  methodGrid: { display: "flex", flexDirection: "column", gap: 10 },
  methodCard: { display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a", border: "1.5px solid #222", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s", position: "relative" },
  methodCardActive: { borderColor: "#ff3c00", background: "rgba(255,60,0,0.05)" },
  methodIcon: { fontSize: 24, flexShrink: 0 },
  methodLabel: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 },
  methodSub: { fontSize: 12, color: "#666" },
  checkMark: { position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#ff3c00", fontWeight: 700, fontSize: 16 },

  // Fields
  fieldLabel: { fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  input: { width: "100%", padding: "11px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  infoBox: { background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#93c5fd", marginTop: 12, lineHeight: 1.5 },
  aliasBox: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "12px 16px", marginTop: 12, marginBottom: 8, display: "flex", gap: 10, alignItems: "center" },
  aliasLabel: { fontSize: 12, color: "#888", fontWeight: 600 },
  aliasValue: { fontSize: 16, color: "#fff", fontWeight: 800, letterSpacing: 1 },

  // Shipping cards
  shippingCard: { display: "flex", alignItems: "center", gap: 12, background: "#1a1a1a", border: "1.5px solid #222", borderRadius: 12, padding: "14px 16px", cursor: "pointer", marginBottom: 10, transition: "border-color 0.15s" },
  shippingCardActive: { borderColor: "#ff3c00", background: "rgba(255,60,0,0.05)" },
  shippingInfo: { flex: 1 },
  shippingTitle: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 },
  shippingSub: { fontSize: 12, color: "#666" },
  shippingPrice: { fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 },

  // Coupon
  couponRow: { display: "flex", gap: 8 },
  applyCouponBtn: { padding: "11px 16px", background: "#ff3c00", border: "none", color: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" },
  couponApplied: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#34d399" },
  removeCoupon: { background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  couponMsg: { fontSize: 12, marginTop: 6, fontWeight: 500 },

  // Confirmation
  confirmSection: { background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 },
  confirmRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  confirmLabel: { fontSize: 12, color: "#666", fontWeight: 600 },
  confirmVal: { fontSize: 13, color: "#ddd", fontWeight: 500, textAlign: "right" },
  confirmItems: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  confirmItem: { display: "flex", alignItems: "center", gap: 10, background: "#1a1a1a", borderRadius: 10, padding: "10px 12px", border: "1px solid #222" },
  confirmThumb: { width: 40, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  confirmItemName: { flex: 1, fontSize: 13, color: "#ccc" },
  confirmItemPrice: { fontSize: 13, fontWeight: 700, color: "#fff" },

  // Buttons
  nextBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #ff3c00, #ff5722)", border: "none", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 16, transition: "opacity 0.2s" },
  buyBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #25D366, #22c55e)", border: "none", color: "#fff", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(37,211,102,0.25)" },
  errMsg: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, marginBottom: 12, marginTop: 8 },

  // Summary sidebar
  summaryCard: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px" },
  summaryTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 },
  summaryItems: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 },
  summaryItem: { display: "flex", alignItems: "center", gap: 10 },
  summaryThumb: { width: 40, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  summaryItemName: { fontSize: 12, color: "#ccc", fontWeight: 500, lineHeight: 1.3 },
  summaryItemQty: { fontSize: 11, color: "#555", marginTop: 2 },
  summaryItemPrice: { fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },
  summaryDivider: { height: 1, background: "#1e1e1e", margin: "12px 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#888", marginBottom: 6 },

  // Empty/success states
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "60vh", padding: "40px 24px" },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#666", lineHeight: 1.6, maxWidth: 400 },
  mainBtn: { background: "linear-gradient(135deg, #ff3c00, #ff5722)", color: "#fff", padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" },
  outlineBtn: { background: "transparent", color: "#888", border: "1px solid #333", padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-block" },
  successIcon: { width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.15)", border: "2px solid #34d399", color: "#34d399", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successCard: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "20px 24px", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 },
  successRow: { display: "flex", justifyContent: "space-between", gap: 8 },
  successLabel: { fontSize: 12, color: "#666", fontWeight: 600 },
  successVal: { fontSize: 13, color: "#bbb" },
};

export default Checkout;
