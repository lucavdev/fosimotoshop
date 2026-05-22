
import { createContext, useContext, useState } from "react";
import { createOrder } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLogged } = useAuth();
  const [items, setItems] = useState([]);

  const addItem = (product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === productId);
      if (!found) return prev;
      if (found.qty === 1) return prev.filter((i) => i.id !== productId);
      return prev.map((i) => i.id === productId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const count = items.reduce((acc, i) => acc + i.qty, 0);

  const checkout = async () => {
    if (items.length === 0) return { success: false, message: "El carrito está vacío" };
    if (!isLogged) return { success: false, message: "Debés iniciar sesión para finalizar la compra" };
    try {
      const order = await createOrder({ items: items.map((i) => ({ productId: i.id, qty: i.qty })) });
      clearCart();
      return { success: true, order };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
