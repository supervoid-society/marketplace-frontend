import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function Review({ itemId }) {
  const { isDark } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [buyerInfos, setBuyerInfos] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [editReview, setEditReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
    checkUserAndPurchase();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/reviews/${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);

        // Fetch buyer info for each review
        const buyerIds = [...new Set(data.map(review => review.buyer_id))];
        const buyerInfoPromises = buyerIds.map(async (buyerId) => {
          try {
            const buyerRes = await fetch(`${AUTH_URL}/users/${buyerId}`);
            if (buyerRes.ok) {
              const buyerData = await buyerRes.json();
              return { buyerId, username: buyerData.username };
            }
          } catch (error) {
            console.error(`Error fetching buyer ${buyerId}:`, error);
          }
          return { buyerId, username: `Buyer ${buyerId}` };
        });

        const buyerInfosArray = await Promise.all(buyerInfoPromises);
        const buyerInfosMap = {};
        buyerInfosArray.forEach(({ buyerId, username }) => {
          buyerInfosMap[buyerId] = username;
        });
        setBuyerInfos(buyerInfosMap);

        // Check if current user has reviewed
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userRes = await fetch(`${AUTH_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              const hasReviewedItem = data.some(review => review.buyer_id === userData.id);
              setHasReviewed(hasReviewedItem);
            }
          } catch (error) {
            console.error("Error checking review status:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserAndPurchase = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Get user info
      const userRes = await fetch(`${AUTH_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);

        // Check if user has purchased this item
        const transRes = await fetch(`${CRUD_URL}/transactions/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          const hasPurchasedItem = transData.some(trans => 
            trans.item_id === itemId && trans.status === 'completed'
          );
          setHasPurchased(hasPurchasedItem);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Get transactions to find the transaction_id
      const transRes = await fetch(`${CRUD_URL}/transactions/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const transData = await transRes.json();
      const transaction = transData.find(trans => 
        trans.item_id === itemId && trans.status === 'completed'
      );
      if (!transaction) return;

      const res = await fetch(`${CRUD_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (res.ok) {
        setShowAddReview(false);
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleEditReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${CRUD_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: editReview.rating,
          comment: editReview.comment
        })
      });

      if (res.ok) {
        setEditingReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error editing review:", error);
    }
  };

  const handleReply = async (reviewId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${CRUD_URL}/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (res.ok) {
        setReplyingTo(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className={`mt-8 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      {/* Add Review Button */}
      {user && user.role === 'buyer' && hasPurchased && !hasReviewed && !showAddReview && (
        <button
          onClick={() => setShowAddReview(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Review
        </button>
      )}

      {/* Add Review Form */}
      {showAddReview && (
        <form onSubmit={handleAddReview} className="mb-6 p-4 border rounded">
          <div className="mb-4">
            <label className="block mb-2">Rating:</label>
            <div className="flex">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNewReview({...newReview, rating: num})}
                  className={`text-2xl ${num <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Comment:</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Submit Review
          </button>
          <button
            type="button"
            onClick={() => setShowAddReview(false)}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} className="mb-4 p-4 border rounded bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{buyerInfos[review.buyer_id] || `Buyer ${review.buyer_id}`}</span>
              <div className="flex">{renderStars(review.rating)}</div>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
            {review.reply && (
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <strong className="text-blue-800">Seller Reply:</strong>
                <p className="text-blue-700 mt-1">{review.reply}</p>
              </div>
            )}
            {user && user.role === 'buyer' && user.id === review.buyer_id && (
              <button
                onClick={() => {
                  setEditingReview(review.id);
                  setEditReview({ rating: review.rating, comment: review.comment || '' });
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Edit Review
              </button>
            )}
            {user && user.role === 'seller' && (
              <button
                onClick={() => {
                  setReplyingTo(review.id);
                  setReplyText(review.reply || '');
                }}
                className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
              >
                {review.reply ? 'Edit Reply' : 'Reply'}
              </button>
            )}
            {editingReview === review.id && (
              <div className="mt-3 p-3 border rounded bg-white">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Rating:</label>
                  <div className="flex">
                    {[1,2,3,4,5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEditReview({...editReview, rating: num})}
                        className={`text-xl mr-1 ${num <= editReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Comment:</label>
                  <textarea
                    value={editReview.comment}
                    onChange={(e) => setEditReview({...editReview, comment: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingReview(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {replyingTo === review.id && (
              <div className="mt-3 p-3 border rounded bg-white">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows="3"
                  placeholder={review.reply ? "Edit your reply..." : "Write your reply..."}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleReply(review.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    {review.reply ? 'Update Reply' : 'Submit Reply'}
                  </button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
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
  );
}

export default Review;