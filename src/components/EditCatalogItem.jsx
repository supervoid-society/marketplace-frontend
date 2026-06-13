import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CRUD_URL } from "../config";
import Swal from "sweetalert2";

function EditCatalogItem({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { refreshCart } = useCart();
  const [form, setForm] = useState({ name: "", description: "", price: "", qty: "", image_base64: "", image_content_type: "" });
  const [currentImageId, setCurrentImageId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`);
      if (res.ok) {
        const item = await res.json();
        setForm({
          name: item.name,
          description: item.description || "",
          price: item.price,
          qty: item.qty || "",
          image_base64: "",
          image_content_type: "",
        });
        setCurrentImageId(item.image_id);
      } else {
        navigate("/manage-catalog");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        refreshCart();
        navigate("/manage-catalog");
      } else {
        Swal.fire({ icon: "error", title: "Update Failed" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return null;

  return (
    <div className="py-12 px-6 max-w-2xl mx-auto">
      <Link
        to="/manage-catalog"
        className={`inline-flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-200 ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Registry
      </Link>

      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Edit Entry.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Refining the collection details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-8">
          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Item Designation</label>
            <input
              type="text"
              placeholder="Designation"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Market Value (Rp)</label>
              <input
                type="number"
                placeholder="Value"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
                required
              />
            </div>

            <div>
              <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Inventory Quantity</label>
              <input
                type="number"
                placeholder="Units"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Narrative Description</label>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 min-h-[120px] ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-6 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Visual Content</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className={`p-8 border border-dashed text-center ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result;
                        const [mime, base64] = dataUrl.split(",");
                        const contentType = mime.split(":")[1].split(";")[0];
                        setForm({ ...form, image_base64: base64, image_content_type: contentType });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="visual-upload"
                />
                <label htmlFor="visual-upload" className="cursor-pointer text-[10px] uppercase tracking-widest font-black underline underline-offset-4">
                  Update Image
                </label>
              </div>
              {(currentImageId || form.image_base64) && (
                <div className={`border p-2 grayscale ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                  <img
                    src={form.image_base64 ? `data:${form.image_content_type};base64,${form.image_base64}` : `${CRUD_URL}/images/${currentImageId}`}
                    alt="Current"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-12">
          <button
            type="submit"
            className={`flex-[2] py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Update Registry
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-catalog")}
            className={`flex-1 py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCatalogItem;
