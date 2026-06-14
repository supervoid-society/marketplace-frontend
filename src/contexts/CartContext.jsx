import { createContext, useContext, useState, useEffect } from "react";
import { CRUD_URL } from "../config";

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
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchPlatformSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${CRUD_URL}/admin-features/platform-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch platform settings:", error);
    }
  };

  // Load cart and platform settings when component mounts or token changes
  useEffect(() => {
    const token = getAuthToken();
    const userRole = getUserRole();
    if (token && userRole === "buyer") {
      fetchCart();
      fetchPlatformSettings();
    } else {
      setCart([]);
      setAppliedPromo(null);
      setPlatformSettings(null);
    }
  }, []);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getAuthToken();
      const userRole = getUserRole();
      if (token && userRole === "buyer") {
        fetchCart();
        fetchPlatformSettings();
      } else {
        setCart([]);
        setAppliedPromo(null);
        setPlatformSettings(null);
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

    if (quantity < 1) {
      return await removeFromCart(itemId);
    }

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
      setAppliedPromo(null);
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
    setAppliedPromo(null);
    return await response.json();
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let platformFee = 0;
  let discountAmount = 0;

  cart.forEach((item, index) => {
    const itemAmount = item.price * item.quantity;
    if (platformSettings) {
      const { fee_type, fee_percentage, fee_fixed } = platformSettings;
      if (fee_type === "percentage") {
        platformFee += itemAmount * (fee_percentage / 100);
      } else if (fee_type === "fixed") {
        platformFee += fee_fixed;
      } else if (fee_type === "both") {
        platformFee += itemAmount * (fee_percentage / 100) + fee_fixed;
      }
    }

    if (appliedPromo) {
      const { type, value } = appliedPromo;
      if (type === "percentage") {
        discountAmount += itemAmount * (value / 100);
      } else if (type === "fixed" && index === 0) {
        discountAmount += Math.min(value, itemAmount);
      }
    }
  });

  if (appliedPromo && appliedPromo.type === "percentage") {
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const finalTotal = subtotal + platformFee - discountAmount;

  const value = {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart: fetchCart,
    appliedPromo,
    setAppliedPromo,
    platformSettings,
    platformFee,
    discountAmount,
    finalTotal,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
