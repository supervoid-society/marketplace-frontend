import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

function Review({ itemId }) {
  const { isDark } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [buyerInfos, setBuyerInfos] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [editReview, setEditReview] = useState({ rating: 5, comment: "" });
  const [item, setItem] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchItem();
    checkUserAndPurchase();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/reviews/${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        const buyerIds = [...new Set(data.map((review) => review.buyer_id).filter((id) => id != null))];
        const buyerInfoPromises = buyerIds.map(async (buyerId) => {
          try {
            const buyerRes = await fetch(`${AUTH_URL}/users/${buyerId}`);
            if (buyerRes.ok) {
              const buyerData = await buyerRes.json();
              return { buyerId, username: buyerData.username };
            }
          } catch (error) {
            console.error(error);
          }
          return { buyerId, username: `Client ${buyerId}` };
        });
        const buyerInfosArray = await Promise.all(buyerInfoPromises);
        const buyerInfosMap = {};
        buyerInfosArray.forEach(({ buyerId, username }) => {
          buyerInfosMap[buyerId] = username;
        });
        setBuyerInfos(buyerInfosMap);
        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${AUTH_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (userRes.ok) {
            const userData = await userRes.json();
            setHasReviewed(data.some((review) => review.buyer_id === userData.id));
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItem = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${itemId}`);
      if (res.ok) setItem(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const checkUserAndPurchase = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRes = await fetch(`${AUTH_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        const transRes = await fetch(`${CRUD_URL}/transactions/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (transRes.ok) {
          const transData = await transRes.json();
          setHasPurchased(transData.some((trans) => trans.item_id === itemId && trans.status === "completed"));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingReview(true);
    try {
      const transRes = await fetch(`${CRUD_URL}/transactions/user`, { headers: { Authorization: `Bearer ${token}` } });
      const transData = await transRes.json();
      const transaction = transData.find((trans) => trans.item_id === itemId && trans.status === "completed");
      if (!transaction) return;
      const res = await fetch(`${CRUD_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transaction_id: transaction.id, rating: newReview.rating, comment: newReview.comment }),
      });
      if (res.ok) fetchReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReview(false);
      setShowAddReview(false);
      setNewReview({ rating: 5, comment: "" });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} className={`w-3 h-3 ${i < rating ? "fill-zinc-900 dark:fill-zinc-100" : "fill-zinc-200 dark:fill-zinc-800"}`} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-baseline mb-12">
        <h3 className="text-3xl font-serif italic">Testimonials.</h3>
        <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Verified Reviews</span>
      </div>

      {user && user.role === "buyer" && hasPurchased && !hasReviewed && !showAddReview && (
        <button
          onClick={() => setShowAddReview(true)}
          className={`mb-12 px-8 py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900" : "border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"}`}
        >
          Draft a Testimonial
        </button>
      )}

      {showAddReview && (
        <form onSubmit={handleAddReview} className={`mb-16 p-8 border ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-widest font-black mb-4">Rating</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: num })}
                  className={`transition-all duration-300 ${num <= newReview.rating ? "opacity-100 scale-110" : "opacity-20 hover:opacity-50"}`}
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-widest font-black mb-4">Commentary</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full py-4 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
              rows="3"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submittingReview}
              className={`px-10 py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => setShowAddReview(false)}
              className={`px-10 py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-zinc-200 dark:border-zinc-800`}
            >
              Dismiss
            </button>
          </div>
        </form>
      )}

      <div className="space-y-16">
        {reviews.length === 0 ? (
          <p className={`text-sm italic ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>No reviews have been published for this item.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="relative">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs uppercase tracking-widest font-black">{buyerInfos[review.buyer_id] || `Client ${review.buyer_id}`}</span>
                {renderStars(review.rating)}
              </div>
              <p className={`text-lg leading-relaxed font-serif ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{review.comment}</p>

              {review.reply && (
                <div className={`mt-8 ml-8 p-8 border-l-2 ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                  <span className={`block text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Seller Correspondence</span>
                  <p className={`text-sm leading-relaxed italic ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{review.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Review;
