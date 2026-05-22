
import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, getAllOrders, updateOrder } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["cascos", "escapes", "indumentaria", "botas", "protecciones", "accesorios", "Repuestos"];
const STATUSES = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];
const EMPTY = { name: "", price: "", category: "cascos", stock: "10", image: "", description: "" };

const AdminPanel = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !isAdmin) navigate("/"); }, [loading, isAdmin]);
  useEffect(() => { if (tab === "products") loadProducts(); if (tab === "orders") loadOrders(); }, [tab]);

  const loadProducts = async () => { setFetching(true); try { setProducts(await getProducts()); } catch (e) { setMsg({ type: "error", text: e.message }); } finally { setFetching(false); } };
  const loadOrders = async () => { setFetching(true); try { setOrders(await getAllOrders()); } catch (e) { setMsg({ type: "error", text: e.message }); } finally { setFetching(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) { await updateProduct(editing, data); setMsg({ type: "ok", text: "Producto actualizado ✅" }); setEditing(null); }
      else { await createProduct(data); setMsg({ type: "ok", text: "Producto creado ✅" }); }
      setForm(EMPTY);
      loadProducts();
    } catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  const handleEdit = (p) => { setEditing(p.id); setForm({ name: p.name, price: String(p.price), category: p.category, stock: String(p.stock), image: p.image, description: p.description || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (id) => { if (!window.confirm("¿Desactivar este producto?")) return; try { await deleteProduct(id); setMsg({ type: "ok", text: "Producto desactivado ✅" }); loadProducts(); } catch (err) { setMsg({ type: "error", text: err.message }); } };
  const handleStatus = async (id, status) => { try { await updateOrder(id, { status }); setMsg({ type: "ok", text: "Estado actualizado ✅" }); loadOrders(); } catch (err) { setMsg({ type: "error", text: err.message }); } };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });
  const statusColor = (s) => ({ pendiente: { background: "#2a1f00", color: "#f59e0b" }, confirmado: { background: "#002a0f", color: "#34d399" }, enviado: { background: "#001d3a", color: "#60a5fa" }, entregado: { background: "#001a00", color: "#4ade80" }, cancelado: { background: "#2a0000", color: "#f87171" } }[s] || {});

  if (loading) return <div style={{ padding: 40, color: "#aaa" }}>Cargando...</div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>⚙️ Panel de Administración</h1>
      <div style={s.tabs}>
        {["products", "orders"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t === "products" ? "🏷️ Productos" : "📦 Órdenes"}
          </button>
        ))}
      </div>
      {msg && (
        <div style={{ ...s.alert, ...(msg.type === "ok" ? s.alertOk : s.alertErr) }}>
          {msg.text} <button onClick={() => setMsg(null)} style={s.closeAlert}>✕</button>
        </div>
      )}

      {tab === "products" && <>
        <div style={s.formCard}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>{editing ? "✏️ Editar" : "➕ Nuevo"} producto</h3>
          <form onSubmit={handleSubmit} style={s.formGrid}>
            <div style={s.fg}><label style={s.label}>Nombre *</label><input style={s.input} {...f("name")} required /></div>
            <div style={s.fg}><label style={s.label}>Precio *</label><input style={s.input} type="number" {...f("price")} required /></div>
            <div style={s.fg}><label style={s.label}>Categoría *</label>
              <select style={s.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.fg}><label style={s.label}>Stock</label><input style={s.input} type="number" {...f("stock")} /></div>
            <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>URL imagen</label><input style={s.input} {...f("image")} placeholder="https://..." /></div>
            <div style={{ ...s.fg, gridColumn: "1/-1" }}><label style={s.label}>Descripción</label><textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} {...f("description")} /></div>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
              <button type="submit" style={s.btnP}>{editing ? "Guardar cambios" : "Crear producto"}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }} style={s.btnS}>Cancelar</button>}
            </div>
          </form>
        </div>
        {fetching ? <p style={{ color: "#aaa" }}>Cargando...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead><tr>{["ID", "Nombre", "Categoría", "Precio", "Stock", "Acciones"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={s.tr}>
                    <td style={s.td}>{p.id}</td>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}>{p.category}</td>
                    <td style={s.td}>${p.price}</td>
                    <td style={s.td}>{p.stock}</td>
                    <td style={s.td}>
                      <button onClick={() => handleEdit(p)} style={s.btnEdit}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={s.btnDel}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>}

      {tab === "orders" && (fetching ? <p style={{ color: "#aaa" }}>Cargando...</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead><tr>{["ID", "Cliente", "Email", "Total", "Estado", "Fecha", "Cambiar estado"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={s.tr}>
                  <td style={s.td}>#{o.id}</td>
                  <td style={s.td}>{o.user?.name}</td>
                  <td style={s.td}>{o.user?.email}</td>
                  <td style={s.td}>${o.total.toLocaleString()}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...statusColor(o.status) }}>{o.status}</span></td>
                  <td style={s.td}>{new Date(o.createdAt).toLocaleDateString("es-AR")}</td>
                  <td style={s.td}>
                    <select style={s.selectSmall} value={o.status} onChange={(e) => handleStatus(o.id, e.target.value)}>
                      {STATUSES.map((st) => <option key={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

const s = {
  page: { padding: "24px", maxWidth: "1100px", margin: "0 auto" }, title: { fontSize: 22, marginBottom: 20 },
  tabs: { display: "flex", gap: 8, marginBottom: 24 }, tab: { padding: "8px 20px", background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", cursor: "pointer", fontSize: 14 },
  tabActive: { background: "#ff3c00", border: "1px solid #ff3c00", color: "white" },
  alert: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 },
  alertOk: { background: "#002a0f", border: "1px solid #34d399", color: "#34d399" }, alertErr: { background: "#2a0000", border: "1px solid #f87171", color: "#f87171" },
  closeAlert: { background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 },
  formCard: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20, marginBottom: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, fg: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, color: "#888" }, input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#111", color: "white", fontSize: 13 },
  btnP: { padding: "9px 20px", background: "#ff3c00", border: "none", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold" },
  btnS: { padding: "9px 20px", background: "transparent", border: "1px solid #444", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 }, th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #2a2a2a", color: "#888", fontWeight: 600, whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #1a1a1a" }, td: { padding: "10px 12px", color: "#ccc", verticalAlign: "middle" },
  btnEdit: { padding: "4px 10px", background: "#1d3a5f", border: "none", color: "#60a5fa", borderRadius: 5, cursor: "pointer", fontSize: 12, marginRight: 6 },
  btnDel: { padding: "4px 10px", background: "#3a1d1d", border: "none", color: "#f87171", borderRadius: 5, cursor: "pointer", fontSize: 12 },
  badge: { padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  selectSmall: { padding: "4px 6px", background: "#111", border: "1px solid #333", color: "white", borderRadius: 5, fontSize: 12 },
};

export default AdminPanel;

