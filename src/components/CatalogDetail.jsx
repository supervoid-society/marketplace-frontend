import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function CatalogDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerImage, setSellerImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`);
      const data = await res.json();
      setItem(data);
      
      // Fetch seller info
      try {
        const sellerRes = await fetch(`${AUTH_URL}/sellers/public/${data.user_id}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSeller(sellerData);
          
          // Fetch seller image if exists
          if (sellerData.image_id) {
            try {
              const imgRes = await fetch(`${AUTH_URL}/users/profile-image/${data.user_id}`);
              if (imgRes.ok) {
                const imgData = await imgRes.json();
                setSellerImage(imgData);
              } else {
                console.error("Failed to fetch seller image:", imgRes.status);
              }
            } catch (error) {
              console.error("Error fetching seller image:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching seller:", error);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(item, parseInt(quantity));
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
    </div>
  );

  if (!item) return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Item tidak ditemukan</h1>
        <Link to="/catalog" className="text-blue-500 hover:underline">Kembali ke Katalog</Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pt-24 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <Link to="/catalog" className={`inline-block mb-6 px-4 py-2 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          ← Kembali ke Katalog
        </Link>
        <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${isDark ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gambar di sebelah kiri */}
            <div className="flex justify-center">
              {item.image_id ? (
                <img
                  src={`${CRUD_URL}/images/${item.image_id}`}
                  alt={item.name}
                  className="w-full max-w-md h-auto object-cover rounded-xl shadow-lg"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full max-w-md h-64 rounded-xl shadow-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} style={{ display: item.image_id ? 'none' : 'flex' }}>
                <span className={`text-gray-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tidak ada gambar</span>
              </div>
            </div>
            {/* Detail di sebelah kanan */}
            <div className="flex flex-col justify-center">
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h1>
              <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
              
              <p className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatRupiah(item.price)}</p>
              
              {/* Seller and Stock in one row */}
              <div className="flex items-center gap-4 mb-6">
                {seller && (
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border flex-[2] ${
                    isDark ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                      isDark ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      {sellerImage ? (
                        <img
                          src={`data:${sellerImage.content_type};base64,${sellerImage.data}`}
                          alt={seller.store_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <Link
                      to={`/seller/${item.user_id}`}
                      className={`font-semibold transition-colors duration-200 ${
                        isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                      }`}
                    >
                      {seller.store_name}
                    </Link>
                  </div>
                )}
                
                <div className={`flex items-center gap-2 px-4 py-4 rounded-lg border flex-[2] justify-center ${
                  item.qty > 0 
                    ? (isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200')
                    : (isDark ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200')
                }`}>
                  {item.qty > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Stok: {item.qty}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Stok Habis
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Quantity selector */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Jumlah:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || item.qty === 0}
                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                      quantity <= 1 || item.qty === 0
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.qty || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(item.qty || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                    disabled={item.qty === 0}
                    className={`w-20 px-3 py-1 text-center rounded-lg border transition-colors duration-200 ${
                      item.qty === 0
                        ? 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'
                        : isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(item.qty || 1, quantity + 1))}
                    disabled={quantity >= (item.qty || 1) || item.qty === 0}
                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                      quantity >= (item.qty || 1) || item.qty === 0
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Tombol Tambah ke Keranjang */}
              <button
                onClick={handleAddToCart}
                disabled={item.qty === 0}
                className={`w-full py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-lg ${
                  item.qty > 0
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {item.qty > 0 ? `Tambah ke Keranjang (${quantity})` : 'Stok Habis'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogDetail;