import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTransactions(data);

      // Calculate stats
      const total = data.length;
      const completed = data.filter(t => t.status === 'completed').length;
      const pending = data.filter(t => t.status === 'pending').length;
      const revenue = data.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

      setStats({ total, completed, pending, revenue });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Transaction Statistics</h1>
          <p className={`text-gray-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overview of all marketplace transactions</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">{formatRupiah(stats.revenue)}</p>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-xl font-semibold mb-6">Transaction Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <th className="text-left p-3 font-medium">Transaction ID</th>
                  <th className="text-left p-3 font-medium">Buyer ID</th>
                  <th className="text-left p-3 font-medium">Seller ID</th>
                  <th className="text-left p-3 font-medium">Item ID</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{t.id}</td>
                    <td className="p-3">{t.buyer_id}</td>
                    <td className="p-3">{t.seller_id}</td>
                    <td className="p-3">{t.item_id}</td>
                    <td className="p-3 font-medium">{formatRupiah(t.amount)}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        t.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        t.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionStats;