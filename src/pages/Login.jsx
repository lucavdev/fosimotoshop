
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏍️ Iniciar sesión</h2>
        {error && <div style={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" style={styles.input} required />
          <label style={styles.label}>Contraseña</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={styles.input} required />
          <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Ingresando..." : "Ingresar"}</button>
        </form>
        <p style={styles.footer}>¿No tenés cuenta? <Link to="/register" style={styles.link}>Registrate</Link></p>
        <p style={styles.footer}><Link to="/" style={styles.linkGray}>← Volver a la tienda</Link></p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "36px 32px", width: "100%", maxWidth: 400 },
  title: { marginBottom: 24, fontSize: 22, textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, color: "#aaa" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "white", fontSize: 14, outline: "none" },
  btn: { marginTop: 8, padding: 12, background: "#ff3c00", border: "none", color: "white", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: "bold" },
  footer: { textAlign: "center", fontSize: 13, marginTop: 16, color: "#888" },
  link: { color: "#ff3c00", textDecoration: "none" },
  linkGray: { color: "#666", textDecoration: "none" },
  errorBox: { background: "#2a0000", border: "1px solid #ff3c00", borderRadius: 8, padding: "10px 14px", color: "#ff6b6b", fontSize: 13, marginBottom: 16 },
};

export default Login;
