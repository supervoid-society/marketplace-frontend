import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL, AUTH_URL } from "../config";

function TransactionStats({ token }) {
  const { isDark } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, revenue: 0, totalFee: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [crudRes, authRes, usersRes] = await Promise.all([
        fetch(`${CRUD_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${AUTH_URL}/wallets/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${AUTH_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const shoppingData = await crudRes.json();
      let walletTransfers = [];
      let walletRequests = [];
      let userMap = {};

      if (authRes.ok) {
        const authData = await authRes.json();
        walletTransfers = authData.transfers || [];
        walletRequests = authData.requests || [];
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        usersData.forEach((u) => {
          userMap[u.id] = u;
        });
      }

      // Combine all transactions
      const combined = [
        ...shoppingData.map((t) => {
          const buyer = userMap[t.buyer_id];
          const seller = userMap[t.seller_id];
          return {
            id: t.id,
            type: "Belanja",
            sender: buyer ? buyer.display_name || buyer.username : `Buyer (${t.buyer_id.slice(0, 6)})`,
            receiver: seller ? seller.display_name || seller.username : `Seller (${t.seller_id.slice(0, 6)})`,
            amount: t.amount,
            platformFee: t.platform_fee || 0,
            discount: t.discount_amount || 0,
            status: t.status,
            created_at: t.created_at,
          };
        }),
        ...walletTransfers.map((wt) => {
          const sender = userMap[wt.sender_id];
          const receiver = userMap[wt.receiver_id];
          let senderLabel = sender ? sender.display_name || sender.username : wt.sender_name;
          let receiverLabel = receiver ? receiver.display_name || receiver.username : wt.receiver_name;

          // If it's an internal transfer (sender_id === receiver_id), label it clearly
          if (wt.sender_id === wt.receiver_id) {
            senderLabel = `${senderLabel} (Member)`;
            receiverLabel = `${receiverLabel} (Merchant)`;
          }

          return {
            id: wt.id,
            type: "Transfer Wallet",
            sender: senderLabel,
            receiver: receiverLabel,
            amount: wt.amount,
            platformFee: 0,
            discount: 0,
            status: "completed",
            created_at: wt.created_at,
          };
        }),
        ...walletRequests.map((wr) => {
          const requester = userMap[wr.requester_id];
          const target = userMap[wr.target_id];
          return {
            id: wr.id,
            type: "Permintaan Wallet",
            sender: target ? target.display_name || target.username : wr.target_name,
            receiver: requester ? requester.display_name || requester.username : wr.requester_name,
            amount: wr.amount,
            platformFee: 0,
            discount: 0,
            status: wr.status,
            created_at: wr.created_at,
          };
        }),
      ];

      // Sort by date descending
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(combined);

      // Stats calculation (based on completed/accepted transactions)
      const completedTx = combined.filter((t) => t.status === "completed" || t.status === "accepted");
      const revenue = completedTx.reduce((sum, t) => sum + t.amount, 0);
      const totalFee = completedTx.reduce((sum, t) => sum + t.platformFee, 0);
      const total = combined.length;

      setStats({ total, revenue, totalFee });
    } catch (error) {
      console.error("Error fetching transactions stats:", error);
    } finally {
      setLoading(false);
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
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Monitor transaction volume, platform earnings, and transaction counts.</p>
        </div>
      </div>

      <div className="space-y-16">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          {[
            { label: "Total Volume Transaksi", value: formatRupiahCompact(stats.revenue), color: "text-indigo-500" },
            { label: "Total Fee Diterima", value: formatRupiahCompact(stats.totalFee), color: "text-emerald-500" },
            { label: "Jumlah Transaksi", value: stats.total, color: "" },
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
            <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>All Platform Activity</span>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm opacity-40 font-serif italic">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">ID</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Type</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Sender</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Receiver</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Amount</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Platform Fee</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Discount</th>
                    <th className="text-left py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Status</th>
                    <th className="text-right py-4 text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {transactions.map((t) => (
                    <tr key={`${t.type}-${t.id}`} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-6 px-2 text-xs font-medium">#{t.id.slice(0, 8)}</td>
                      <td className="py-6 px-2">
                        <span
                          className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 border ${
                            t.type === "Belanja"
                              ? "border-blue-500/20 text-blue-500 bg-blue-500/5"
                              : t.type === "Transfer Wallet"
                                ? "border-indigo-500/20 text-indigo-500 bg-indigo-500/5"
                                : "border-amber-500/20 text-amber-500 bg-amber-500/5"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-6 px-2 text-xs font-semibold">{t.sender}</td>
                      <td className="py-6 px-2 text-xs font-semibold">{t.receiver}</td>
                      <td className="py-6 px-2 text-sm font-black tracking-tight">{formatRupiah(t.amount)}</td>
                      <td className="py-6 px-2 text-sm font-semibold tracking-tight text-emerald-500">{t.platformFee > 0 ? `+${formatRupiah(t.platformFee)}` : "-"}</td>
                      <td className="py-6 px-2 text-sm font-semibold tracking-tight text-rose-500">{t.discount > 0 ? `-${formatRupiah(t.discount)}` : "-"}</td>
                      <td className="py-6 px-2">
                        <span
                          className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 border ${
                            t.status === "completed" || t.status === "accepted"
                              ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                              : t.status === "failed" || t.status === "rejected"
                                ? "border-rose-500/20 text-rose-500 bg-rose-500/5"
                                : "border-amber-500/20 text-amber-500 bg-amber-500/5"
                          }`}
                        >
                          {t.status}
                        </span>
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
    </div>
  );
}

export default TransactionStats;
