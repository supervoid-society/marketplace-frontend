import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";

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
              <div className="flex gap-8">
                <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mt-1">ID / {t.id.slice(-6)}</span>
                <div>
                  <h2 className="text-xl font-serif tracking-tight mb-1">Acquisition #{t.id.slice(0, 8)}</h2>
                  <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <span className="text-2xl font-medium tracking-tighter">{formatRupiah(t.amount)}</span>
                <span
                  className={`text-[10px] uppercase tracking-[0.3em] font-black ${
                    t.status === "completed" ? "text-emerald-500" : t.status === "pending" ? "text-amber-500" : "text-rose-500"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
