import { useState, useEffect } from "react";
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
  const [filterOpen, setFilterOpen] = useState(false);

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
    setFilterOpen(false);
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

  // Lock scroll when filter panel open on mobile
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const toggleSize = (s) => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleBrand = (b) => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const clearFilters = () => {
    setSearch(""); setMinPrice(""); setMaxPriceInput(500000); setSelectedSizes([]); setSelectedBrands([]); setSort("newest");
    setSearchParams({});
  };

  const hasFilters = search || minPrice || maxPrice < 500000 || selectedSizes.length || selectedBrands.length || sort !== "newest" || activeCategory !== "todos";
  const activeFilterCount = [
    activeCategory !== "todos",
    !!minPrice,
    maxPrice < 500000,
    selectedSizes.length > 0,
    selectedBrands.length > 0,
  ].filter(Boolean).length;

  // ── Filter panel content (shared between drawer and desktop sidebar)
  const FilterContent = () => (
    <div className="products-filter-content">
      <div className="products-filter-header">
        <span className="products-filter-title">Filtros</span>
        {hasFilters && (
          <button onClick={clearFilters} className="products-filter-clear">Limpiar</button>
        )}
      </div>

      {/* Category */}
      <div className="products-filter-group">
        <div className="products-filter-group-title">Categoría</div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`products-cat-btn ${activeCategory === cat ? "products-cat-btn--active" : ""}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
            {activeCategory === cat && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Price Range */}
      <div className="products-filter-group">
        <div className="products-filter-group-title">Precio máximo</div>
        <div className="products-price-display">${maxPriceInput.toLocaleString()}</div>
        <input
          type="range" min={0} max={500000} step={5000}
          value={maxPriceInput}
          onChange={(e) => setMaxPriceInput(Number(e.target.value))}
        />
        <div className="products-price-row">
          <input
            type="number" placeholder="Mín" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="products-price-input"
          />
          <span className="products-price-sep">–</span>
          <input
            type="number" placeholder="Máx"
            value={maxPriceInput === 500000 ? "" : maxPriceInput}
            onChange={(e) => setMaxPriceInput(Number(e.target.value) || 500000)}
            className="products-price-input"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="products-filter-group">
        <div className="products-filter-group-title">Talle</div>
        <div className="products-tags-grid">
          {SIZES_COMMON.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`products-tag-btn ${selectedSizes.includes(s) ? "products-tag-btn--active" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="products-filter-group">
          <div className="products-filter-group-title">Marca</div>
          {brands.map((b) => (
            <label key={b} className="products-check-label">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="products-checkbox"
              />
              <span className="products-check-text">{b}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="products-page">
      {/* ── Top bar: search + filter toggle + sort ── */}
      <div className="products-topbar">
        <div className="products-search-wrap">
          <span className="products-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="products-search-input"
          />
          {search && (
            <button onClick={() => setSearch("")} className="products-search-clear">✕</button>
          )}
        </div>

        {/* Filter toggle button (always visible) */}
        <button
          className={`products-filter-toggle ${activeFilterCount > 0 ? "products-filter-toggle--active" : ""}`}
          onClick={() => setFilterOpen(true)}
        >
          Filtros
          {activeFilterCount > 0 && (
            <span className="products-filter-badge">{activeFilterCount}</span>
          )}
        </button>

        <div className="products-sort-wrap">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="products-sort-select"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="products-chips-row">
          {activeCategory !== "todos" && (
            <Chip label={`Categoría: ${activeCategory}`} onRemove={() => setActiveCategory("todos")} />
          )}
          {selectedSizes.map((s) => (
            <Chip key={s} label={`Talle: ${s}`} onRemove={() => toggleSize(s)} />
          ))}
          {selectedBrands.map((b) => (
            <Chip key={b} label={`Marca: ${b}`} onRemove={() => toggleBrand(b)} />
          ))}
          {(minPrice || maxPrice < 500000) && (
            <Chip
              label={`Precio: $${minPrice || 0} – $${maxPrice.toLocaleString()}`}
              onRemove={() => { setMinPrice(""); setMaxPriceInput(500000); }}
            />
          )}
          <button onClick={clearFilters} className="products-chips-clear-all">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="products-results-info">
        {!loading && (
          <span className="products-results-count">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Product grid — full width */}
      {loading ? (
        <div className="products-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p>No se encontraron productos con esos filtros.</p>
          <button onClick={clearFilters} className="products-empty-btn">Limpiar filtros</button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* ── Filter drawer (slides in from left) ── */}
      {filterOpen && (
        <>
          <div className="products-filter-drawer fade-in">
            <div className="products-filter-drawer-header">
              <span>Filtros</span>
              <button onClick={() => setFilterOpen(false)} className="products-filter-drawer-close">✕</button>
            </div>
            <FilterContent />
          </div>
          <div
            className="products-filter-overlay"
            onClick={() => setFilterOpen(false)}
          />
        </>
      )}
    </div>
  );
};

const Chip = ({ label, onRemove }) => (
  <div className="products-chip">
    {label}
    <button onClick={onRemove} className="products-chip-remove">×</button>
  </div>
);

export default Products;