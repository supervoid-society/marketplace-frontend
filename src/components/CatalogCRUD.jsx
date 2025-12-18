import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function CatalogCRUD({ token, syncCartWithCatalog }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);
  const [images, setImages] = useState({});

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items`);
      const data = await res.json();
      setCatalog(data);
      for (const item of data) {
        if (item.image_id && !images[item.image_id]) {
          try {
            const imgRes = await fetch(`${CRUD_URL}/images/${item.image_id}`);
            const imgData = await imgRes.json();
            setImages(prev => ({ ...prev, [item.image_id]: imgData }));
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchCatalog();
        syncCartWithCatalog();
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Delete item error:", error);
    }
  };

  const openEditModal = (item) => {
    navigate(`/manage-catalog/${item.id}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Catalog Management</h2>
        <button
          onClick={() => navigate("/manage-catalog/add")}
          className="bg-gray-600 text-white px-8 py-2 rounded-lg hover:bg-gray-500 transition duration-200 shadow-md text-sm sm:text-base"
        >
          Add New Catalog
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 place-items-center">
        {catalog.map((item) => (
          <div key={item.id} className={`p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 w-80 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {item.image_id && images[item.image_id] && (
              <img
                src={`data:${images[item.image_id].content_type};base64,${images[item.image_id].data}`}
                alt={item.name}
                className="w-full aspect-[2/1] object-cover mb-3 sm:mb-4 rounded-lg"
              />
            )}
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-gray-800">{item.name}</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm lg:text-base">{item.description}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{formatRupiah(item.price)}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => openEditModal(item)}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200 flex-1 text-xs sm:text-sm lg:text-base"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 flex-1 text-xs sm:text-sm lg:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatalogCRUD;