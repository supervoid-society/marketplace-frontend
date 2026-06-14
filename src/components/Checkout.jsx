import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { generateReceipt } from "../utils/receiptGenerator";
import { CRUD_URL, AUTH_URL } from "../config";
import Swal from "sweetalert2";

function Checkout() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [platformSettings, setPlatformSettings] = useState(null);

  const formatRupiah = (angka) => {
    return "Rp " + Number(angka).toLocaleString("id-ID");
  };

  const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${AUTH_URL}/transactions/balance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    const fetchPlatformSettings = async () => {
      try {
        const token = localStorage.getItem("token");
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

    fetchBalance();
    fetchPlatformSettings();
    setLoading(false);
  }, [cart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    discountAmount = Math.min(discountAmount, total);
  }

  const finalTotal = total + platformFee - discountAmount;
  const canCheckout = cart.length > 0 && finalTotal <= balance;

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

  const handlePayment = async () => {
    const user = getUserFromToken();
    if (!user || user.role !== "buyer") {
      Swal.fire({ icon: "error", title: "Invalid User" });
      return;
    }

    const token = localStorage.getItem("token");
    let balanceData;
    try {
      const balanceRes = await fetch(`${AUTH_URL}/transactions/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      balanceData = await balanceRes.json();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch balance" });
      return;
    }

    // Start simulation screen
    setIsProcessing(true);
    setProgress(0);
    setProcessingMessage("Establishing secure connection...");

    const steps = [
      { time: 1000, progress: 25, message: "Validating secure signatures..." },
      { time: 2200, progress: 50, message: "Authorizing transfer amount..." },
      { time: 3500, progress: 75, message: "Exchanging ledger tokens..." },
      { time: 4500, progress: 95, message: "Finalizing acquisition records..." },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setProgress(step.progress);
        setProcessingMessage(step.message);
      }, step.time);
    });

    // Wait exactly 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setProgress(100);
    setProcessingMessage("Payment Authorized.");

    try {
      let isPromoApplied = false;
      for (const item of cart) {
        const shouldApplyPromo = appliedPromo && (!isPromoApplied || appliedPromo?.type === "percentage");

        const checkoutRes = await fetch(`${CRUD_URL}/transactions/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: item.id,
            quantity: item.quantity,
            balance: balanceData.balance,
            signature: balanceData.signature,
            promoCode: shouldApplyPromo ? appliedPromo.code : undefined,
          }),
        });

        if (!checkoutRes.ok) {
          const errData = await checkoutRes.json();
          throw new Error(errData.error || `Checkout failed for ${item.name}`);
        }

        const checkoutData = await checkoutRes.json();
        const { transactionId, sellerId, amount, signature } = checkoutData;

        const transferRes = await fetch(`${AUTH_URL}/transactions/transfer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId, sellerId, amount, signature }),
        });

        if (!transferRes.ok) {
          const errData = await transferRes.json();
          try {
            await fetch(`${CRUD_URL}/transactions/cancel`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ transactionId }),
            });
          } catch (cancelErr) {
            console.error("Failed to cancel transaction:", cancelErr);
          }
          throw new Error(errData.error || `Transfer failed for ${item.name}`);
        }

        if (shouldApplyPromo) {
          isPromoApplied = true;
        }
      }
    } catch (error) {
      setIsProcessing(false);
      Swal.fire({ icon: "error", title: "Payment Failed", text: error.message, background: isDark ? "#09090b" : "#fff", color: isDark ? "#fff" : "#000" });
      return;
    }
    await clearCart();
    window.dispatchEvent(new CustomEvent("balanceChanged"));
    setIsProcessing(false);
    Swal.fire({ icon: "success", title: "Purchase Complete", background: isDark ? "#09090b" : "#fff", color: isDark ? "#fff" : "#000" });
    navigate("/transaction-history");
  };

  if (loading) return null;

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="relative mb-12">
          {/* Outer elegant spinning line */}
          <div
            className={`w-24 h-24 rounded-full border-t-2 border-r border-b ${isDark ? "border-t-zinc-100 border-zinc-900" : "border-t-zinc-900 border-zinc-100"} animate-spin`}
          ></div>
          {/* Inner elegant reverse spinning line */}
          <div
            className={`absolute top-2 left-2 w-20 h-20 rounded-full border-b-2 border-l border-t ${isDark ? "border-b-zinc-400 border-zinc-900" : "border-b-zinc-600 border-zinc-100"} animate-spin [animation-duration:1.5s] [animation-direction:reverse]`}
          ></div>
        </div>

        <h2 className="text-3xl font-serif italic mb-3 animate-pulse">Processing Acquirement</h2>
        <div className="h-6 overflow-hidden mb-6">
          <p key={processingMessage} className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-400" : "text-zinc-500"} animate-fade-in`}>
            {processingMessage}
          </p>
        </div>

        <div className={`w-48 h-[1px] ${isDark ? "bg-zinc-900" : "bg-zinc-100"} overflow-hidden relative`}>
          <div className={`absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300 ease-out`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-6 max-w-2xl mx-auto">
      <div>
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Payment.</h1>
          <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Finalize your acquisition.</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-serif italic mb-6">No items selected.</h2>
            <Link to="/catalog" className="text-[10px] uppercase tracking-widest font-black underline underline-offset-8">
              Return to Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <div className={`p-6 md:p-10 border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
              <div className="text-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-2">Manifest / Receipt</h2>
                <h3 className="text-2xl font-serif italic mb-4">Ahmeng Marketplace</h3>
                <div className="flex justify-between items-center text-[8px] uppercase tracking-[0.2em] opacity-40 font-bold px-4">
                  <span>REF: AM-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {cart.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-start gap-8">
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black opacity-20">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="text-sm font-serif">{item.name}</p>
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                          QTY: {item.quantity} &times; {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium tracking-tighter">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input Block */}
              <div className="my-8 pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800">
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
                    className="flex-1 bg-transparent border-b focus:outline-none uppercase tracking-wider font-mono text-sm py-2"
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-4 py-2 border border-rose-500/20 text-rose-500 text-[10px] uppercase font-black hover:bg-rose-500/10 cursor-pointer transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleValidatePromo}
                      disabled={!promoCode}
                      className={`px-6 py-2 border text-[10px] uppercase font-black cursor-pointer transition-all ${
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
                {promoError && <p className="text-[10px] font-bold text-rose-500 mt-2">{promoError}</p>}
                {appliedPromo && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-2">
                    Promo applied: {appliedPromo.type === "percentage" ? `${appliedPromo.value}%` : formatRupiah(appliedPromo.value)} discount.
                  </p>
                )}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                  <span className={isDark ? "text-zinc-650" : "text-zinc-400"}>Subtotal</span>
                  <span>{formatRupiah(total)}</span>
                </div>
                {platformFee > 0 && (
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                    <span className={isDark ? "text-zinc-600" : "text-zinc-400"}>Platform Fee</span>
                    <span>+ {formatRupiah(platformFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-emerald-500">
                    <span>Discount Promo ({appliedPromo?.code})</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-900 pt-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black">Total Amount</span>
                  <span className="text-3xl font-black tracking-tighter">{formatRupiah(finalTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold pt-2">
                  <span className={isDark ? "text-zinc-600" : "text-zinc-400"}>Current Balance</span>
                  <span className={finalTotal > balance ? "text-rose-500" : ""}>{formatRupiah(balance)}</span>
                </div>
                {finalTotal > balance && (
                  <p className="text-center text-[10px] uppercase tracking-widest font-black text-rose-500 mt-4">Insufficient funds for this transaction.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/cart"
                className={`flex-1 py-5 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
              >
                Back to Bag
              </Link>
              <button
                onClick={handlePayment}
                disabled={!canCheckout}
                className={`flex-[2] py-5 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${
                  canCheckout
                    ? isDark
                      ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                      : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                    : "bg-transparent border-zinc-200 text-zinc-300 cursor-not-allowed"
                }`}
              >
                Authorize Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
