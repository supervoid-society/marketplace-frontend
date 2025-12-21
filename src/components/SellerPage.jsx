import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function SellerPage() {
  const { userId } = useParams();
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellerImage, setSellerImage] = useState(null);

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchSellerCatalog();
  }, [userId]);

  const fetchSellerCatalog = async () => {
    try {
      // Fetch seller info
      const sellerRes = await fetch(`${AUTH_URL}/sellers/public/${userId}`);
      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setSeller(sellerData);
        
        // Fetch seller image if exists
        if (sellerData.image_id) {
          try {
            const imgRes = await fetch(`${AUTH_URL}/users/profile-image/${userId}`);
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

      // Fetch catalog items for this seller
      const catalogRes = await fetch(`${CRUD_URL}/catalog-items`);
      const allCatalog = await catalogRes.json();
      const sellerCatalog = allCatalog.filter(item => item.user_id === parseInt(userId));
      setCatalog(sellerCatalog);
    } catch (error) {
      console.error("Error fetching seller catalog:", error);
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
    <div className={`min-h-screen pt-24 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <Link to="/catalog" className={`inline-block mb-6 px-4 py-2 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          ← Kembali ke Katalog
        </Link>
        
        {seller && (
          <div className={`mb-8 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden ${
                isDark ? 'bg-blue-900/50 border-2 border-blue-700' : 'bg-white border-2 border-blue-200'
              }`}>
                {sellerImage ? (
                  <img
                    src={`data:${sellerImage.content_type};base64,${sellerImage.data}`}
                    alt={seller.store_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
                </div>
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{seller.store_name}</h1>
                  {seller.description && (
                    <p className={`text-lg mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{seller.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    {seller.contact_phone && (
                      <div className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{seller.contact_phone}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-green-900/30 text-green-300 border border-green-700/50' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Toko Terpercaya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Produk Toko
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Temukan berbagai produk berkualitas dari {seller?.store_name}
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
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada produk yang tersedia di toko ini</p>
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
                  <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatRupiah(item.price)}</p>
                  <div className="flex items-center gap-2">
                    {item.qty > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>In Stock ({item.qty})</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Out of Stock</span>
                      </>
                    )}
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

export default SellerPage;