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
      text: "This item will be hidden from the public catalog.",
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

  const handleRestoreItem = async (id) => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items/${id}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCatalog();
        Swal.fire({
          title: "Item Restored",
          text: "The item is now live in the catalog.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
            Stock <span className="italic">Room.</span>
          </h1>
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Oversee your inventory and curated collection.</p>
        </div>
        {userRole === "seller" && (
          <button
            onClick={() => navigate("/manage-catalog/add")}
            className={`px-10 py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Add New Item
          </button>
        )}
      </div>

      {catalog.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-serif italic opacity-40">Your stock room is currently empty.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
          {catalog.map((item) => (
            <div key={item.id} className={`p-8 md:p-10 flex flex-col justify-between transition-opacity duration-500 ${isDark ? "bg-zinc-950" : "bg-white"} ${item.is_archived ? "opacity-50" : "opacity-100"}`}>
              <div className="mb-12">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">REF / {item.id.slice(-6)}</span>
                  <div className="flex flex-col items-end gap-2">
                    {item.is_archived ? (
                      <div className="px-3 py-1 text-[8px] uppercase tracking-widest font-black border border-zinc-500 text-zinc-500 bg-zinc-500/5">
                        Archived
                      </div>
                    ) : (
                      <div className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black border ${item.qty > 0 ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-rose-500/20 text-rose-500 bg-rose-500/5"}`}>
                        {item.qty > 0 ? "In Stock" : "Sold Out"}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-2xl font-serif tracking-tight mb-4 leading-tight">{item.name}</h3>
                <p className={`text-sm mb-8 line-clamp-3 leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{item.description}</p>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tighter">{formatRupiah(item.price)}</span>
                  <span className={`text-[10px] uppercase font-bold opacity-30 tracking-widest`}>Qty: {item.qty}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 -mx-8 -mb-8 md:-mx-10 md:-mb-10 mt-auto">
                {userRole === "seller" && (
                  <button
                    onClick={() => !item.is_archived && navigate(`/manage-catalog/${item.id}`)}
                    disabled={item.is_archived}
                    className={`py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${item.is_archived ? "opacity-20 cursor-not-allowed" : ""} ${isDark ? "bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100" : "bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900"}`}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => item.is_archived ? handleRestoreItem(item.id) : handleDeleteItem(item.id)}
                  className={`py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${item.is_archived ? "text-emerald-500/60 hover:text-emerald-500" : "text-rose-500/60 hover:text-rose-500"} ${isDark ? "bg-zinc-950 hover:bg-zinc-900" : "bg-white hover:bg-zinc-50"}`}
                >
                  {item.is_archived ? "Restore" : "Archive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CatalogCRUD;
