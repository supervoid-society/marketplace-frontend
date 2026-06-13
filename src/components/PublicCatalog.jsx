import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL, AUTH_URL } from "../config";

function PublicCatalog() {
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
      const uniqueUserIds = [...new Set(data.map((item) => item.user_id))];
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

      sellerResults.forEach((result) => {
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? "border-zinc-100" : "border-zinc-900"}`}></div>
      </div>
    );

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
            The <span className="italic">Catalog.</span>
          </h1>
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>A refined selection of digital and physical excellence.</p>
        </div>
        <p className={`text-xs uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Curated / Verified / Secure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {catalog.length === 0 ? (
          <div className="col-span-full text-center py-32 border border-dashed border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-serif italic mb-2">The collection is currently empty.</h2>
            <p className={`text-xs uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Check back soon for new arrivals.</p>
          </div>
        ) : (
          catalog.map((item) => (
            <div key={item.id} className="group flex flex-col">
              {item.image_id ? (
                <div className={`relative overflow-hidden mb-6 border ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                  <img
                    src={`${CRUD_URL}/images/${item.image_id}`}
                    alt={item.name}
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className={`aspect-square mb-6 border flex items-center justify-center ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
                  <span className="text-[10px] uppercase tracking-widest opacity-20">No Visual</span>
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-serif tracking-tight leading-tight flex-1">{item.name}</h2>
                <p className="text-xl font-medium tracking-tighter">{formatRupiah(item.price)}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                {sellers[item.user_id] && (
                  <Link
                    to={`/seller/${item.user_id}`}
                    className={`text-[10px] uppercase tracking-widest font-bold border-b transition-colors ${isDark ? "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-600" : "text-zinc-400 border-zinc-100 hover:text-zinc-900 hover:border-zinc-900"}`}
                  >
                    {sellers[item.user_id].store_name}
                  </Link>
                )}
                <span className={`text-[10px] uppercase tracking-widest font-bold ${item.qty > 0 ? (isDark ? "text-emerald-700" : "text-emerald-500") : "text-rose-500"}`}>
                  {item.qty > 0 ? `Stock / ${item.qty}` : "Out of Stock"}
                </span>
              </div>

              <Link
                to={`/catalog/${item.id}`}
                className={`py-4 px-6 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
              >
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PublicCatalog;
