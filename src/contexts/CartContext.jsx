import { createContext, useContext, useState, useEffect } from "react";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");

  // Load cart when component mounts or token changes
  useEffect(() => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (token && userRole === "buyer") {
      fetchCart();
    } else {
      setCart([]);
    }
  }, []);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getAuthToken();
      const userRole = getUserRole();
      if (token && userRole === "buyer") {
        fetchCart();
      } else {
        setCart([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchCart = async () => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (!token || userRole !== "buyer") return;

    try {
      const response = await fetch(`${CRUD_URL}/catalog-items/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const getUserRole = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const addToCart = async (item, quantity = 1) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const userRole = getUserRole();
    if (userRole !== "buyer") {
      throw new Error("Only buyers can add items to cart");
    }

    const response = await fetch(`${CRUD_URL}/catalog-items/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId: item.id, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add item to cart");
    }

    // Refresh cart after adding
    await fetchCart();
  };

  const updateCartItem = async (itemId, quantity) => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (!token || userRole !== "buyer") return;

    const response = await fetch(`${CRUD_URL}/catalog-items/cart/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (response.ok) {
      await fetchCart();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to update cart");
    }
  };

  const removeFromCart = async (itemId) => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (!token || userRole !== "buyer") return;

    const response = await fetch(`${CRUD_URL}/catalog-items/cart/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await fetchCart();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove item from cart");
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (!token || userRole !== "buyer") return;

    const response = await fetch(`${CRUD_URL}/catalog-items/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setCart([]);
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to clear cart");
    }
  };

  const checkout = async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${CRUD_URL}/catalog-items/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Checkout failed");
    }

    // Clear cart after successful checkout
    setCart([]);
    return await response.json();
  };

  const value = {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
