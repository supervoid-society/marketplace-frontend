import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import jsPDF from "jspdf";
import { CRUD_URL, AUTH_URL } from "../config";
import Swal from "sweetalert2";

function Checkout() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

    fetchBalance();
    setLoading(false);
  }, [cart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const canCheckout = cart.length > 0 && total <= balance;

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

    try {
      for (const item of cart) {
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
          }),
        });

        if (!checkoutRes.ok) throw new Error(`Checkout failed for ${item.name}`);

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

        if (!transferRes.ok) throw new Error(`Transfer failed for ${item.name}`);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Payment Failed", text: error.message });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("RECEIPT", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("Ahmeng Marketplace", 105, 30, { align: "center" });
    let y = 60;
    cart.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} (x${item.quantity})`, 20, y);
      doc.text(formatRupiah(item.price * item.quantity), 160, y);
      y += 10;
    });
    doc.line(20, y, 190, y);
    doc.text("TOTAL", 130, y + 10);
    doc.text(formatRupiah(total), 160, y + 10);
    doc.save("receipt.pdf");

    await clearCart();
    window.dispatchEvent(new CustomEvent("balanceChanged"));
    Swal.fire({ icon: "success", title: "Purchase Complete" });
    navigate("/catalog");
  };

  if (loading) return null;

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
                <p className="text-[10px] uppercase tracking-widest opacity-40">{new Date().toLocaleDateString("en-GB")}</p>
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

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black">Total Amount</span>
                  <span className="text-3xl font-black tracking-tighter">{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                  <span className={isDark ? "text-zinc-600" : "text-zinc-400"}>Current Balance</span>
                  <span className={total > balance ? "text-rose-500" : ""}>{formatRupiah(balance)}</span>
                </div>
                {total > balance && <p className="text-center text-[10px] uppercase tracking-widest font-black text-rose-500 mt-4">Insufficient funds for this transaction.</p>}
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
