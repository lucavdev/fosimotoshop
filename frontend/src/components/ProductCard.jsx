import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const effectivePrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAdd = (e) => {
    e.stopPropagation();
    // If product has sizes or colors, go to detail page
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      navigate(`/products/${product.id}`);
      return;
    }
    addItem({ ...product, price: effectivePrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const imgSrc = imgError
    ? `https://picsum.photos/seed/${product.id}/400/300`
    : (product.image || `https://picsum.photos/seed/${product.id}/400/300`);

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHovered : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${product.id}`)}
    >
      <div style={styles.imageWrap}>
        <img
          src={imgSrc}
          alt={product.name}
          style={styles.image}
          onError={() => setImgError(true)}
        />
        {product.discount && (
          <div style={styles.discountBadge}>−{product.discount}%</div>
        )}
        {product.stock === 0 && (
          <div style={styles.outOfStockOverlay}>Sin stock</div>
        )}
        {product.brand && (
          <div style={styles.brandBadge}>{product.brand}</div>
        )}
      </div>
      <div style={styles.body}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description && <p style={styles.desc}>{product.description}</p>}

        {/* Sizes preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div style={styles.tagsRow}>
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s} style={styles.sizeTag}>{s}</span>
            ))}
            {product.sizes.length > 4 && <span style={styles.sizeTag}>+{product.sizes.length - 4}</span>}
          </div>
        )}

        <div style={styles.footer}>
          <div style={styles.priceBlock}>
            {product.discount ? (
              <>
                <span style={styles.originalPrice}>${product.price.toLocaleString()}</span>
                <span style={styles.price}>${Math.round(effectivePrice).toLocaleString()}</span>
              </>
            ) : (
              <span style={styles.price}>${product.price.toLocaleString()}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              style={{ ...styles.cartBtn, ...(added ? styles.cartBtnAdded : {}) }}
            >
              {added ? "✓" : "+"}
            </button>
          ) : (
            <span style={styles.noStock}>Sin stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: "#1a1a1a", borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2a", display: "flex", flexDirection: "column", cursor: "pointer", transition: "all 0.25s", transform: "translateY(0)" },
  cardHovered: { border: "1px solid #444", transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" },
  imageWrap: { position: "relative", overflow: "hidden" },
  image: { width: "100%", height: 180, objectFit: "cover", transition: "transform 0.3s" },
  discountBadge: { position: "absolute", top: 10, left: 10, background: "#ff3c00", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5 },
  brandBadge: { position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, backdropFilter: "blur(4px)" },
  outOfStockOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontWeight: 600, fontSize: 14 },
  body: { padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 },
  category: { fontSize: 10, color: "#ff8060", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 },
  name: { fontSize: 14, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3, color: "#f0f0f0" },
  desc: { fontSize: 12, color: "#666", margin: "0 0 8px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  tagsRow: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  sizeTag: { fontSize: 10, background: "#222", border: "1px solid #333", color: "#aaa", padding: "2px 6px", borderRadius: 4, fontWeight: 600 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10, borderTop: "1px solid #222" },
  priceBlock: { display: "flex", flexDirection: "column", gap: 1 },
  originalPrice: { fontSize: 11, color: "#555", textDecoration: "line-through" },
  price: { fontSize: 16, fontWeight: 800, color: "#fff" },
  cartBtn: { width: 34, height: 34, background: "#ff3c00", border: "none", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 },
  cartBtnAdded: { background: "#25D366" },
  noStock: { fontSize: 11, color: "#555", fontStyle: "italic" },
};

export default ProductCard;
