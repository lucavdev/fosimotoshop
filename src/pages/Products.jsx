import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["todos", "cascos", "escapes", "indumentaria", "botas", "protecciones", "accesorios", "Repuestos"];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const activeCategory = searchParams.get("category") || "todos";

  const setActiveCategory = (cat) => {
    if (cat === "todos") setSearchParams({});
    else setSearchParams({ category: cat });
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== "todos") params.category = activeCategory;
    if (searchDebounced) params.search = searchDebounced;
    getProducts(params).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, [activeCategory, searchDebounced]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Todos los productos</h1>
      <input type="text" placeholder="🔍 Buscar producto..." value={search}
        onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
      <div style={styles.filterBar}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ ...styles.filterBtn, ...(activeCategory === cat ? styles.filterBtnActive : {}) }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: "#666" }}>Cargando productos...</p>
      ) : (
        <>
          <p style={styles.count}>{products.length} producto{products.length !== 1 ? "s" : ""}</p>
          {products.length === 0
            ? <p style={{ color: "#666" }}>No se encontraron productos.</p>
            : <div style={styles.grid}>{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          }
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px 24px" },
  title: { fontSize: 24, marginBottom: 16 },
  searchInput: { width: "100%", maxWidth: 400, padding: "10px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "white", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  filterBtn: { padding: "6px 14px", borderRadius: 20, border: "1px solid #444", background: "transparent", color: "#aaa", cursor: "pointer", fontSize: 13 },
  filterBtnActive: { background: "#ff3c00", border: "1px solid #ff3c00", color: "#fff" },
  count: { fontSize: 12, color: "#666", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 20 },
};

export default Products;