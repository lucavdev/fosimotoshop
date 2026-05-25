
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error del servidor");
  return data;
};

// ── Auth ──
export const loginUser = (body) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(body) });
export const registerUser = (body) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
export const getMe = () => apiFetch("/api/auth/me");

// ── Products ──
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/products${qs ? "?" + qs : ""}`);
};
export const getProductById = (id) => apiFetch(`/api/products/${id}`);
export const getBrands = () => apiFetch("/api/products/brands");
export const createProduct = (body) => apiFetch("/api/products", { method: "POST", body: JSON.stringify(body) });
export const updateProduct = (id, body) => apiFetch(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteProduct = (id) => apiFetch(`/api/products/${id}`, { method: "DELETE" });

// ── Orders ──
export const createOrder = (body) => apiFetch("/api/orders", { method: "POST", body: JSON.stringify(body) });
export const getMyOrders = () => apiFetch("/api/orders/my");
export const getAllOrders = () => apiFetch("/api/orders");
export const updateOrder = (id, body) => apiFetch(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(body) });

// ── Coupons ──
export const validateCoupon = (body) => apiFetch("/api/coupons/validate", { method: "POST", body: JSON.stringify(body) });
export const getCoupons = () => apiFetch("/api/coupons");
export const createCoupon = (body) => apiFetch("/api/coupons", { method: "POST", body: JSON.stringify(body) });
export const toggleCoupon = (id, active) => apiFetch(`/api/coupons/${id}`, { method: "PUT", body: JSON.stringify({ active }) });
export const deleteCoupon = (id) => apiFetch(`/api/coupons/${id}`, { method: "DELETE" });
