import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import Swal from 'sweetalert2';

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function Cart() {
  const { isDark } = useTheme();
  const { cart, updateCartItem, clearCart } = useCart();
  const [stockCache, setStockCache] = useState({}); // Cache for stock data
  const [lastStockFetch, setLastStockFetch] = useState({}); // Track last fetch time

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = async (cartItemId, catalogItemId, quantity) => {
    if (quantity <= 0) {
      // Remove item from cart
      await updateCartItem(cartItemId, 0);
    } else {
      try {
        // Check cache first (cache for 30 seconds)
        const now = Date.now();
        let maxQty = stockCache[catalogItemId];
        
        if (!maxQty || !lastStockFetch[catalogItemId] || (now - lastStockFetch[catalogItemId]) > 30000) {
          // Fetch current stock
          const res = await fetch(`${CRUD_URL}/catalog-items/${catalogItemId}`);
          const itemData = await res.json();
          maxQty = itemData.qty || 0;
          setStockCache(prev => ({ ...prev, [catalogItemId]: maxQty }));
          setLastStockFetch(prev => ({ ...prev, [catalogItemId]: now }));
        }
        
        const newQuantity = Math.min(quantity, maxQty);
        
        await updateCartItem(cartItemId, newQuantity);
        
        if (quantity > maxQty) {
          Swal.fire({
            icon: 'warning',
            title: 'Stock Tidak Mencukupi',
            text: `Jumlah maksimal: ${maxQty}`,
          });
        }
      } catch (error) {
        console.error("Error fetching stock:", error);
        // Fallback to old logic if fetch fails
        await updateCartItem(cartItemId, quantity);
      }
    }
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Keranjang Belanja</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelola item belanja Anda</p>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Keranjang Kosong</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada item di keranjang Anda</p>
              <Link to="/catalog" className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg inline-block ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                Mulai Belanja
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {cart.map(item => (
                <div key={item.id} className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    {item.image_id && (
                      <div className="relative">
                        <img
                          src={`${CRUD_URL}/images/${item.image_id}`}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-md"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h2>
                      <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`flex items-center space-x-3 rounded-full p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button
                          onClick={() => updateQuantity(item.id, item.item_id, item.quantity - 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, item.item_id, parseInt(e.target.value) || 0)}
                          className={`w-12 rounded-lg text-center font-medium border-0 focus:ring-2 ${isDark ? 'bg-gray-700 text-white focus:ring-gray-500' : 'bg-gray-200 text-black focus:ring-gray-500'}`}
                          min="0"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.item_id, item.quantity + 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        >
                          +
                        </button>
                      </div>
                      <p className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Pembayaran</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatRupiah(total)}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleClearCart}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  >
                    Kosongkan Keranjang
                  </button>
                  <Link
                    to="/checkout"
                    className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-center ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;