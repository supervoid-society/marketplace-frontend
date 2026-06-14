import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CRUD_URL } from "../config";
import Swal from "sweetalert2";

function Cart() {
  const { isDark } = useTheme();
  const { cart, updateCartItem, clearCart, appliedPromo, setAppliedPromo, platformFee, discountAmount, finalTotal, subtotal } = useCart();
  const [stockCache, setStockCache] = useState({});
  const [lastStockFetch, setLastStockFetch] = useState({});
  const [promoCode, setPromoCode] = useState(appliedPromo ? appliedPromo.code : "");
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    if (!appliedPromo) {
      setPromoCode("");
    } else {
      setPromoCode(appliedPromo.code);
    }
  }, [appliedPromo]);

  const formatRupiah = (angka) => {
    return (
      "Rp " +
      Number(angka)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };

  const handleValidatePromo = async () => {
    if (!promoCode) return;
    setPromoError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CRUD_URL}/admin-features/promos/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedPromo(data);
        Swal.fire({
          icon: "success",
          title: "Promo Applied",
          text: `Kode promo ${data.code} berhasil dipasang!`,
          timer: 1500,
          showConfirmButton: false,
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      } else {
        setAppliedPromo(null);
        setPromoError(data.error || "Invalid promo code.");
      }
    } catch (error) {
      setPromoError("Failed to validate promo code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const updateQuantity = async (cartItemId, catalogItemId, quantity) => {
    if (quantity <= 0) {
      await updateCartItem(cartItemId, 0);
    } else {
      try {
        const now = Date.now();
        let maxQty = stockCache[catalogItemId];

        if (!maxQty || !lastStockFetch[catalogItemId] || now - lastStockFetch[catalogItemId] > 30000) {
          const res = await fetch(`${CRUD_URL}/catalog-items/${catalogItemId}`);
          const itemData = await res.json();
          maxQty = itemData.qty || 0;
          setStockCache((prev) => ({ ...prev, [catalogItemId]: maxQty }));
          setLastStockFetch((prev) => ({ ...prev, [catalogItemId]: now }));
        }

        const newQuantity = Math.min(quantity, maxQty);
        await updateCartItem(cartItemId, newQuantity);

        if (quantity > maxQty) {
          Swal.fire({
            icon: "warning",
            title: "Stock Insufficient",
            text: `Maximum available: ${maxQty}`,
          });
        }
      } catch (error) {
        console.error("Error fetching stock:", error);
        await updateCartItem(cartItemId, quantity);
      }
    }
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
            Your <span className="italic">Bag.</span>
          </h1>
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Review and refine your selection before purchase.</p>
        </div>
        <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Count &mdash; {cart.length}</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-serif italic mb-6">Your bag is currently empty.</h2>
          <Link
            to="/catalog"
            className={`px-10 py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Discover Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 self-start space-y-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
            {cart.map((item) => (
              <div key={item.id} className={`p-4 md:p-8 flex items-center gap-4 md:gap-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                {item.image_id && (
                  <div className={`w-16 h-16 md:w-24 md:h-24 flex-shrink-0 border ${isDark ? "border-zinc-900" : "border-zinc-50"}`}>
                    <img
                      src={`${CRUD_URL}/images/${item.image_id}`}
                      alt={item.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-serif tracking-tight mb-1">{item.name}</h2>
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{formatRupiah(item.price)} per unit</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className={`flex items-center gap-4 p-1 border ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                    <button
                      onClick={() => updateQuantity(item.item_id, item.item_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.item_id, item.item_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-lg font-medium tracking-tighter">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className={`p-6 md:p-8 border lg:sticky lg:top-32 ${isDark ? "border-zinc-900 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50/50"}`}>
              <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-8">Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-650" : "text-zinc-400"}`}>Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                {platformFee > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-650" : "text-zinc-400"}`}>Platform Fee</span>
                    <span className="font-medium">{formatRupiah(platformFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-baseline text-emerald-500">
                    <span className="text-[10px] uppercase tracking-widest font-bold">Discount ({appliedPromo?.code})</span>
                    <span className="font-medium">- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-650" : "text-zinc-400"}`}>Shipping</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Complimentary</span>
                </div>
              </div>

              {/* Promo Code Input Block */}
              <div className="my-6 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60 mb-2">Promo Code</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    disabled={appliedPromo}
                    placeholder="Enter code (e.g. DISCOUNT10)"
                    className="flex-1 bg-transparent border-b focus:outline-none uppercase tracking-wider font-mono text-xs py-1"
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-3 py-1 border border-rose-500/20 text-rose-500 text-[9px] uppercase font-black hover:bg-rose-500/10 cursor-pointer transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleValidatePromo}
                      disabled={!promoCode}
                      className={`px-4 py-1 border text-[9px] uppercase font-black cursor-pointer transition-all ${
                        promoCode
                          ? isDark
                            ? "bg-zinc-100 border-zinc-100 text-zinc-900 hover:bg-transparent hover:text-zinc-100"
                            : "bg-zinc-900 border-zinc-900 text-white hover:bg-transparent hover:text-zinc-900"
                          : "border-zinc-200 text-zinc-300 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {promoError && <p className="text-[9px] font-bold text-rose-500 mt-2">{promoError}</p>}
                {appliedPromo && (
                  <p className="text-[9px] font-bold text-emerald-500 mt-2">
                    Promo applied: {appliedPromo.type === "percentage" ? `${appliedPromo.value}%` : formatRupiah(appliedPromo.value)} discount.
                  </p>
                )}
              </div>

              <div className={`h-px w-full mb-6 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
              <div className="flex justify-between items-end mb-12">
                <span className="text-xs uppercase tracking-widest font-black">Total</span>
                <span className="text-3xl font-black tracking-tighter">{formatRupiah(finalTotal)}</span>
              </div>
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className={`block w-full py-5 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
                >
                  Proceed to Payment
                </Link>
                <button
                  onClick={handleClearCart}
                  className={`block w-full py-5 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
                >
                  Clear All Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
