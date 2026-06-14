import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function UserCRUD({ token }) {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleToggleBanUser = async (user) => {
    const action = user.is_banned === 1 ? "unban" : "ban";
    const actionLabel = user.is_banned === 1 ? "Pulihkan Akses" : "Ban Akses";
    const confirmText = user.is_banned === 1 ? "Apakah Anda yakin ingin memulihkan akses user ini?" : "Apakah Anda yakin ingin membanned user ini? User tidak akan bisa login.";

    const result = await Swal.fire({
      title: `${actionLabel}?`,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: actionLabel,
      confirmButtonColor: "#000",
      background: isDark ? "#09090b" : "#fff",
      color: isDark ? "#fff" : "#000",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${AUTH_URL}/users/${user.id}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchUsers();
        Swal.fire({
          title: "Berhasil",
          text: `Status user berhasil diubah menjadi: ${user.is_banned === 1 ? "Aktif" : "Banned"}.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      } else {
        const error = await res.json();
        Swal.fire({
          title: "Gagal",
          text: error.error || "Gagal merubah status user.",
          icon: "error",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      console.error("Error toggling user ban:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
            Identity <span className="italic">Audit.</span>
          </h1>
          <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Manage system users, access credentials, and privilege authorization.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-serif italic opacity-40">No users found.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 bg-transparent">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-8 md:p-10 flex flex-col justify-between transition-all duration-300 border ${
                isDark ? "bg-zinc-950 border-zinc-900 text-zinc-100 hover:border-zinc-800" : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-305"
              } ${user.is_banned === 1 ? "opacity-60" : "opacity-100"}`}
            >
              <div className="mb-12">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">UID / {user.id.slice(-6)}</span>
                  <div
                    className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black border ${
                      user.is_banned === 1
                        ? "border-rose-500 text-rose-500 bg-rose-500/5"
                        : user.role === "admin"
                          ? "border-indigo-500/20 text-indigo-500 bg-indigo-500/5"
                          : user.role === "seller"
                            ? "border-amber-500/20 text-amber-500 bg-amber-500/5"
                            : "border-blue-500/20 text-blue-500 bg-blue-500/5"
                    }`}
                  >
                    {user.is_banned === 1 ? "Banned" : user.role}
                  </div>
                </div>

                <h3 className="text-2xl font-serif tracking-tight mb-6 leading-tight">{user.username}</h3>

                <div className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.15em] font-bold opacity-40">
                  <span>Joined / {new Date(user.created_at).toLocaleDateString("en-GB")}</span>
                  {user.updated_at && user.updated_at !== user.created_at && <span>Updated / {new Date(user.updated_at).toLocaleDateString("en-GB")}</span>}
                </div>
              </div>

              <div className={`grid grid-cols-1 gap-px border-t -mx-8 -mb-8 md:-mx-10 md:-mb-10 mt-auto ${isDark ? "bg-zinc-900 border-zinc-900" : "bg-zinc-200 border-zinc-200"}`}>
                <button
                  onClick={() => handleToggleBanUser(user)}
                  className={`py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${
                    user.is_banned === 1 ? "text-emerald-500/65 hover:text-emerald-500" : "text-rose-500/65 hover:text-rose-500"
                  } ${isDark ? "bg-zinc-950 hover:bg-zinc-900" : "bg-white hover:bg-zinc-50"}`}
                >
                  {user.is_banned === 1 ? "Pulihkan Akses" : "Ban Akses"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserCRUD;
