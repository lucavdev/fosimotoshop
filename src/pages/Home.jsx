
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getProducts().then((all) => {
      setTotalCount(all.length);
      const picks = ["cascos", "escapes", "indumentaria"].flatMap((cat) =>
        all.filter((p) => p.category === cat).slice(0, 2)
      );
      setFeatured(picks);
    });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroBadge}>🏍️ FosiMotoShop MX</div>
        <h1 style={styles.heroTitle}>Equipamiento de motocross de primer nivel</h1>
        <p style={styles.heroSub}>Cascos, escapes, indumentaria, botas, protecciones y más</p>
        <Link to="/products"><button style={styles.heroBtn}>Ver todos los productos →</button></Link>
      </div>

      <div style={styles.catGrid}>
        {[
          { label: "Cascos", emoji: "⛑️", cat: "cascos" },
          { label: "Escapes", emoji: "🔥", cat: "escapes" },
          { label: "Indumentaria", emoji: "👕", cat: "indumentaria" },
          { label: "Botas", emoji: "👢", cat: "botas" },
          { label: "Protecciones", emoji: "🦺", cat: "protecciones" },
          { label: "Accesorios", emoji: "🔧", cat: "accesorios" },
          { label: "Accesorios", emoji: "⚙️", cat: "Repuestos" },
        ].map(({ label, emoji, cat }) => (
          <Link key={cat} to={`/products?category=${cat}`} style={styles.catCard}>
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <span style={styles.catLabel}>{label}</span>
          </Link>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>⭐ Productos Destacados</h2>
      <div style={styles.grid}>
        {featured.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <Link to="/products">
          <button style={styles.verMasBtn}>Ver catálogo completo ({totalCount} productos)</button>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "0 24px 40px" },
  hero: { background: "linear-gradient(135deg, #1a1a1a 0%, #2a1000 100%)", borderRadius: "0 0 20px 20px", padding: "60px 30px", textAlign: "center", marginBottom: 40, marginLeft: -24, marginRight: -24, borderBottom: "3px solid #ff3c00" },
  heroBadge: { display: "inline-block", background: "#ff3c0020", border: "1px solid #ff3c0060", color: "#ff8060", padding: "4px 14px", borderRadius: 20, fontSize: 13, marginBottom: 16 },
  heroTitle: { fontSize: "clamp(22px,4vw,36px)", marginBottom: 10 },
  heroSub: { color: "#aaa", fontSize: 15, marginBottom: 28 },
  heroBtn: { background: "#ff3c00", border: "none", color: "white", padding: "13px 30px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: "bold" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 12, marginBottom: 40 },
  catCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "18px 12px", textDecoration: "none" },
  catLabel: { fontSize: 13, color: "#ccc" },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 20 },
  verMasBtn: { background: "transparent", border: "1px solid #ff3c00", color: "#ff3c00", padding: "10px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer" },
};

export default Home;
