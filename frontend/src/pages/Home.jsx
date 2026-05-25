import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const PROMOS = [
  {
    id: 1,
    title: "🔥 Liquidación de temporada",
    subtitle: "Hasta 40% de descuento en cascos seleccionados",
    bg: "linear-gradient(135deg, #1a0a00 0%, #3d1200 50%, #1a0a00 100%)",
    accent: "#ff3c00",
    cta: "Ver cascos",
    link: "/products?category=cascos",
    badge: "OFERTA LIMITADA",
  },
  {
    id: 2,
    title: "⚡ Escapes de competición",
    subtitle: "Nuevos modelos 2025 disponibles para tu moto",
    bg: "linear-gradient(135deg, #000d1a 0%, #001d3a 50%, #000d1a 100%)",
    accent: "#60a5fa",
    cta: "Ver escapes",
    link: "/products?category=escapes",
    badge: "NUEVO",
  },
  {
    id: 3,
    title: "👕 Indumentaria premium",
    subtitle: "Equipate con los mejores de la industria del motocross",
    bg: "linear-gradient(135deg, #0a001a 0%, #1a0030 50%, #0a001a 100%)",
    accent: "#a78bfa",
    cta: "Ver indumentaria",
    link: "/products?category=indumentaria",
    badge: "DESTACADO",
  },
  {
    id: 4,
    title: "🦺 Protecciones certificadas",
    subtitle: "Tu seguridad primero. Equipos con certificación CE",
    bg: "linear-gradient(135deg, #001a0a 0%, #003320 50%, #001a0a 100%)",
    accent: "#34d399",
    cta: "Ver protecciones",
    link: "/products?category=protecciones",
    badge: "SEGURIDAD",
  },
];

const CATEGORIES = [
  { label: "Cascos", emoji: "⛑️", cat: "cascos", color: "#ff3c00" },
  { label: "Escapes", emoji: "🔥", cat: "escapes", color: "#f59e0b" },
  { label: "Indumentaria", emoji: "👕", cat: "indumentaria", color: "#a78bfa" },
  { label: "Botas", emoji: "👢", cat: "botas", color: "#34d399" },
  { label: "Protecciones", emoji: "🦺", cat: "protecciones", color: "#60a5fa" },
  { label: "Accesorios", emoji: "🔧", cat: "accesorios", color: "#f87171" },
  { label: "Repuestos", emoji: "⚙️", cat: "Repuestos", color: "#fb923c" },
];

const Carousel = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const resetTimer = (fn) => {
    clearInterval(intervalRef.current);
    fn();
    intervalRef.current = setInterval(next, 5000);
  };

  const slide = slides[current];

  return (
    <div style={cs.wrap}>
      <div style={{ ...cs.slide, background: slide.bg }}>
        {/* Decorative grid */}
        <div style={cs.grid} />
        <div style={cs.content}>
          <span style={{ ...cs.badge, borderColor: slide.accent, color: slide.accent }}>{slide.badge}</span>
          <h2 style={cs.title}>{slide.title}</h2>
          <p style={cs.sub}>{slide.subtitle}</p>
          <Link to={slide.link}>
            <button style={{ ...cs.cta, background: slide.accent }} className="btn-primary">
              {slide.cta} →
            </button>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <button onClick={() => resetTimer(prev)} style={{ ...cs.arrow, left: 12 }} aria-label="Anterior">‹</button>
      <button onClick={() => resetTimer(next)} style={{ ...cs.arrow, right: 12 }} aria-label="Siguiente">›</button>

      {/* Dots */}
      <div style={cs.dots}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => resetTimer(() => setCurrent(i))}
            style={{ ...cs.dot, background: i === current ? slide.accent : "#444", transform: i === current ? "scale(1.3)" : "scale(1)" }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const cs = {
  wrap: { position: "relative", borderRadius: "0 0 24px 24px", overflow: "hidden", marginBottom: 48 },
  slide: { minHeight: 320, display: "flex", alignItems: "center", padding: "60px 32px", position: "relative" },
  grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" },
  content: { position: "relative", zIndex: 1, maxWidth: 600 },
  badge: { display: "inline-block", border: "1px solid", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 },
  title: { fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2, color: "#fff" },
  sub: { color: "#bbb", fontSize: "clamp(13px, 1.5vw, 16px)", marginBottom: 28, lineHeight: 1.6 },
  cta: { border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  arrow: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "background 0.2s" },
  dots: { position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", transition: "all 0.2s", padding: 0 },
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((all) => {
      setTotalCount(all.length);
      const picks = ["cascos", "escapes", "indumentaria"].flatMap((cat) =>
        all.filter((p) => p.category === cat).slice(0, 2)
      );
      setFeatured(picks.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroGrid} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🏍️ FosiMotoShop MX — Tu tienda de confianza</div>
          <h1 style={styles.heroTitle}>
            Equipamiento de<br />
            <span style={styles.heroAccent}>motocross</span> de primer nivel
          </h1>
          <p style={styles.heroSub}>
            Cascos, escapes, indumentaria, botas, protecciones y mucho más.<br className="hide-mobile" />
            Todo lo que necesitás para disfrutar al máximo.
          </p>
          <div style={styles.heroBtns}>
            <Link to="/products">
              <button style={styles.heroMainBtn}>
                🛍️ Ver catálogo completo
              </button>
            </Link>
            <Link to="/products?category=cascos">
              <button style={styles.heroSecBtn}>Ver ofertas →</button>
            </Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}><span style={styles.heroStatNum}>{totalCount}+</span><span style={styles.heroStatLabel}>Productos</span></div>
            <div style={styles.heroStatDivider} />
            <div style={styles.heroStat}><span style={styles.heroStatNum}>7</span><span style={styles.heroStatLabel}>Categorías</span></div>
            <div style={styles.heroStatDivider} />
            <div style={styles.heroStat}><span style={styles.heroStatNum}>24h</span><span style={styles.heroStatLabel}>Respuesta</span></div>
          </div>
        </div>
        <div style={styles.heroDecor}>
          <div style={styles.heroOrb1} />
          <div style={styles.heroOrb2} />
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Promo Carousel */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🎯 Promociones</h2>
            <span style={styles.sectionSub}>Ofertas especiales seleccionadas para vos</span>
          </div>
          <Carousel slides={PROMOS} />
        </section>

        {/* Categories */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📂 Categorías</h2>
            <Link to="/products" style={styles.seeAll}>Ver todo →</Link>
          </div>
          <div style={styles.catGrid}>
            {CATEGORIES.map(({ label, emoji, cat, color }) => (
              <Link key={cat} to={`/products?category=${cat}`} style={styles.catCard}>
                <div style={{ ...styles.catIcon, background: `${color}18`, border: `1px solid ${color}30` }}>
                  <span style={{ fontSize: 26 }}>{emoji}</span>
                </div>
                <span style={styles.catLabel}>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>⭐ Productos Destacados</h2>
            <Link to="/products" style={styles.seeAll}>Ver todos →</Link>
          </div>
          {loading ? (
            <div style={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 280, borderRadius: 12 }} className="skeleton" />
              ))}
            </div>
          ) : (
            <div style={styles.grid}>
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/products">
              <button style={styles.verMasBtn}>
                Ver catálogo completo ({totalCount} productos) →
              </button>
            </Link>
          </div>
        </section>

        {/* Features strip */}
        <section style={styles.featuresStrip}>
          {[
            { icon: "🚚", title: "Envío a todo el país", sub: "Correo argentino $15.000" },
            { icon: "🏪", title: "Retiro gratis", sub: "Retirá en nuestra sucursal" },
            { icon: "💬", title: "Soporte por WhatsApp", sub: "Respondemos en menos de 1 hora" },
            { icon: "🔒", title: "Pago seguro", sub: "Tus datos siempre protegidos" },
          ].map(({ icon, title, sub }) => (
            <div key={title} style={styles.featureItem}>
              <span style={styles.featureIcon}>{icon}</span>
              <div>
                <div style={styles.featureTitle}>{title}</div>
                <div style={styles.featureSub}>{sub}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh" },
  // Hero
  hero: { position: "relative", background: "linear-gradient(135deg, #0d0d0d 0%, #1a0800 50%, #0d0d0d 100%)", borderBottom: "1px solid #2a1500", overflow: "hidden", minHeight: 520, display: "flex", alignItems: "center" },
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,60,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,60,0,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, padding: "80px clamp(24px, 5vw, 80px)", maxWidth: 700 },
  heroBadge: { display: "inline-block", background: "rgba(255,60,0,0.12)", border: "1px solid rgba(255,60,0,0.3)", color: "#ff8060", padding: "5px 16px", borderRadius: 20, fontSize: 13, marginBottom: 24, fontWeight: 500 },
  heroTitle: { fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: "#fff" },
  heroAccent: { background: "linear-gradient(135deg, #ff3c00, #ff8060)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { color: "#aaa", fontSize: "clamp(14px, 1.5vw, 17px)", lineHeight: 1.7, marginBottom: 36 },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 },
  heroMainBtn: { background: "linear-gradient(135deg, #ff3c00, #ff5722)", border: "none", color: "white", padding: "15px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(255,60,0,0.35)", transition: "all 0.2s" },
  heroSecBtn: { background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", color: "#ddd", padding: "15px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
  heroStats: { display: "flex", gap: 0, alignItems: "center" },
  heroStat: { display: "flex", flexDirection: "column", padding: "0 20px" },
  heroStatNum: { fontSize: 22, fontWeight: 800, color: "#ff3c00" },
  heroStatLabel: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1 },
  heroStatDivider: { width: 1, height: 32, background: "#2a2a2a" },
  heroDecor: { position: "absolute", right: "-10%", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  heroOrb1: { width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,0,0.12) 0%, transparent 70%)", position: "absolute", right: 0, top: -100 },
  heroOrb2: { width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,0,0.07) 0%, transparent 70%)", position: "absolute", right: 150, top: 80 },

  mainContent: { padding: "0 clamp(16px, 3vw, 48px)", maxWidth: 1400, margin: "0 auto" },
  section: { marginBottom: 56 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  sectionTitle: { fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700, color: "#fff" },
  sectionSub: { fontSize: 13, color: "#666" },
  seeAll: { color: "#ff3c00", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "opacity 0.2s" },

  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 },
  catCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 12px", textDecoration: "none", transition: "all 0.2s", cursor: "pointer" },
  catIcon: { width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 13, color: "#ccc", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 },

  verMasBtn: { background: "transparent", border: "1.5px solid #ff3c00", color: "#ff3c00", padding: "12px 32px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },

  featuresStrip: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "#222", border: "1px solid #222", borderRadius: 16, overflow: "hidden", marginBottom: 48 },
  featureItem: { display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: "#141414" },
  featureIcon: { fontSize: 28, flexShrink: 0 },
  featureTitle: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 },
  featureSub: { fontSize: 12, color: "#666" },
};

export default Home;
