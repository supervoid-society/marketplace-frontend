import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL, AUTH_URL } from "../config";

function TransactionStats({ token }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("shopping");

  // Shopping transaction states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });

  // Wallet states
  const [walletStats, setWalletStats] = useState({
    balances: { totalBuyersBalance: 0, totalSellersBalance: 0, totalBalance: 0 },
    transfers: [],
    requests: [],
  });
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchWalletStats();
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

  const fetchWalletStats = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/wallets/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletStats(data);
      }
    } catch (error) {
      console.error("Error fetching wallet stats:", error);
    } finally {
      setWalletLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const formatRupiahCompact = (angka) => {
    if (angka >= 1_000_000_000_000) {
      return "Rp " + (angka / 1_000_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " T";
    } else if (angka >= 1_000_000_000) {
      return "Rp " + (angka / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    } else if (angka >= 1_000_000) {
      return "Rp " + (angka / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " jt";
    }
    return formatRupiah(angka);
  };

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
            Platform <span className="italic">Stats.</span>
          </h1>
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Monitor shopping transactions, ledger volumes, and wallet activities.</p>
        </div>
      </div>

      <div className="mb-12">
        <nav className="flex flex-col md:flex-row gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("shopping")}
            className={`flex-1 px-4 py-4 md:px-8 md:py-6 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === "shopping"
                ? isDark
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-900 text-white"
                : `${isDark ? "bg-zinc-950 text-zinc-600 hover:text-zinc-300" : "bg-white text-zinc-400 hover:text-zinc-900"}`
            }`}
          >
            Transaksi Belanja
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 px-4 py-4 md:px-8 md:py-6 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === "wallet"
                ? isDark
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-900 text-white"
                : `${isDark ? "bg-zinc-950 text-zinc-600 hover:text-zinc-300" : "bg-white text-zinc-400 hover:text-zinc-900"}`
            }`}
          >
            Wallet
          </button>
        </nav>
      </div>

      {activeTab === "shopping" ? (
        <div className="space-y-16">
          {/* Shopping Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            {[
              { label: "Aggregate Count", value: stats.total, color: "" },
              { label: "Successful", value: stats.completed, color: "text-emerald-500" },
              { label: "Processing", value: stats.pending, color: "text-amber-500" },
              { label: "Gross Revenue", value: formatRupiahCompact(stats.revenue), color: "text-indigo-500" },
            ].map((s, i) => (
              <div key={i} className={`p-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                <h3 className={`text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{s.label}</h3>
                <p className={`text-2xl sm:text-3xl font-black tracking-tighter break-all ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Transactions Log Section */}
          <div className={`p-6 md:p-12 border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
            <div className="flex justify-between items-baseline mb-8">
              <h3 className="text-xl font-serif italic">Transaction Logs</h3>
              <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Shopping History</span>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm opacity-40 font-serif italic">No shopping transactions recorded yet.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Wallet Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            {[
              { label: "Total Buyer Wallet", value: formatRupiahCompact(walletStats.balances.totalBuyersBalance), color: "text-blue-500" },
              { label: "Total Seller Wallet", value: formatRupiahCompact(walletStats.balances.totalSellersBalance), color: "text-amber-500" },
              { label: "Aggregate Balance", value: formatRupiahCompact(walletStats.balances.totalBalance), color: "text-indigo-500" },
              { label: "Transfer Logs", value: walletStats.transfers.length, color: "" },
            ].map((s, i) => (
              <div key={i} className={`p-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                <h3 className={`text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{s.label}</h3>
                <p className={`text-2xl sm:text-3xl font-black tracking-tighter break-all ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wallet Transfers Table */}
            <div className={`p-6 md:p-8 border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
              <div className="flex justify-between items-baseline mb-8">
                <h3 className="text-xl font-serif italic">Wallet Transfers</h3>
                <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Transfer Logs</span>
              </div>
              {walletStats.transfers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm opacity-40 font-serif italic">No wallet transfers recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Sender</th>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Receiver</th>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Amount</th>
                        <th className="text-right py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {walletStats.transfers.map((wt) => (
                        <tr key={wt.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-4 text-xs font-bold">{wt.sender_name}</td>
                          <td className="py-4 text-xs font-bold">{wt.receiver_name}</td>
                          <td className="py-4 text-sm font-black tracking-tight">{formatRupiah(wt.amount)}</td>
                          <td className="py-4 text-right text-[10px] font-bold opacity-40">{new Date(wt.created_at).toLocaleDateString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Wallet Requests Table */}
            <div className={`p-6 md:p-8 border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
              <div className="flex justify-between items-baseline mb-8">
                <h3 className="text-xl font-serif italic">Wallet Requests</h3>
                <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Request Logs</span>
              </div>
              {walletStats.requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm opacity-40 font-serif italic">No wallet requests recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Requester</th>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Target</th>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Amount</th>
                        <th className="text-left py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Status</th>
                        <th className="text-right py-4 text-[9px] uppercase tracking-widest font-black opacity-40">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {walletStats.requests.map((wr) => (
                        <tr key={wr.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-4 text-xs font-bold">{wr.requester_name}</td>
                          <td className="py-4 text-xs font-bold">{wr.target_name}</td>
                          <td className="py-4 text-sm font-black tracking-tight">{formatRupiah(wr.amount)}</td>
                          <td className="py-4">
                            <span
                              className={`text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 border ${
                                wr.status === "accepted"
                                  ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                                  : wr.status === "rejected"
                                    ? "border-rose-500/20 text-rose-500 bg-rose-500/5"
                                    : "border-amber-500/20 text-amber-500 bg-amber-500/5"
                              }`}
                            >
                              {wr.status}
                            </span>
                          </td>
                          <td className="py-4 text-right text-[10px] font-bold opacity-40">{new Date(wr.created_at).toLocaleDateString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionStats;
