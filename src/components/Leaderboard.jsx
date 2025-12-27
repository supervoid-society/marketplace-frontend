import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function Leaderboard() {
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) {
      return `Rp ${(amount / 1000000000000).toFixed(1)} triliun`;
    } else if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)} miliar`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)} juta`;
    } else {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
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
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🏆 Leaderboard</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Top users by balance</p>
        </div>

        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`grid grid-cols-4 gap-4 font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              <div>Rank</div>
              <div>Username</div>
              <div>Role</div>
              <div className="text-right">Balance</div>
            </div>
          </div>

          <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {leaderboard.map((user, index) => (
              <div
                key={index}
                className={`px-6 py-4 transition-colors ${
                  isDark
                    ? index < 3
                      ? index === 0
                        ? 'bg-yellow-900/20 border-l-4 border-yellow-400 hover:bg-yellow-900/30'
                        : index === 1
                        ? 'bg-gray-700/50 border-l-4 border-gray-400 hover:bg-gray-700/70'
                        : 'bg-orange-900/20 border-l-4 border-orange-400 hover:bg-orange-900/30'
                      : 'hover:bg-gray-700/50'
                    : index < 3
                    ? index === 0
                      ? 'bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100'
                      : index === 1
                      ? 'bg-gray-50 border-l-4 border-gray-400 hover:bg-gray-100'
                      : 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-400 text-gray-900'
                        : index === 2
                        ? 'bg-orange-400 text-orange-900'
                        : isDark
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'seller'
                        ? isDark
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                          : 'bg-blue-100 text-blue-800'
                        : isDark
                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className={`text-right font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {formatBalance(user.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;