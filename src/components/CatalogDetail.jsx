import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function CatalogDetail({ cart, addToCart, images, setImages }) {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [item, setItem] = useState(null);
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
      if (data.image_id && !images[data.image_id]) {
        try {
          const imgRes = await fetch(`${CRUD_URL}/images/${data.image_id}`);
          const imgData = await imgRes.json();
          setImages(prev => ({ ...prev, [data.image_id]: imgData }));
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const itemWithQuantity = { ...item, quantity: parseInt(quantity) };
    addToCart(itemWithQuantity);
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
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <Link to="/catalog" className={`inline-block mb-6 px-4 py-2 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          ← Kembali ke Katalog
        </Link>
        <div className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${isDark ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gambar di sebelah kiri */}
            <div className="flex justify-center">
              {item.image_id && images[item.image_id] ? (
                <img
                  src={`data:${images[item.image_id].content_type};base64,${images[item.image_id].data}`}
                  alt={item.name}
                  className="w-full max-w-md h-auto object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className={`w-full max-w-md h-64 rounded-xl shadow-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <span className={`text-gray-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tidak ada gambar</span>
                </div>
              )}
            </div>
            {/* Detail di sebelah kanan */}
            <div className="flex flex-col justify-center">
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h1>
              <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
              <p className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatRupiah(item.price)}</p>
              {/* Quantity selector */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Jumlah:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-20 px-3 py-1 text-center rounded-lg border transition-colors duration-200 ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Tombol Tambah ke Keranjang */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-lg bg-black text-white hover:bg-gray-800`}
              >
                Tambah ke Keranjang ({quantity})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogDetail;