
import { useState } from "react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div style={styles.card}>
      <img
        src={imgError ? `https://picsum.photos/seed/${product.id}/300/200` : product.image}
        alt={product.name}
        style={styles.image}
        onError={() => setImgError(true)}
      />
      <div style={styles.body}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description && <p style={styles.desc}>{product.description}</p>}
        <div style={styles.footer}>
          <span style={styles.price}>${product.price.toLocaleString()}</span>
          {product.stock > 0 ? (
            <button onClick={handleAdd} style={{ ...styles.cartBtn, ...(added ? styles.cartBtnAdded : {}) }}>
              {added ? "✓ Agregado" : "+ Carrito"}
            </button>
          ) : (
            <span style={styles.outOfStock}>Sin stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: "#1a1a1a", borderRadius: 10, overflow: "hidden", border: "1px solid #2a2a2a", display: "flex", flexDirection: "column" },
  image: { width: "100%", height: 150, objectFit: "cover" },
  body: { padding: 12, display: "flex", flexDirection: "column", flex: 1 },
  category: { fontSize: 10, color: "#ff8060", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.3 },
  desc: { fontSize: 11, color: "#666", margin: "0 0 8px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8 },
  price: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  cartBtn: { padding: "6px 10px", background: "#ff3c00", border: "none", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, transition: "background 0.2s" },
  cartBtnAdded: { background: "#25D366" },
  outOfStock: { fontSize: 11, color: "#666", fontStyle: "italic" },
};

export default ProductCard;
