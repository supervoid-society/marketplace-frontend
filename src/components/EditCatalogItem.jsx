import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.CRUD_SERVICE_URL;

function EditCatalogItem({ token, syncCartWithCatalog }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", description: "", price: "", image_base64: "", image_content_type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`);
      if (res.ok) {
        const item = await res.json();
        let imageData = { image_base64: "", image_content_type: "" };
        if (item.image_id) {
          try {
            const imgRes = await fetch(`${CRUD_URL}/images/${item.image_id}`);
            const imgData = await imgRes.json();
            imageData = { image_base64: imgData.data, image_content_type: imgData.content_type };
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
        setForm({
          name: item.name,
          description: item.description || "",
          price: item.price,
          ...imageData,
        });
      } else {
        alert("Item not found");
        navigate("/manage-catalog");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
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
        syncCartWithCatalog();
        navigate("/manage-catalog");
      } else {
        alert("Failed to update item");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className={`max-w-lg mx-auto p-8 rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Edit Catalog Item</h2>
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
        {form.image_base64 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Current Image:</p>
            <img
              src={`data:${form.image_content_type};base64,${form.image_base64}`}
              alt="Current"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}
        <div className="flex gap-4">
          <button type="submit" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 flex-1">
            Update Item
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

export default EditCatalogItem;