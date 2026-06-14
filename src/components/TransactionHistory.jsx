import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL } from "../config";
import { generateReceipt } from "../utils/receiptGenerator";

function TransactionHistory() {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${CRUD_URL}/transactions/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const downloadReceipt = (t) => {
    generateReceipt({
      items: [
        {
          name: t.item_name,
          quantity: t.quantity ?? 1,
          price: t.amount / (t.quantity ?? 1),
        },
      ],
      total: t.amount,
      refId: "AM-" + t.id.slice(-9).toUpperCase(),
      date: new Date(t.created_at),
    });
  };

  if (loading) return null;

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Archive.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Chronicle of your transactions.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-serif italic opacity-40">No transactions recorded.</h2>
        </div>
      ) : (
        <div className="border border-zinc-100 dark:border-zinc-900 space-y-px bg-zinc-100 dark:bg-zinc-900">
          {transactions.map((t) => (
            <div key={t.id} className={`p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
              <div className="flex gap-8 items-center">
                <Link
                  to={`/catalog/${t.item_id}`}
                  className={`w-20 h-20 md:w-24 md:h-24 border grayscale shrink-0 transition-all duration-300 hover:grayscale-0 ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50"}`}
                >
                  <img
                    src={`${CRUD_URL}/images/${t.item_image_id}`}
                    alt={t.item_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x400/000000/FFFFFF?text=No+Image";
                    }}
                  />
                </Link>
                <div>
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-widest block mb-2">ID / {t.id.slice(-6)}</span>
                  <Link to={`/catalog/${t.item_id}`} className="hover:underline hover:underline-offset-4">
                    <h2 className="text-xl font-serif tracking-tight mb-1">{t.item_name}</h2>
                  </Link>
                  <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                <div className="flex flex-col md:items-end gap-1">
                  <span className="text-2xl font-medium tracking-tighter">{formatRupiah(t.amount)}</span>
                  <span
                    className={`text-[10px] uppercase tracking-[0.3em] font-black ${
                      t.status === "completed" ? "text-emerald-500" : t.status === "pending" ? "text-amber-500" : "text-rose-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                {t.status === "completed" && (
                  <button
                    onClick={() => downloadReceipt(t)}
                    className={`text-[10px] uppercase tracking-[0.2em] font-black border py-2 px-4 transition-all duration-300 ${
                      isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700" : "border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:border-zinc-200"
                    }`}
                  >
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
