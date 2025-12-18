import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function PublicCatalog({ cart, addToCart, images, setImages }) {
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items`);
      const data = await res.json();
      setCatalog(data);
      for (const item of data) {
        if (item.image_id && !images[item.image_id]) {
          try {
            const imgRes = await fetch(`${CRUD_URL}/images/${item.image_id}`);
            const imgData = await imgRes.json();
            setImages(prev => ({ ...prev, [item.image_id]: imgData }));
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
    </div>
  );

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Katalog Produk
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Temukan berbagai produk berkualitas dengan harga terbaik
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 place-items-center">
          {catalog.map((item) => (
            <div key={item.id} className={`group backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border w-80 ${isDark ? 'bg-gray-900/80 border-gray-800 text-white hover:bg-gray-800/80' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50/80'}`}>
              {item.image_id && images[item.image_id] && (
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={`data:${images[item.image_id].content_type};base64,${images[item.image_id].data}`}
                    alt={item.name}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 ${isDark ? 'bg-black/20' : 'bg-black/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              )}
              <h2 className={`text-xl font-bold mb-2 group-hover:text-gray-400 transition-colors duration-200 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h2>
              <p className={`mb-4 line-clamp-2 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
              <div className="mb-4">
                <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatRupiah(item.price)}</p>
              </div>
              <button
                onClick={() => addToCart(item)}
                className={`w-full py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
              >
                Tambah ke Keranjang
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PublicCatalog;