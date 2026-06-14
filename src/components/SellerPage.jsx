import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL, AUTH_URL } from "../config";

function SellerPage() {
  const { userId } = useParams();
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    fetchSellerCatalog();
  }, [userId]);

  const fetchSellerCatalog = async () => {
    try {
      const sellerRes = await fetch(`${AUTH_URL}/sellers/public/${userId}`);
      if (sellerRes.ok) setSeller(await sellerRes.json());

      const catalogRes = await fetch(`${CRUD_URL}/catalog-items`);
      const allCatalog = await catalogRes.json();
      const sellerCatalog = allCatalog.filter((item) => item.user_id === userId);
      setCatalog(sellerCatalog);

      let totalRating = 0;
      let reviewCount = 0;
      for (const item of sellerCatalog) {
        try {
          const reviewRes = await fetch(`${CRUD_URL}/reviews/${item.id}`);
          if (reviewRes.ok) {
            const reviews = await reviewRes.json();
            reviews.forEach((review) => {
              totalRating += review.rating;
              reviewCount++;
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
      setTotalReviews(reviewCount);
      setAverageRating(reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto">
      <Link
        to="/catalog"
        className={`inline-flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-200 ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collection
      </Link>

      {seller && (
        <div className="mb-32">
          <div className="flex flex-col md:flex-row gap-16 items-start md:items-end">
            <div className={`w-48 h-64 border ${isDark ? "border-zinc-800" : "border-zinc-100"} flex-shrink-0 grayscale`}>
              {seller.image_id ? (
                <img src={`${AUTH_URL}/users/profile-image/${userId}?role=seller`} alt={seller.store_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] uppercase tracking-widest opacity-20">Portrait</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-6xl md:text-9xl font-serif font-medium tracking-tighter leading-none mb-8">{seller.store_name}</h1>
              <div className="flex flex-wrap gap-8 items-center">
                <p className={`text-sm uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>EST. {new Date().getFullYear()}</p>
                <p className={`text-sm uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                  {averageRating} Rating / {totalReviews} Reviews
                </p>
                <p className={`text-sm uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Verified Merchant</p>
              </div>
            </div>
          </div>
          <div className={`h-px w-full my-12 ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}></div>
          <p className={`text-2xl font-serif italic max-w-3xl leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
            {seller.description || "A purveyor of excellence, dedicated to quality and refined commerce."}
          </p>
        </div>
      )}

      <div className="flex justify-between items-baseline mb-16">
        <h2 className="text-4xl font-serif italic">Inventory.</h2>
        <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Current Selection</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {catalog.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm italic opacity-40">No items currently available from this merchant.</p>
          </div>
        ) : (
          catalog.map((item) => (
            <div key={item.id} className="group flex flex-col h-full">
              <div className={`relative overflow-hidden mb-6 border ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                {item.image_id ? (
                  <img
                    src={`${CRUD_URL}/images/${item.image_id}`}
                    alt={item.name}
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className={`aspect-square flex items-center justify-center ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
                    <span className="text-[10px] uppercase tracking-widest opacity-20">No Visual</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-serif tracking-tight mb-1">{item.name}</h3>
              <p className="text-lg font-medium tracking-tighter mb-4">{formatRupiah(item.price)}</p>

              {item.description && <p className={`text-xs mb-6 line-clamp-3 ${isDark ? "text-zinc-500" : "text-zinc-400"} leading-relaxed`}>{item.description}</p>}

              <Link
                to={`/catalog/${item.id}`}
                className={`mt-auto py-4 px-6 rounded-none text-center font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
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

export default SellerPage;
