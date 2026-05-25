import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, getAllOrders, updateOrder, getCoupons, createCoupon, deleteCoupon, toggleCoupon } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["cascos", "escapes", "indumentaria", "botas", "protecciones", "accesorios", "Repuestos"];
const STATUSES = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];
const EMPTY_PRODUCT = { name: "", price: "", category: "cascos", stock: "10", image: "", images: "", description: "", brand: "", sizes: "", colors: "", discount: "" };
const EMPTY_COUPON = { code: "", discount: "", type: "percentage", minAmount: "", maxUses: "", expiresAt: "" };

const statusColors = {
  pendiente: { bg: "#2a1f00", color: "#f59e0b" },
  confirmado: { bg: "#002a0f", color: "#34d399" },
  enviado: { bg: "#001d3a", color: "#60a5fa" },
  entregado: { bg: "#001a00", color: "#4ade80" },
  cancelado: { bg: "#2a0000", color: "#f87171" },
};

const AdminPanel = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);
  const [editing, setEditing] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [msg, setMsg] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !isAdmin) navigate("/"); }, [loading, isAdmin]);
  useEffect(() => {
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
    if (tab === "coupons") loadCoupons();
  }, [tab]);

  const loadProducts = async () => { setFetching(true); try { setProducts(await getProducts()); } catch (e) { setMsg({ type: "error", text: e.message }); } finally { setFetching(false); } };
  const loadOrders = async () => { setFetching(true); try { setOrders(await getAllOrders()); } catch (e) { setMsg({ type: "error", text: e.message }); } finally { setFetching(false); } };
  const loadCoupons = async () => { setFetching(true); try { setCoupons(await getCoupons()); } catch (e) { setMsg({ type: "error", text: e.message }); } finally { setFetching(false); } };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        discount: form.discount ? Number(form.discount) : null,
        images: form.images ? form.images.split("\n").map(s => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(",").map(s => s.trim()).filter(Boolean) : [],
        brand: form.brand || null,
      };
      if (editing) { await updateProduct(editing, data); setMsg({ type: "ok", text: "Producto actualizado ✅" }); setEditing(null); }
      else { await createProduct(data); setMsg({ type: "ok", text: "Producto creado ✅" }); }
      setForm(EMPTY_PRODUCT);
      loadProducts();
    } catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, price: String(p.price), category: p.category, stock: String(p.stock),
      image: p.image, images: (p.images || []).join("\n"), description: p.description || "",
      brand: p.brand || "", sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "),
      discount: p.discount ? String(p.discount) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => { if (!window.confirm("¿Desactivar este producto?")) return; try { await deleteProduct(id); setMsg({ type: "ok", text: "Producto desactivado ✅" }); loadProducts(); } catch (err) { setMsg({ type: "error", text: err.message }); } };
  const handleStatus = async (id, status) => { try { await updateOrder(id, { status }); loadOrders(); } catch (err) { setMsg({ type: "error", text: err.message }); } };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        ...couponForm,
        discount: Number(couponForm.discount),
        minAmount: couponForm.minAmount ? Number(couponForm.minAmount) : undefined,
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : undefined,
        expiresAt: couponForm.expiresAt || undefined,
      });
      setMsg({ type: "ok", text: "Cupón creado ✅" });
      setCouponForm(EMPTY_COUPON);
      loadCoupons();
    } catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });
  const cf = (field) => ({ value: couponForm[field], onChange: (e) => setCouponForm({ ...couponForm, [field]: e.target.value }) });

  if (loading) return <div style={{ padding: 40, color: "#aaa" }}>Cargando...</div>;

  const TABS = [
    { id: "products", label: "🏷️ Productos" },
    { id: "orders", label: "📦 Órdenes" },
    { id: "coupons", label: "🎟 Cupones" },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.title}>⚙️ Panel de Administración</h1>

      <div style={s.tabs}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{ ...s.alert, ...(msg.type === "ok" ? s.alertOk : s.alertErr) }}>
          {msg.text} <button onClick={() => setMsg(null)} style={s.closeAlert}>✕</button>
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === "products" && (
        <>
          <div style={s.formCard}>
            <h3 style={s.formTitle}>{editing ? "✏️ Editar" : "➕ Nuevo"} producto</h3>
            <form onSubmit={handleProductSubmit} style={s.formGrid}>
              <div style={s.fg}><label style={s.label}>Nombre *</label><input style={s.input} {...f("name")} required /></div>
              <div style={s.fg}><label style={s.label}>Precio *</label><input style={s.input} type="number" {...f("price")} required /></div>
              <div style={s.fg}><label style={s.label}>Categoría *</label>
                <select style={s.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.fg}><label style={s.label}>Stock</label><input style={s.input} type="number" {...f("stock")} /></div>
              <div style={s.fg}><label style={s.label}>Marca</label><input style={s.input} {...f("brand")} placeholder="Fox, Thor, etc." /></div>
              <div style={s.fg}><label style={s.label}>Descuento (%)</label><input style={s.input} type="number" min="0" max="99" {...f("discount")} placeholder="0" /></div>
              <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>URL imagen principal</label><input style={s.input} {...f("image")} placeholder="https://..." /></div>
              <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>URLs imágenes adicionales (una por línea)</label><textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} {...f("images")} placeholder="https://imagen2.jpg&#10;https://imagen3.jpg" /></div>
              <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>Talles (separados por coma)</label><input style={s.input} {...f("sizes")} placeholder="S, M, L, XL o 39, 40, 41" /></div>
              <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>Colores (separados por coma)</label><input style={s.input} {...f("colors")} placeholder="Rojo, Negro, Azul" /></div>
              <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>Descripción</label><textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} {...f("description")} /></div>
              <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
                <button type="submit" style={s.btnP}>{editing ? "Guardar cambios" : "Crear producto"}</button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_PRODUCT); }} style={s.btnS}>Cancelar</button>}
              </div>
            </form>
          </div>

          {fetching ? <p style={{ color: "#aaa" }}>Cargando...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>{["ID", "Nombre", "Cat.", "Precio", "Desc.", "Marca", "Stock", "Acciones"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={s.tr}>
                      <td style={s.td}>{p.id}</td>
                      <td style={s.td}><strong>{p.name}</strong></td>
                      <td style={s.td}><span style={{ ...s.badge, background: "#1a1a1a", color: "#ff8060" }}>{p.category}</span></td>
                      <td style={s.td}>${p.price.toLocaleString()}</td>
                      <td style={s.td}>{p.discount ? <span style={{ color: "#f59e0b" }}>{p.discount}%</span> : <span style={{ color: "#444" }}>—</span>}</td>
                      <td style={s.td}>{p.brand || <span style={{ color: "#444" }}>—</span>}</td>
                      <td style={s.td}>{p.stock}</td>
                      <td style={s.td}>
                        <button onClick={() => handleEdit(p)} style={s.btnEdit}>Editar</button>
                        <button onClick={() => handleDelete(p.id)} style={s.btnDel}>Desact.</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === "orders" && (fetching ? <p style={{ color: "#aaa" }}>Cargando...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} style={s.orderCard}>
              {/* Order header */}
              <div style={s.orderHeader} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                <div style={s.orderMeta}>
                  <span style={s.orderId}>#{o.id}</span>
                  <div>
                    <div style={s.orderClient}>{o.user?.name}</div>
                    <div style={s.orderEmail}>{o.user?.email}</div>
                  </div>
                  <span style={{ ...s.badge, ...statusColors[o.status] }}>{o.status}</span>
                </div>
                <div style={s.orderRight}>
                  <span style={s.orderTotal}>${o.total.toLocaleString()}</span>
                  <span style={s.orderDate}>{new Date(o.createdAt).toLocaleDateString("es-AR")}</span>
                  <span style={{ color: "#555", fontSize: 18 }}>{expandedOrder === o.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedOrder === o.id && (
                <div style={s.orderDetails} className="fade-in">
                  {/* Products */}
                  <div style={s.detailSection}>
                    <div style={s.detailTitle}>🛍 Productos</div>
                    <table style={{ ...s.table, fontSize: 12 }}>
                      <thead><tr>{["Producto", "Cant.", "Talle", "Color", "Precio unit.", "Subtotal"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {o.items?.map((item) => (
                          <tr key={item.id} style={s.tr}>
                            <td style={s.td}>{item.product?.name || `Producto #${item.productId}`}</td>
                            <td style={s.td}>{item.qty}</td>
                            <td style={s.td}>{item.size || "—"}</td>
                            <td style={s.td}>{item.color || "—"}</td>
                            <td style={s.td}>${item.price?.toLocaleString()}</td>
                            <td style={s.td}>${(item.price * item.qty).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Shipping */}
                  <div style={s.detailSection}>
                    <div style={s.detailTitle}>🚚 Envío</div>
                    <div style={s.detailGrid}>
                      <div style={s.detailItem}><span style={s.detailKey}>Tipo</span><span style={s.detailVal}>{o.shippingType === "correo" ? "📬 Correo" : "🏪 Retiro en sucursal"}</span></div>
                      <div style={s.detailItem}><span style={s.detailKey}>Costo envío</span><span style={s.detailVal}>{o.shippingCost === 0 ? "Gratis" : `$${o.shippingCost?.toLocaleString()}`}</span></div>
                      {o.province && <div style={s.detailItem}><span style={s.detailKey}>Provincia</span><span style={s.detailVal}>{o.province}</span></div>}
                      {o.city && <div style={s.detailItem}><span style={s.detailKey}>Ciudad</span><span style={s.detailVal}>{o.city}</span></div>}
                      {o.address && <div style={s.detailItem}><span style={s.detailKey}>Domicilio</span><span style={s.detailVal}>{o.address}</span></div>}
                      {o.postalCode && <div style={s.detailItem}><span style={s.detailKey}>Cód. Postal</span><span style={s.detailVal}>{o.postalCode}</span></div>}
                      {o.couponCode && <div style={s.detailItem}><span style={s.detailKey}>Cupón</span><span style={{ ...s.detailVal, color: "#34d399" }}>{o.couponCode} (−${o.couponDiscount?.toLocaleString()})</span></div>}
                    </div>
                  </div>

                  {/* Status change */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12 }}>
                    <span style={s.detailKey}>Cambiar estado:</span>
                    <select style={s.selectSmall} value={o.status} onChange={(e) => handleStatus(o.id, e.target.value)}>
                      {STATUSES.map((st) => <option key={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p style={{ color: "#666", textAlign: "center", padding: "40px 0" }}>No hay órdenes aún.</p>}
        </div>
      ))}

      {/* ── COUPONS TAB ── */}
      {tab === "coupons" && (
        <>
          <div style={s.formCard}>
            <h3 style={s.formTitle}>🎟 Crear cupón de descuento</h3>
            <form onSubmit={handleCouponSubmit} style={s.formGrid}>
              <div style={s.fg}><label style={s.label}>Código *</label><input style={s.input} {...cf("code")} required placeholder="VERANO25" onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} /></div>
              <div style={s.fg}><label style={s.label}>Tipo</label>
                <select style={s.input} value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
              <div style={s.fg}><label style={s.label}>Descuento * {couponForm.type === "percentage" ? "(%)" : "($)"}</label><input style={s.input} type="number" min="1" {...cf("discount")} required /></div>
              <div style={s.fg}><label style={s.label}>Monto mínimo ($)</label><input style={s.input} type="number" {...cf("minAmount")} placeholder="Sin mínimo" /></div>
              <div style={s.fg}><label style={s.label}>Límite de usos</label><input style={s.input} type="number" {...cf("maxUses")} placeholder="Sin límite" /></div>
              <div style={s.fg}><label style={s.label}>Expira el</label><input style={s.input} type="datetime-local" {...cf("expiresAt")} /></div>
              <div style={{ gridColumn: "1/-1" }}>
                <button type="submit" style={s.btnP}>Crear cupón</button>
              </div>
            </form>
          </div>

          {fetching ? <p style={{ color: "#aaa" }}>Cargando...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>{["Código", "Tipo", "Descuento", "Mín.$", "Usos", "Expira", "Estado", ""].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: 700, fontFamily: "monospace", color: "#ff8060" }}>{c.code}</td>
                      <td style={s.td}>{c.type === "percentage" ? "%" : "$"}</td>
                      <td style={s.td}>{c.type === "percentage" ? `${c.discount}%` : `$${c.discount.toLocaleString()}`}</td>
                      <td style={s.td}>{c.minAmount ? `$${c.minAmount.toLocaleString()}` : "—"}</td>
                      <td style={s.td}>{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                      <td style={s.td}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("es-AR") : "—"}</td>
                      <td style={s.td}><span style={{ ...s.badge, ...(c.active ? { background: "#002a0f", color: "#34d399" } : { background: "#2a0000", color: "#f87171" }) }}>{c.active ? "Activo" : "Inactivo"}</span></td>
                      <td style={s.td}>
                        <button onClick={() => toggleCoupon(c.id, !c.active).then(loadCoupons)} style={c.active ? s.btnDel : s.btnEdit}>{c.active ? "Desact." : "Activar"}</button>
                        <button onClick={() => { if (window.confirm("¿Eliminar cupón?")) deleteCoupon(c.id).then(loadCoupons); }} style={s.btnDel}>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {coupons.length === 0 && <p style={{ color: "#666", textAlign: "center", padding: "30px 0" }}>No hay cupones creados.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const s = {
  page: { padding: "clamp(16px, 3vw, 32px)", maxWidth: 1200, margin: "0 auto" },
  title: { fontSize: "clamp(18px, 3vw, 24px)", marginBottom: 24, fontWeight: 800 },
  tabs: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  tab: { padding: "9px 20px", background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", cursor: "pointer", fontSize: 14, fontFamily: "inherit", transition: "all 0.2s" },
  tabActive: { background: "#ff3c00", border: "1px solid #ff3c00", color: "white" },
  alert: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 },
  alertOk: { background: "#002a0f", border: "1px solid #34d399", color: "#34d399" },
  alertErr: { background: "#2a0000", border: "1px solid #f87171", color: "#f87171" },
  closeAlert: { background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 },
  formCard: { background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 24px", marginBottom: 28 },
  formTitle: { marginBottom: 16, fontSize: 15, fontWeight: 700 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fg: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#666", fontWeight: 600 },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#1a1a1a", color: "white", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" },
  btnP: { padding: "10px 22px", background: "#ff3c00", border: "none", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" },
  btnS: { padding: "10px 22px", background: "transparent", border: "1px solid #444", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #1e1e1e", color: "#666", fontWeight: 700, whiteSpace: "nowrap", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  tr: { borderBottom: "1px solid #141414", transition: "background 0.15s" },
  td: { padding: "11px 12px", color: "#ccc", verticalAlign: "middle" },
  btnEdit: { padding: "4px 10px", background: "#1d3a5f", border: "none", color: "#60a5fa", borderRadius: 5, cursor: "pointer", fontSize: 12, marginRight: 6, fontFamily: "inherit" },
  btnDel: { padding: "4px 10px", background: "#3a1d1d", border: "none", color: "#f87171", borderRadius: 5, cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  badge: { padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block" },
  selectSmall: { padding: "6px 10px", background: "#1a1a1a", border: "1px solid #333", color: "white", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none" },
  // Orders
  orderCard: { background: "#141414", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" },
  orderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", transition: "background 0.15s" },
  orderMeta: { display: "flex", alignItems: "center", gap: 14 },
  orderId: { fontSize: 12, color: "#555", fontWeight: 700, minWidth: 30 },
  orderClient: { fontSize: 14, fontWeight: 600, color: "#ddd" },
  orderEmail: { fontSize: 11, color: "#555" },
  orderRight: { display: "flex", alignItems: "center", gap: 16 },
  orderTotal: { fontSize: 16, fontWeight: 800, color: "#fff" },
  orderDate: { fontSize: 12, color: "#555" },
  orderDetails: { padding: "0 18px 18px", borderTop: "1px solid #1e1e1e" },
  detailSection: { marginTop: 16, marginBottom: 16 },
  detailTitle: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 10 },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 },
  detailItem: { background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" },
  detailKey: { display: "block", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  detailVal: { fontSize: 13, color: "#ddd", fontWeight: 600 },
};

export default AdminPanel;
