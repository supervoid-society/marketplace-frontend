import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function PublicCatalog() {
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [sellers, setSellers] = useState({});
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
      
      // Fetch seller info for each unique user_id
      const uniqueUserIds = [...new Set(data.map(item => item.user_id))];
      const sellerPromises = uniqueUserIds.map(async (userId) => {
        try {
          const sellerRes = await fetch(`${AUTH_URL}/sellers/public/${userId}`);
          if (sellerRes.ok) {
            const sellerData = await sellerRes.json();
            return { userId, seller: sellerData };
          }
        } catch (error) {
          console.error("Error fetching seller:", error);
        }
        return null;
      });
      
      const sellerResults = await Promise.all(sellerPromises);
      const sellersMap = {};
      
      sellerResults.forEach(result => {
        if (result) {
          sellersMap[result.userId] = result.seller;
        }
      });
      
      setSellers(sellersMap);
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
          {catalog.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Katalog Kosong</h2>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada produk yang tersedia</p>
              </div>
            </div>
          ) : (
            catalog.map((item) => (
              <div key={item.id} className={`group backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border w-80 ${isDark ? 'bg-gray-900/80 border-gray-800 text-white hover:bg-gray-800/80' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50/80'}`}>
                {item.image_id && (
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={`${CRUD_URL}/images/${item.image_id}`}
                      alt={item.name}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className={`absolute inset-0 ${isDark ? 'bg-black/20' : 'bg-black/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                )}
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-200 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h2>
                <p className={`mb-4 line-clamp-2 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                
                <div className="mb-4">
                  <p className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatRupiah(item.price)}</p>
                  
                  {/* Seller and Stock in one row */}
                  <div className="flex items-center justify-between gap-3">
                    {sellers[item.user_id] && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium flex-1 justify-center ${
                        isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                          {sellers[item.user_id].image_id ? (
                            <img
                              src={`${AUTH_URL}/users/profile-image/${item.user_id}`}
                              alt={sellers[item.user_id].store_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                e.target.style.display = 'none'; 
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center rounded-full overflow-hidden ${
                            sellers[item.user_id].image_id ? 'hidden' : ''
                          } ${isDark ? 'bg-blue-900/50 border border-blue-700' : 'bg-white border border-blue-200'}`}>
                            <svg className={`w-2 h-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <Link
                          to={`/seller/${item.user_id}`}
                          className="hover:underline truncate"
                        >
                          {sellers[item.user_id].store_name}
                        </Link>
                      </div>
                    )}
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium flex-1 justify-center ${
                      item.qty > 0 
                        ? (isDark ? 'bg-green-900/30 text-green-300 border border-green-700/50' : 'bg-green-50 text-green-700 border border-green-200')
                        : (isDark ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'bg-red-50 text-red-700 border border-red-200')
                    }`}>
                      {item.qty > 0 ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Stok: {item.qty}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Habis</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Link
                    to={`/catalog/${item.id}`}
                    className="flex-1 py-2 px-4 rounded-xl transition-all duration-200 text-center font-medium bg-black text-white hover:bg-gray-800"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicCatalog;