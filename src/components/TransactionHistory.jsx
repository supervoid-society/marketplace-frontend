import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

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
          'Authorization': `Bearer ${token}`,
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
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Histori Transaksi</h1>

        {transactions.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-lg">Belum ada transaksi</p>
          </div>
        ) : (
          <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th className="text-left p-4">ID Transaksi</th>
                    <th className="text-left p-4">Item</th>
                    <th className="text-left p-4">Jumlah</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="p-4">#{t.id}</td>
                      <td className="p-4">{t.item_id}</td>
                      <td className="p-4">{t.quantity}</td>
                      <td className="p-4 font-semibold">{formatRupiah(t.amount)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          t.status === 'completed' ? 'bg-green-100 text-green-800' :
                          t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t.status === 'completed' ? 'Selesai' :
                           t.status === 'pending' ? 'Pending' : 'Gagal'}
                        </span>
                      </td>
                      <td className="p-4">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;