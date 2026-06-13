import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import CatalogCRUD from "./CatalogCRUD";
import UserCRUD from "./UserCRUD";
import TransactionStats from "./TransactionStats";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";

function Dashboard({ token, onLogout }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("catalog");
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    fetchTransactionStats();
  }, []);

  const fetchTransactionStats = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const total = data.length;
      const completed = data.filter((t) => t.status === "completed").length;
      const pending = data.filter((t) => t.status === "pending").length;
      const revenue = data.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
      setStats({ total, completed, pending, revenue });
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Registry.</h1>
          <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Administrative control and market oversight.</p>
        </div>
        <button
          onClick={onLogout}
          className={`px-8 py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
        >
          Terminal / Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 mb-16">
        {[
          { label: "Total Transactions", value: stats.total, color: "" },
          { label: "Completed", value: stats.completed, color: "text-emerald-500" },
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Revenue", value: formatRupiah(stats.revenue), color: "text-indigo-500" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 md:p-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <h3 className={`text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{stat.label}</h3>
            <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <nav className={`flex flex-col md:flex-row gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800`}>
          {["catalog", "users", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-4 md:px-8 md:py-6 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === tab
                  ? isDark
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-900 text-white"
                  : `${isDark ? "bg-zinc-950 text-zinc-600 hover:text-zinc-300" : "bg-white text-zinc-400 hover:text-zinc-900"}`
              }`}
            >
              Manage {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className={`p-6 md:p-12 border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
        {activeTab === "catalog" && <CatalogCRUD token={token} userRole="admin" />}
        {activeTab === "users" && <UserCRUD token={token} />}
        {activeTab === "transactions" && <TransactionStats token={token} />}
      </div>
    </div>
  );
}

export default Dashboard;
