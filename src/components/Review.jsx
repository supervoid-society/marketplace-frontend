import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL, AUTH_URL } from "../config";

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
  const [seller, setSeller] = useState(null);
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
              return {
                buyerId,
                name: buyerData.display_name || buyerData.username || `Client ${buyerId.slice(0, 4)}`,
              };
            }
          } catch (error) {
            console.error(error);
          }
          return { buyerId, name: `Client ${buyerId.slice(0, 4)}` };
        });
        const buyerInfosArray = await Promise.all(buyerInfoPromises);
        const buyerInfosMap = {};
        buyerInfosArray.forEach(({ buyerId, name }) => {
          buyerInfosMap[buyerId] = name;
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
      if (res.ok) {
        const itemData = await res.json();
        setItem(itemData);
        try {
          const sellerRes = await fetch(`${AUTH_URL}/sellers/public/${itemData.user_id}`);
          if (sellerRes.ok) {
            setSeller(await sellerRes.json());
          }
        } catch (err) {
          console.error("Error fetching seller in Review:", err);
        }
      }
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

  const handleReplySubmit = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingReply(true);

    // Optimistic update
    const previousReviews = [...reviews];
    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r)));

    try {
      const res = await fetch(`${CRUD_URL}/reviews/${reviewId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit reply");
      }

      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error(error);
      // Rollback on error
      setReviews(previousReviews);
      alert("Failed to save reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (e, reviewId) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingEdit(true);

    // Optimistic update
    const previousReviews = [...reviews];
    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, rating: editReview.rating, comment: editReview.comment } : r)));

    try {
      const res = await fetch(`${CRUD_URL}/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editReview.rating, comment: editReview.comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to update review");
      }

      setEditingReview(null);
    } catch (error) {
      console.error(error);
      // Rollback on error
      setReviews(previousReviews);
      alert("Failed to update review. Please try again.");
    } finally {
      setSubmittingEdit(false);
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
                <div className="flex items-center gap-3">
                  <img
                    src={`${AUTH_URL}/users/profile-image/${review.buyer_id}?role=buyer`}
                    alt="Reviewer"
                    className="w-8 h-8 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(buyerInfos[review.buyer_id] || "Client")}&background=random`;
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-black">{buyerInfos[review.buyer_id] || `Client ${review.buyer_id}`}</span>
                    {user && user.role === "buyer" && user.id === review.buyer_id && editingReview !== review.id && (
                      <button
                        onClick={() => {
                          setEditingReview(review.id);
                          setEditReview({ rating: review.rating, comment: review.comment || "" });
                        }}
                        className="text-[10px] uppercase font-black opacity-40 hover:opacity-100 transition-opacity ml-2 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {editingReview !== review.id && renderStars(review.rating)}
              </div>

              {editingReview === review.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, review.id)} className={`mb-8 p-6 border ${isDark ? "border-zinc-900 bg-zinc-950/30" : "border-zinc-100 bg-zinc-50/30"}`}>
                  <span className={`block text-[10px] uppercase tracking-widest font-black mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Edit Testimonial</span>
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditReview({ ...editReview, rating: num })}
                          className={`transition-all duration-300 ${num <= editReview.rating ? "opacity-100 scale-110" : "opacity-20 hover:opacity-50"}`}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Commentary</label>
                    <textarea
                      value={editReview.comment}
                      onChange={(e) => setEditReview({ ...editReview, comment: e.target.value })}
                      className="w-full py-2 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors text-sm"
                      rows="2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submittingEdit}
                      className={`px-4 py-2 rounded-none font-bold text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
                    >
                      {submittingEdit ? "Updating..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 rounded-none font-bold text-[9px] uppercase tracking-[0.2em] transition-all duration-300 border border-zinc-200 dark:border-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className={`text-lg leading-relaxed font-serif ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{review.comment}</p>
              )}

              {review.reply && replyingTo !== review.id && (
                <div className={`mt-8 ml-8 p-8 border-l-2 ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${AUTH_URL}/users/profile-image/${item?.user_id}?role=seller`}
                        alt="Seller"
                        className="w-8 h-8 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(seller?.store_name || "Seller")}&background=random`;
                        }}
                      />
                      <div>
                        <span className="text-xs uppercase tracking-widest font-black block">{seller?.store_name || "Seller"}</span>
                        <span className={`text-[9px] uppercase tracking-widest block ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Seller Correspondence</span>
                      </div>
                    </div>
                    {user && user.role === "seller" && item && user.id === item.user_id && (
                      <button
                        onClick={() => {
                          setReplyingTo(review.id);
                          setReplyText(review.reply);
                        }}
                        className="text-[10px] uppercase font-black opacity-20 hover:opacity-100 transition-opacity"
                      >
                        Edit Reply
                      </button>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed italic ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{review.reply}</p>
                </div>
              )}

              {user && user.role === "seller" && item && user.id === item.user_id && !review.reply && replyingTo !== review.id && (
                <button
                  onClick={() => {
                    setReplyingTo(review.id);
                    setReplyText("");
                  }}
                  className={`mt-6 text-[10px] uppercase tracking-widest font-black opacity-40 hover:opacity-100 transition-opacity`}
                >
                  + Respond to this review
                </button>
              )}

              {replyingTo === review.id && (
                <div className={`mt-8 ml-8 p-8 border ${isDark ? "border-zinc-900 bg-zinc-950/50" : "border-zinc-100 bg-zinc-50/50"}`}>
                  <span className={`block text-[10px] uppercase tracking-widest font-black mb-6 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Drafting Correspondence</span>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Your professional response..."
                    className="w-full py-4 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors text-sm mb-8"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={submittingReply}
                      className={`px-6 py-3 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
                    >
                      {submittingReply ? "Transmitting..." : "Finalize"}
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className={`px-6 py-3 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-zinc-200 dark:border-zinc-800`}
                    >
                      Cancel
                    </button>
                  </div>
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
