import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";

function Leaderboard() {
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) return `Rp ${(amount / 1000000000000).toFixed(1)}T`;
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (loading) return null;

  return (
    <div className="py-8 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="mb-20 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Elite.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>The market's most influential participants.</p>
      </div>

      <div className="border border-zinc-100 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900 space-y-px">
        <div className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-6 items-center ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
          <div className="col-span-2 text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Rank</div>
          <div className="col-span-6 md:col-span-5 text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Participant</div>
          <div className="col-span-3 md:col-span-4 text-right text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Capitalization</div>
          <div className="col-span-1 text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40"></div>
        </div>

        {leaderboard.length === 0 ? (
          <div className={`p-12 text-center ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <p className="text-sm italic opacity-40">No entries found in the ledger.</p>
          </div>
        ) : (
          leaderboard.map((user, index) => {
            const isExpanded = expandedUserId === user.user_id;
            return (
              <div key={user.user_id} className={`border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                <div
                  onClick={() => toggleExpand(user.user_id)}
                  className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-8 items-center transition-colors group cursor-pointer ${
                    isExpanded ? (isDark ? "bg-zinc-900" : "bg-zinc-50") : isDark ? "bg-zinc-950 hover:bg-zinc-900/40" : "bg-white hover:bg-zinc-50/40"
                  }`}
                >
                  <div className="col-span-2">
                    <span className={`text-xl md:text-3xl font-serif ${index < 3 ? "italic font-bold" : "opacity-20"}`}>{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 md:gap-4">
                    <img
                      src={`${AUTH_URL}/users/profile-image/${user.user_id}?v=${Date.now()}`}
                      alt={user.display_name || user.username || "Participant"}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        const fallbackName = user.display_name && user.display_name !== "undefined" ? user.display_name : user.username || "User";
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`;
                      }}
                    />
                    <div>
                      <h3 className="text-sm md:text-xl font-serif tracking-tight mb-1 truncate">
                        {user.display_name && user.display_name !== "undefined" ? user.display_name : user.username || "Anonymous Participant"}
                      </h3>
                      <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                        {user.status || "member"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-4 text-right">
                    <p className="text-sm md:text-2xl font-black tracking-tighter font-mono">{formatBalance(user.balance)}</p>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 opacity-40 group-hover:opacity-100 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Capital Distribution Panel */}
                {isExpanded && (
                  <div
                    className={`px-6 py-6 md:px-12 md:py-8 border-t border-dashed transition-all duration-300 ${
                      isDark ? "bg-zinc-900/30 border-zinc-900 text-zinc-400" : "bg-zinc-50/30 border-zinc-200 text-zinc-650"
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                      <div className="space-y-1">
                        <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black opacity-45 block">Member Capital (Buyer)</span>
                        <p className="text-sm md:text-xl font-bold font-mono tracking-tight text-blue-500 dark:text-blue-400">{formatBalance(user.buyer_balance)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black opacity-45 block">Merchant Capital (Seller)</span>
                        {user.status === "member" && user.seller_balance === 0 ? (
                          <p className="text-xs italic opacity-40">Not Open / Belum Buka</p>
                        ) : (
                          <p className="text-sm md:text-xl font-bold font-mono tracking-tight text-amber-500 dark:text-amber-400">{formatBalance(user.seller_balance)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
