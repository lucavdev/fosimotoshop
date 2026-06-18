import { createContext, useContext, useState, useEffect } from "react";
import { createOrder } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "fosimoto_cart";

export const CartProvider = ({ children }) => {
  const { isLogged } = useAuth();

  // Initialize from localStorage
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (e.g. private mode quota)
    }
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      // Key by id + size + color combo
      const key = `${product.id}-${product.size || ""}-${product.color || ""}`;
      const found = prev.find((i) => i._key === key);
      if (found) return prev.map((i) => i._key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, _key: key }];
    });
  };

  const removeItem = (key) => {
    setItems((prev) => {
      const found = prev.find((i) => i._key === key);
      if (!found) return prev;
      if (found.qty === 1) return prev.filter((i) => i._key !== key);
      return prev.map((i) => i._key === key ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeItemCompletely = (key) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const clearCart = () => setItems([]);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const total = subtotal;
  const count = items.reduce((acc, i) => acc + i.qty, 0);

  const checkout = async ({ shippingType, province, city, address, postalCode, couponCode, paymentMethod, nombre, dni }) => {
    if (items.length === 0) return { success: false, message: "El carrito está vacío" };
    if (!isLogged) return { success: false, message: "Debés iniciar sesión para finalizar la compra" };
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.id, qty: i.qty, size: i.size, color: i.color })),
        shippingType,
        province,
        city,
        address,
        postalCode,
        couponCode,
        paymentMethod,
        nombre,
        dni,
      });
      clearCart();
      return { success: true, order };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, removeItemCompletely, clearCart, subtotal, total, count, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
