import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Swal from 'sweetalert2';

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function CatalogCRUD({ token, syncCartWithCatalog, userRole }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${CRUD_URL}/catalog-items`, { headers });
      const data = await res.json();
      setCatalog(data);
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
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Failed to delete item',
        });
      }
    } catch (error) {
      console.error("Delete item error:", error);
    }
  };

  const openEditModal = (item) => {
    navigate(`/manage-catalog/${item.id}`);
  };

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="relative text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Catalog Management</h2>
        {userRole === 'seller' && (
          <button
            onClick={() => navigate("/manage-catalog/add")}
            className="sm:absolute sm:top-20 sm:right-0 block mx-auto sm:mx-0 bg-gray-600 text-white px-8 py-2 rounded-lg hover:bg-gray-500 transition duration-200 shadow-md text-sm sm:text-base"
          >
            Add New Catalog
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 place-items-center mt-4 sm:mt-24">
        {catalog.map((item) => (
          <div key={item.id} className={`p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 w-80 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {item.image_id && (
              <img
                src={`${CRUD_URL}/images/${item.image_id}`}
                alt={item.name}
                className="w-full aspect-[2/1] object-cover mb-3 sm:mb-4 rounded-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-gray-800">{item.name}</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm lg:text-base">{item.description}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{formatRupiah(item.price)}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500">Qty:</span>
              <span className={`text-sm font-medium ${item.qty > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.qty}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {userRole === 'seller' && (
                <button
                  onClick={() => openEditModal(item)}
                  className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200 flex-1 text-xs sm:text-sm lg:text-base"
                >
                  Edit
                </button>
              )}
              {(userRole === 'admin' || userRole === 'seller') && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 flex-1 text-xs sm:text-sm lg:text-base"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatalogCRUD;