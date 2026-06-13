import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Swal from "sweetalert2";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";

function CatalogCRUD({ token, syncCartWithCatalog, userRole }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [catalog, setCatalog] = useState([]);

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
    const result = await Swal.fire({
      title: "Archive Item?",
      text: "This item will be removed from circulation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archive",
      confirmButtonColor: "#000",
      background: isDark ? "#09090b" : "#fff",
      color: isDark ? "#fff" : "#000",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCatalog();
        if (syncCartWithCatalog) syncCartWithCatalog();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-8">
        <h2 className="text-4xl font-serif italic">Inventory Control</h2>
        {userRole === "seller" && (
          <button
            onClick={() => navigate("/manage-catalog/add")}
            className={`px-8 py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Add To Collection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
        {catalog.map((item) => (
          <div key={item.id} className={`p-6 md:p-8 flex flex-col justify-between h-full ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <div>
              <span className="text-[10px] font-black opacity-20 uppercase tracking-widest block mb-4">SKU / {item.id.slice(-6)}</span>
              <h3 className="text-xl font-serif tracking-tight mb-2 leading-tight">{item.name}</h3>
              <p className={`text-sm mb-6 line-clamp-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{item.description}</p>
              <p className="text-2xl font-black tracking-tighter mb-4">{formatRupiah(item.price)}</p>
              <div className="flex items-center gap-2 mb-8">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${item.qty > 0 ? "text-emerald-500" : "text-rose-500"}`}>Availability / {item.qty} units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              {userRole === "seller" && (
                <button
                  onClick={() => navigate(`/manage-catalog/${item.id}`)}
                  className={`py-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${isDark ? "bg-zinc-950 hover:bg-zinc-900" : "bg-white hover:bg-zinc-50"}`}
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDeleteItem(item.id)}
                className={`py-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 text-rose-500 ${isDark ? "bg-zinc-950 hover:bg-zinc-900" : "bg-white hover:bg-zinc-50"}`}
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatalogCRUD;
