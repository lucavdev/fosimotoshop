import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedImg(0);
    setImgError(false);
    getProductById(id)
      .then((p) => {
        setProduct(p);
        // Fetch related products
        return getProducts({ category: p.category });
      })
      .then((all) => {
        setRelated(all.filter((p) => p.id !== Number(id)).slice(0, 4));
        setLoading(false);
      })
      .catch(() => {
        setError("Producto no encontrado.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.loading}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid #333", borderTopColor: "#ff3c00", animation: "spin 0.8s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={styles.page}>
      <div style={styles.errorBox}>
        <h2>{error}</h2>
        <button onClick={() => navigate("/products")} style={styles.backBtn}>← Volver al catálogo</button>
      </div>
    </div>
  );

  const allImages = [product.image, ...(product.images || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const effectivePrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) { alert("Por favor seleccioná un talle."); return; }
    if (product.colors?.length > 0 && !selectedColor) { alert("Por favor seleccioná un color."); return; }
    addItem({ ...product, price: effectivePrice, size: selectedSize, color: selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const currentImgSrc = imgError ? `https://picsum.photos/seed/${product.id}/600/400` : (allImages[selectedImg] || `https://picsum.photos/seed/${product.id}/600/400`);

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadLink} onClick={() => navigate("/")}>Inicio</span>
        <span style={styles.breadSep}>›</span>
        <span style={styles.breadLink} onClick={() => navigate("/products")}>Productos</span>
        <span style={styles.breadSep}>›</span>
        <span style={styles.breadLink} onClick={() => navigate(`/products?category=${product.category}`)}>{product.category}</span>
        <span style={styles.breadSep}>›</span>
        <span style={styles.breadCurrent}>{product.name}</span>
      </div>

      <div style={styles.layout}>
        {/* Gallery */}
        <div style={styles.galleryCol}>
          <div style={styles.mainImgWrap}>
            <img
              src={currentImgSrc}
              alt={product.name}
              style={styles.mainImg}
              onError={() => setImgError(true)}
            />
            {product.discount && (
              <div style={styles.discountBadge}>−{product.discount}% OFF</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div style={styles.thumbRow}>
              {allImages.map((img, i) => (
                <img key={i} src={img} alt={`Vista ${i + 1}`}
                  style={{ ...styles.thumb, ...(selectedImg === i ? styles.thumbActive : {}) }}
                  onClick={() => { setSelectedImg(i); setImgError(false); }}
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id + i}/100/100`; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={styles.infoCol}>
          {product.brand && <div style={styles.brandTag}>{product.brand}</div>}
          <span style={styles.categoryTag}>{product.category}</span>
          <h1 style={styles.title}>{product.name}</h1>

          {/* Price */}
          <div style={styles.priceRow}>
            {product.discount ? (
              <>
                <span style={styles.priceFull}>${product.price.toLocaleString()}</span>
                <span style={styles.priceEffective}>${Math.round(effectivePrice).toLocaleString()}</span>
                <span style={styles.savingsBadge}>Ahorrás ${Math.round(product.price - effectivePrice).toLocaleString()}</span>
              </>
            ) : (
              <span style={styles.priceEffective}>${product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p style={styles.description}>{product.description}</p>
          )}

          <div style={styles.divider} />

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={styles.selectorSection}>
              <div style={styles.selectorLabel}>
                Talle: {selectedSize ? <strong style={{ color: "#fff" }}>{selectedSize}</strong> : <span style={{ color: "#666" }}>Seleccioná un talle</span>}
              </div>
              <div style={styles.sizeGrid}>
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    style={{ ...styles.sizeBtn, ...(selectedSize === s ? styles.sizeBtnActive : {}) }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div style={styles.selectorSection}>
              <div style={styles.selectorLabel}>
                Color: {selectedColor ? <strong style={{ color: "#fff" }}>{selectedColor}</strong> : <span style={{ color: "#666" }}>Seleccioná un color</span>}
              </div>
              <div style={styles.colorGrid}>
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    style={{ ...styles.colorBtn, ...(selectedColor === c ? styles.colorBtnActive : {}) }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div style={styles.stockInfo}>
            {product.stock > 0 ? (
              <span style={styles.stockOk}>✓ En stock ({product.stock} disponibles)</span>
            ) : (
              <span style={styles.stockOut}>✗ Sin stock</span>
            )}
          </div>

          {/* Add to cart */}
          {product.stock > 0 ? (
            <button onClick={handleAdd} style={{ ...styles.addBtn, ...(added ? styles.addBtnDone : {}) }}>
              {added ? "✓ ¡Agregado al carrito!" : "🛒 Agregar al carrito"}
            </button>
          ) : (
            <button disabled style={styles.disabledBtn}>Sin stock disponible</button>
          )}

          {/* Shipping info */}
          <div style={styles.shippingInfo}>
            <div style={styles.shippingItem}>🚚 <span>Envío por correo: <strong>$15.000</strong></span></div>
            <div style={styles.shippingItem}>🏪 <span>Retiro en sucursal: <strong style={{ color: "#34d399" }}>Gratis</strong></span></div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>También te puede interesar</h2>
          <div style={styles.relatedGrid}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: "24px clamp(12px, 3vw, 48px)", maxWidth: 1200, margin: "0 auto", minHeight: "80vh" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: 400 },
  errorBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, color: "#aaa", gap: 16 },
  backBtn: { background: "#ff3c00", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginTop: 8 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" },
  breadLink: { color: "#666", fontSize: 13, cursor: "pointer", transition: "color 0.2s" },
  breadSep: { color: "#444", fontSize: 12 },
  breadCurrent: { color: "#aaa", fontSize: 13 },

  layout: { display: "grid", gridTemplateColumns: "clamp(280px, 45%, 560px) 1fr", gap: 40, alignItems: "start", marginBottom: 56 },

  // Gallery
  galleryCol: { display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 80 },
  mainImgWrap: { position: "relative", borderRadius: 16, overflow: "hidden", background: "#1a1a1a", border: "1px solid #2a2a2a" },
  mainImg: { width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" },
  discountBadge: { position: "absolute", top: 16, left: 16, background: "#ff3c00", color: "#fff", fontSize: 13, fontWeight: 800, padding: "5px 12px", borderRadius: 8 },
  thumbRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  thumb: { width: 70, height: 70, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "2px solid transparent", transition: "border-color 0.2s", opacity: 0.7 },
  thumbActive: { borderColor: "#ff3c00", opacity: 1 },

  // Info
  infoCol: { display: "flex", flexDirection: "column", gap: 0 },
  brandTag: { display: "inline-block", background: "rgba(255,255,255,0.07)", color: "#aaa", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, width: "fit-content" },
  categoryTag: { fontSize: 11, color: "#ff8060", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 8, display: "block" },
  title: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: "#fff" },
  priceRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  priceFull: { fontSize: 18, color: "#555", textDecoration: "line-through" },
  priceEffective: { fontSize: 32, fontWeight: 800, color: "#fff" },
  savingsBadge: { background: "rgba(37,211,102,0.15)", color: "#34d399", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6 },
  description: { fontSize: 14, color: "#999", lineHeight: 1.7, marginBottom: 16 },
  divider: { height: 1, background: "#2a2a2a", margin: "16px 0" },

  selectorSection: { marginBottom: 20 },
  selectorLabel: { fontSize: 13, color: "#888", marginBottom: 10, fontWeight: 500 },
  sizeGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  sizeBtn: { padding: "8px 16px", background: "#1a1a1a", border: "1.5px solid #2a2a2a", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" },
  sizeBtnActive: { background: "rgba(255,60,0,0.15)", borderColor: "#ff3c00", color: "#ff3c00" },
  colorGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  colorBtn: { padding: "8px 16px", background: "#1a1a1a", border: "1.5px solid #2a2a2a", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" },
  colorBtnActive: { background: "rgba(255,60,0,0.15)", borderColor: "#ff3c00", color: "#ff3c00" },

  stockInfo: { marginBottom: 20 },
  stockOk: { fontSize: 13, color: "#34d399", fontWeight: 600 },
  stockOut: { fontSize: 13, color: "#f87171", fontWeight: 600 },

  addBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #ff3c00, #ff5722)", border: "none", color: "#fff", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", marginBottom: 16, boxShadow: "0 4px 24px rgba(255,60,0,0.3)" },
  addBtnDone: { background: "linear-gradient(135deg, #25D366, #22c55e)", boxShadow: "0 4px 24px rgba(37,211,102,0.3)" },
  disabledBtn: { width: "100%", padding: "16px", background: "#1a1a1a", border: "1px solid #333", color: "#555", borderRadius: 12, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "not-allowed", marginBottom: 16 },

  shippingInfo: { display: "flex", flexDirection: "column", gap: 8, background: "#141414", border: "1px solid #222", borderRadius: 10, padding: "14px 16px" },
  shippingItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa" },

  relatedSection: { marginTop: 40, paddingTop: 40, borderTop: "1px solid #222" },
  relatedTitle: { fontSize: 22, fontWeight: 700, marginBottom: 24, color: "#fff" },
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 },
};

// Responsive layout — handled by index.css media queries on gridTemplateColumns

export default ProductDetail;
