import { useState, useEffect } from "react";
import { getMyOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const statusColors = {
  pendiente: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  confirmado: { bg: "rgba(52,211,153,0.12)", color: "#34d399", border: "rgba(52,211,153,0.3)" },
  enviado: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  entregado: { bg: "rgba(74,222,128,0.12)", color: "#4ade80", border: "rgba(74,222,128,0.3)" },
  cancelado: { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.3)" },
};

const UserOrders = () => {
  const { isLogged, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLogged) { navigate("/login"); return; }
    if (isLogged) {
      getMyOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isLogged, authLoading]);

  if (authLoading || loading) return (
    <div style={styles.page}>
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Mis Órdenes</h1>
        <span style={styles.count}>{orders.length} orden{orders.length !== 1 ? "es" : ""}</span>
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#fff" }}>No tenés órdenes aún</h3>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Explorá nuestro catálogo y encontrá lo que necesitás.</p>
          <button onClick={() => navigate("/products")} style={styles.shopBtn}>🛍️ Ver productos</button>
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => {
            const sc = statusColors[order.status] || { bg: "#1a1a1a", color: "#aaa", border: "#333" };
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} style={styles.orderCard}>
                {/* Summary row */}
                <div style={styles.orderSummary} onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div style={styles.orderLeft}>
                    <span style={styles.orderId}>Orden #{order.id}</span>
                    <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color, borderColor: sc.border }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.orderCenter}>
                    <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                    <span style={styles.orderItemsCount}>{order.items?.length} producto{order.items?.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={styles.orderRight}>
                    <span style={styles.orderTotal}>${order.total.toLocaleString()}</span>
                    <span style={{ color: "#555", fontSize: 16, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={styles.orderDetail} className="fade-in">
                    {/* Items */}
                    <div style={styles.detailSection}>
                      <div style={styles.detailSectionTitle}>Productos</div>
                      <div style={styles.itemGrid}>
                        {order.items?.map((item) => (
                          <div key={item.id} style={styles.orderItem}>
                            <img
                              src={item.product?.image || `https://picsum.photos/seed/${item.productId}/80/80`}
                              alt={item.product?.name}
                              style={styles.itemImg}
                              onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.productId}/80/80`; }}
                            />
                            <div style={styles.itemInfo}>
                              <span style={styles.itemName}>{item.product?.name || `Producto #${item.productId}`}</span>
                              <div style={styles.itemMeta}>
                                <span>Cant: <strong>{item.qty}</strong></span>
                                {item.size && <span>Talle: <strong>{item.size}</strong></span>}
                                {item.color && <span>Color: <strong>{item.color}</strong></span>}
                              </div>
                              <span style={styles.itemPrice}>${(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment summary */}
                    <div style={styles.infoGrid}>
                      <div style={styles.infoCard}>
                        <div style={styles.infoCardTitle}>🚚 Envío</div>
                        <div style={styles.infoRow}>
                          <span style={styles.infoKey}>Tipo</span>
                          <span style={styles.infoVal}>{order.shippingType === "correo" ? "📬 Correo Argentino" : "🏪 Retiro en sucursal"}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div style={styles.infoRow}><span style={styles.infoKey}>Costo envío</span><span style={styles.infoVal}>${order.shippingCost?.toLocaleString()}</span></div>
                        )}
                        {order.province && <div style={styles.infoRow}><span style={styles.infoKey}>Provincia</span><span style={styles.infoVal}>{order.province}</span></div>}
                        {order.city && <div style={styles.infoRow}><span style={styles.infoKey}>Ciudad</span><span style={styles.infoVal}>{order.city}</span></div>}
                        {order.address && <div style={styles.infoRow}><span style={styles.infoKey}>Domicilio</span><span style={styles.infoVal}>{order.address}</span></div>}
                        {order.postalCode && <div style={styles.infoRow}><span style={styles.infoKey}>Cód. Postal</span><span style={styles.infoVal}>{order.postalCode}</span></div>}
                      </div>
                      <div style={styles.infoCard}>
                        <div style={styles.infoCardTitle}>Resumen</div>
                        {order.couponCode && (
                          <div style={styles.infoRow}>
                            <span style={styles.infoKey}>Cupón</span>
                            <span style={{ ...styles.infoVal, color: "#34d399" }}>{order.couponCode} (−${order.couponDiscount?.toLocaleString()})</span>
                          </div>
                        )}
                        <div style={{ ...styles.infoRow, borderTop: "1px solid #1e1e1e", marginTop: 8, paddingTop: 8 }}>
                          <span style={{ ...styles.infoKey, color: "#fff", fontWeight: 700 }}>Total pagado</span>
                          <span style={{ ...styles.infoVal, color: "#fff", fontSize: 18, fontWeight: 800 }}>${order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: "clamp(16px, 3vw, 40px)", maxWidth: 900, margin: "0 auto", minHeight: "80vh" },
  loadingWrap: { display: "flex", justifyContent: "center", alignItems: "center", height: 400 },
  spinner: { width: 48, height: 48, borderRadius: "50%", border: "3px solid #2a2a2a", borderTopColor: "#ff3c00", animation: "spin 0.8s linear infinite" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  title: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "#fff" },
  count: { fontSize: 13, color: "#555", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "4px 12px", borderRadius: 20 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" },
  shopBtn: { background: "linear-gradient(135deg, #ff3c00, #ff5722)", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  orderList: { display: "flex", flexDirection: "column", gap: 12 },
  orderCard: { background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" },
  orderSummary: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer", flexWrap: "wrap", gap: 12 },
  orderLeft: { display: "flex", alignItems: "center", gap: 12 },
  orderId: { fontSize: 14, fontWeight: 700, color: "#fff" },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid" },
  orderCenter: { display: "flex", flexDirection: "column", gap: 2, flex: 1, padding: "0 16px" },
  orderDate: { fontSize: 13, color: "#888" },
  orderItemsCount: { fontSize: 11, color: "#555" },
  orderRight: { display: "flex", alignItems: "center", gap: 12 },
  orderTotal: { fontSize: 18, fontWeight: 800, color: "#fff" },

  orderDetail: { padding: "0 20px 20px", borderTop: "1px solid #1e1e1e" },
  detailSection: { marginTop: 16, marginBottom: 16 },
  detailSectionTitle: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 },
  itemGrid: { display: "flex", flexDirection: "column", gap: 8 },
  orderItem: { display: "flex", gap: 14, background: "#1a1a1a", borderRadius: 10, padding: "12px 14px", border: "1px solid #222" },
  itemImg: { width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  itemInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  itemName: { fontSize: 14, fontWeight: 600, color: "#ddd" },
  itemMeta: { display: "flex", gap: 12, flexWrap: "wrap" },
  itemMetaSpan: { fontSize: 12, color: "#666" },
  itemPrice: { fontSize: 14, fontWeight: 700, color: "#fff" },

  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  infoCard: { background: "#1a1a1a", border: "1px solid #222", borderRadius: 10, padding: "14px 16px" },
  infoCardTitle: { fontSize: 12, color: "#666", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  infoKey: { fontSize: 12, color: "#555", flexShrink: 0 },
  infoVal: { fontSize: 13, color: "#ccc", fontWeight: 600, textAlign: "right" },

  itemMetas: { fontSize: 12, color: "#666" },
};

export default UserOrders;
