import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL } from "../config";

function TransactionStats({ token }) {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data);
      const total = data.length;
      const completed = data.filter((t) => t.status === "completed").length;
      const pending = data.filter((t) => t.status === "pending").length;
      const revenue = data.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
      setStats({ total, completed, pending, revenue });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (loading) return null;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-12">
        <h2 className="text-4xl font-serif italic">Ledger Overview</h2>
        <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Market Statistics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 mb-16">
        {[
          { label: "Aggregate Count", value: stats.total },
          { label: "Successful", value: stats.completed },
          { label: "Processing", value: stats.pending },
          { label: "Gross Revenue", value: formatRupiah(stats.revenue) },
        ].map((s, i) => (
          <div key={i} className={`p-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <h3 className={`text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{s.label}</h3>
            <p className="text-2xl font-black tracking-tighter">{s.value}</p>
          </div>
        ))}
      </div>

      <div className={`p-6 md:p-12 border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
        <h3 className="text-xl font-serif italic mb-8">Transaction Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">ID</th>
                <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Entity</th>
                <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Amount</th>
                <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Status</th>
                <th className="text-right py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {transactions.map((t) => (
                <tr key={t.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-6 px-2 text-xs font-medium">#{t.id.slice(0, 8)}</td>
                  <td className="py-6 px-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold">B: {t.buyer_id.slice(0, 6)}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold">S: {t.seller_id.slice(0, 6)}</p>
                  </td>
                  <td className="py-6 px-2 text-sm font-black tracking-tight">{formatRupiah(t.amount)}</td>
                  <td className="py-6 px-2">
                    <span className={`text-[10px] uppercase tracking-widest font-black ${t.status === "completed" ? "text-emerald-500" : "text-amber-500"}`}>{t.status}</span>
                  </td>
                  <td className="py-6 px-2 text-right text-[10px] font-bold opacity-40">{new Date(t.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionStats;
