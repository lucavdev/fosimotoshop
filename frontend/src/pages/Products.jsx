import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getBrands } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["todos", "cascos", "escapes", "indumentaria", "botas", "protecciones", "accesorios", "Repuestos"];
const SIZES_COMMON = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "39", "40", "41", "42", "43", "44", "45"];
const SORT_OPTIONS = [
  { value: "newest", label: "Más nuevos" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [maxPriceInput, setMaxPriceInput] = useState(500000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort] = useState("newest");

  const activeCategory = searchParams.get("category") || "todos";
  const setActiveCategory = (cat) => {
    if (cat === "todos") setSearchParams({});
    else setSearchParams({ category: cat });
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Debounce price
  useEffect(() => {
    const t = setTimeout(() => setMaxPrice(maxPriceInput), 400);
    return () => clearTimeout(t);
  }, [maxPriceInput]);

  // Load brands
  useEffect(() => {
    getBrands().then(setBrands).catch(() => {});
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== "todos") params.category = activeCategory;
    if (searchDebounced) params.search = searchDebounced;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice < 500000) params.maxPrice = maxPrice;
    if (selectedSizes.length === 1) params.size = selectedSizes[0];
    if (selectedBrands.length === 1) params.brand = selectedBrands[0];
    params.sort = sort;

    getProducts(params)
      .then((data) => {
        // Client-side multi-filter for sizes/brands arrays
        let filtered = data;
        if (selectedSizes.length > 1) {
          filtered = filtered.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
        }
        if (selectedBrands.length > 1) {
          filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
        }
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, searchDebounced, minPrice, maxPrice, selectedSizes, selectedBrands, sort]);

  const toggleSize = (s) => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleBrand = (b) => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const clearFilters = () => {
    setSearch(""); setMinPrice(""); setMaxPriceInput(500000); setSelectedSizes([]); setSelectedBrands([]); setSort("newest");
    setSearchParams({});
  };

  const hasFilters = search || minPrice || maxPrice < 500000 || selectedSizes.length || selectedBrands.length || sort !== "newest" || activeCategory !== "todos";

  const Sidebar = () => (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h3 style={styles.sidebarTitle}>🎚 Filtros</h3>
        {hasFilters && (
          <button onClick={clearFilters} style={styles.clearBtn}>Limpiar</button>
        )}
      </div>

      {/* Category */}
      <div style={styles.filterGroup}>
        <div style={styles.filterGroupTitle}>Categoría</div>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ ...styles.catFilterBtn, ...(activeCategory === cat ? styles.catFilterBtnActive : {}) }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
            {activeCategory === cat && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Price Range */}
      <div style={styles.filterGroup}>
        <div style={styles.filterGroupTitle}>Precio máximo</div>
        <div style={styles.priceDisplay}>${maxPriceInput.toLocaleString()}</div>
        <input type="range" min={0} max={500000} step={5000}
          value={maxPriceInput} onChange={(e) => setMaxPriceInput(Number(e.target.value))}
        />
        <div style={styles.priceRow}>
          <input type="number" placeholder="Mín" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={styles.priceInput} />
          <span style={{ color: "#555" }}>–</span>
          <input type="number" placeholder="Máx" value={maxPriceInput === 500000 ? "" : maxPriceInput}
            onChange={(e) => setMaxPriceInput(Number(e.target.value) || 500000)}
            style={styles.priceInput} />
        </div>
      </div>

      {/* Sizes */}
      <div style={styles.filterGroup}>
        <div style={styles.filterGroupTitle}>Talle</div>
        <div style={styles.tagsGrid}>
          {SIZES_COMMON.map((s) => (
            <button key={s} onClick={() => toggleSize(s)}
              style={{ ...styles.tagBtn, ...(selectedSizes.includes(s) ? styles.tagBtnActive : {}) }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div style={styles.filterGroup}>
          <div style={styles.filterGroupTitle}>Marca</div>
          {brands.map((b) => (
            <label key={b} style={styles.checkLabel}>
              <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} style={styles.checkbox} />
              <span style={styles.checkText}>{b}</span>
            </label>
          ))}
        </div>
      )}
    </aside>
  );

  return (
    <div style={styles.page}>
      {/* Mobile filter toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.mobileFilterBtn} className="hide-desktop">
        🎚 Filtros {hasFilters && <span style={styles.filterDot} />}
      </button>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div style={styles.mobileSidebarDrawer} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>Filtros</h3>
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#aaa", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <Sidebar />
          </div>
          <div style={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
        </>
      )}

      <div style={styles.layout}>
        {/* Desktop Sidebar */}
        <div className="hide-mobile">
          <Sidebar />
        </div>

        {/* Main */}
        <main style={styles.main}>
          {/* Top bar */}
          <div style={styles.topBar}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Buscar producto..." value={search}
                onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
              {search && <button onClick={() => setSearch("")} style={styles.clearSearch}>✕</button>}
            </div>
            <div style={styles.sortWrap}>
              <span style={styles.sortLabel}>Ordenar:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.sortSelect}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filters chips */}
          {hasFilters && (
            <div style={styles.chipsRow}>
              {activeCategory !== "todos" && <Chip label={`Categoría: ${activeCategory}`} onRemove={() => setActiveCategory("todos")} />}
              {selectedSizes.map((s) => <Chip key={s} label={`Talle: ${s}`} onRemove={() => toggleSize(s)} />)}
              {selectedBrands.map((b) => <Chip key={b} label={`Marca: ${b}`} onRemove={() => toggleBrand(b)} />)}
              {(minPrice || maxPrice < 500000) && <Chip label={`Precio: $${minPrice || 0} – $${maxPrice.toLocaleString()}`} onRemove={() => { setMinPrice(""); setMaxPriceInput(500000); }} />}
            </div>
          )}

          {/* Results */}
          <div style={styles.resultsInfo}>
            {!loading && <span style={styles.count}>{products.length} producto{products.length !== 1 ? "s" : ""}</span>}
          </div>

          {loading ? (
            <div style={styles.grid}>
              {[...Array(8)].map((_, i) => <div key={i} style={{ height: 280, borderRadius: 12 }} className="skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ color: "#666", fontSize: 15 }}>No se encontraron productos con esos filtros.</p>
              <button onClick={clearFilters} style={styles.clearFiltersBtn}>Limpiar filtros</button>
            </div>
          ) : (
            <div style={styles.grid}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Chip = ({ label, onRemove }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,60,0,0.12)", border: "1px solid rgba(255,60,0,0.3)", color: "#ff8060", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
    {label}
    <button onClick={onRemove} style={{ background: "none", border: "none", color: "#ff8060", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
  </div>
);

const styles = {
  page: { padding: "0 clamp(16px, 3vw, 32px) 40px", maxWidth: 1400, margin: "0 auto" },
  mobileFilterBtn: { display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", border: "1px solid #333", color: "#ddd", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit", margin: "16px 0", width: "100%", justifyContent: "center", position: "relative" },
  filterDot: { width: 8, height: 8, background: "#ff3c00", borderRadius: "50%", display: "inline-block" },
  mobileSidebarDrawer: { position: "fixed", top: 0, left: 0, bottom: 0, width: 300, background: "#111", borderRight: "1px solid #222", zIndex: 2000, overflowY: "auto", padding: 20 },
  sidebarOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1999 },

  layout: { display: "grid", gridTemplateColumns: "var(--sidebar-width, 260px) 1fr", gap: 32, alignItems: "start", paddingTop: 24 },

  // Sidebar
  sidebar: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 16px", position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 0 },
  sidebarHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sidebarTitle: { fontSize: 15, fontWeight: 700, color: "#fff" },
  clearBtn: { background: "none", border: "1px solid #333", color: "#888", fontSize: 12, padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  filterGroup: { paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid #1e1e1e" },
  filterGroupTitle: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 },
  catFilterBtn: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 10px", background: "transparent", border: "none", color: "#888", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "inherit", borderRadius: 6, transition: "all 0.15s", marginBottom: 2 },
  catFilterBtnActive: { background: "rgba(255,60,0,0.12)", color: "#ff8060" },
  priceDisplay: { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 },
  priceRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 10 },
  priceInput: { flex: 1, padding: "6px 10px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" },
  tagsGrid: { display: "flex", flexWrap: "wrap", gap: 6 },
  tagBtn: { padding: "5px 10px", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" },
  tagBtnActive: { background: "rgba(255,60,0,0.15)", borderColor: "#ff3c00", color: "#ff3c00" },
  checkLabel: { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer" },
  checkbox: { accentColor: "#ff3c00", width: 15, height: 15, cursor: "pointer" },
  checkText: { fontSize: 13, color: "#aaa" },

  // Main
  main: { minWidth: 0 },
  topBar: { display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" },
  searchWrap: { flex: 1, position: "relative", minWidth: 200 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 },
  searchInput: { width: "100%", padding: "10px 36px 10px 36px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  clearSearch: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 },
  sortWrap: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  sortLabel: { fontSize: 13, color: "#666", whiteSpace: "nowrap" },
  sortSelect: { padding: "8px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#ddd", fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" },

  chipsRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  resultsInfo: { marginBottom: 16 },
  count: { fontSize: 13, color: "#555" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", color: "#aaa" },
  clearFiltersBtn: { marginTop: 16, background: "#ff3c00", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
};

// Responsive sidebar
const styleTag = document.createElement("style");
styleTag.textContent = `
  @media (max-width: 768px) {
    .products-layout { grid-template-columns: 1fr !important; }
  }
`;
if (!document.head.querySelector("[data-products-styles]")) {
  styleTag.setAttribute("data-products-styles", "1");
  document.head.appendChild(styleTag);
}

export default Products;