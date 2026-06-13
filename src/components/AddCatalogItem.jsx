import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL } from "../config";
import Swal from "sweetalert2";

function AddCatalogItem({ token }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", description: "", price: "", qty: "", image_base64: "", image_content_type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate("/manage-catalog");
      } else {
        Swal.fire({ icon: "error", title: "Operation Failed" });
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">New Entry.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Expanding the curated collection.</p>
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
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-6 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Visual Representation</label>
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
                {form.image_base64 ? "Modify Visual" : "Select Manifest Image"}
              </label>
              {form.image_base64 && (
                <div className="mt-8 border border-zinc-100 dark:border-zinc-900 grayscale">
                  <img src={`data:${form.image_content_type};base64,${form.image_base64}`} alt="Preview" className="max-h-48 mx-auto" />
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
            Publish Entry
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-catalog")}
            className={`flex-1 py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
          >
            Dismiss
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCatalogItem;
