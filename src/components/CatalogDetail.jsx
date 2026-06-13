import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CRUD_URL, AUTH_URL } from "../config";
import Review from "./Review";

function CatalogDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const isBuyer = payload?.role === "buyer";

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
      console.error("Error adding to cart:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? "border-zinc-100" : "border-zinc-900"}`}></div>
      </div>
    );

  if (!item)
    return (
      <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? "bg-zinc-950 text-zinc-50" : "bg-white text-zinc-900"}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-serif italic mb-4">Item not found</h1>
          <Link to="/catalog" className="text-zinc-500 hover:underline text-xs uppercase tracking-widest font-bold">
            Back to Catalog
          </Link>
        </div>
      </div>
    );

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <Link
        to="/catalog"
        className={`inline-flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-200 ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Gambar di sebelah kiri - Spans 7 cols */}
        <div className="lg:col-span-7">
          {item.image_id ? (
            <div className={`border ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
              <img src={`${CRUD_URL}/images/${item.image_id}`} alt={item.name} className="w-full aspect-square object-cover" />
            </div>
          ) : (
            <div className={`aspect-square flex items-center justify-center border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
              <span className="text-[10px] uppercase tracking-widest opacity-20">No Visual</span>
            </div>
          )}
        </div>

        {/* Detail di sebelah kanan - Spans 5 cols */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[0.9] mb-6 tracking-tighter">{item.name}</h1>

          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-4xl font-medium tracking-tighter">{formatRupiah(item.price)}</p>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Excl. Taxes</span>
          </div>

          <div className={`h-px w-full mb-8 ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}></div>

          <p className={`text-xl md:text-2xl leading-relaxed mb-16 font-medium tracking-tight ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{item.description}</p>

          {seller && (
            <div className="mb-12">
              <span className={`block text-[10px] uppercase tracking-widest font-bold mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Sourced From</span>
              <Link to={`/seller/${item.user_id}`} className="text-2xl font-serif italic hover:underline">
                {seller.store_name}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Availability</span>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${item.qty > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {item.qty > 0 ? `In Stock / ${item.qty} units` : "Out of Stock"}
              </span>
            </div>

            {isBuyer && (
              <>
                {/* Quantity selector */}
                <div className="flex items-center justify-between py-4 border-y border-zinc-100 dark:border-zinc-900">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Quantity</span>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || item.qty === 0}
                      className="opacity-50 hover:opacity-100 disabled:opacity-10 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xl font-medium min-w-[2ch] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(item.qty || 1, quantity + 1))}
                      disabled={quantity >= (item.qty || 1) || item.qty === 0}
                      className="opacity-50 hover:opacity-100 disabled:opacity-10 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={item.qty === 0}
                  className={`w-full py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${
                    item.qty > 0
                      ? isDark
                        ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                        : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                      : "bg-transparent border-zinc-200 text-zinc-300 cursor-not-allowed"
                  }`}
                >
                  {item.qty > 0 ? "Purchase / Add to Bag" : "Currently Unavailable"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`mt-20 pt-20 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
        <Review itemId={id} />
      </div>
    </div>
  );
}

export default CatalogDetail;
