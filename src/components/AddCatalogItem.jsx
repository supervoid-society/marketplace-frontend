import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.CRUD_SERVICE_URL;

function AddCatalogItem({ token }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", description: "", price: "", image_base64: "", image_content_type: "" });

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
        alert("Failed to add item");
      }
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  return (
    <div className={`max-w-lg mx-auto p-8 rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add New Catalog Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          required
        />
        <input
          type="number"
          placeholder="Harga (Rp)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result;
                const [mime, base64] = dataUrl.split(',');
                const contentType = mime.split(':')[1].split(';')[0];
                setForm({ ...form, image_base64: base64, image_content_type: contentType });
              };
              reader.readAsDataURL(file);
            }
          }}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 flex-1">
            Add Item
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-catalog")}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCatalogItem;