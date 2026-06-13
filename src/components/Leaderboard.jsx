import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

function Leaderboard() {
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) return `Rp ${(amount / 1000000000000).toFixed(1)}T`;
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    return `Rp ${amount.toLocaleString("en-GB")}`;
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

  if (loading) return null;

  return (
    <div className="py-8 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="mb-20 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Elite.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>The market's most influential participants.</p>
      </div>

      <div className="border border-zinc-100 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900 space-y-px">
        <div className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-6 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
          <div className="col-span-2 text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Rank</div>
          <div className="col-span-6 md:col-span-5 text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Username / Role</div>
          <div className="col-span-4 md:col-span-5 text-right text-[8px] md:text-[10px] uppercase tracking-widest font-black opacity-40">Capitalization</div>
        </div>

        {leaderboard.length === 0 ? (
          <div className={`p-12 text-center ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <p className="text-sm italic opacity-40">No entries found in the ledger.</p>
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-8 items-center transition-colors group ${isDark ? "bg-zinc-950 hover:bg-zinc-900" : "bg-white hover:bg-zinc-50"}`}
            >
              <div className="col-span-2">
                <span className={`text-xl md:text-3xl font-serif ${index < 3 ? "italic font-bold" : "opacity-20"}`}>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="col-span-6 md:col-span-5">
                <h3 className="text-sm md:text-xl font-serif tracking-tight mb-1 truncate">{user.username}</h3>
                <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{user.role}</span>
              </div>
              <div className="col-span-4 md:col-span-5 text-right">
                <p className="text-sm md:text-2xl font-black tracking-tighter">{formatBalance(user.balance)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
