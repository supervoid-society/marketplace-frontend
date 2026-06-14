import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function UserCRUD({ token }) {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
    address: "",
    phone: "",
    store_name: "",
    description: "",
    contact_phone: "",
  });
  const [updating, setUpdating] = useState(false);

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

  const handleEditClick = async (user) => {
    try {
      const res = await fetch(`${AUTH_URL}/users/${user.id}/admin-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        setEditForm({
          username: data.username || "",
          full_name: data.profile?.full_name || "",
          address: data.profile?.address || "",
          phone: data.profile?.phone || "",
          store_name: data.profile?.store_name || "",
          description: data.profile?.description || "",
          contact_phone: data.profile?.contact_phone || "",
        });
        setIsEditModalOpen(true);
      } else {
        const error = await res.json();
        Swal.fire({
          title: "Gagal",
          text: error.error || "Gagal mengambil profil user.",
          icon: "error",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`${AUTH_URL}/users/${selectedUser.id}/admin-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        Swal.fire({
          title: "Berhasil",
          text: "Informasi user berhasil diperbarui.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        const error = await res.json();
        Swal.fire({
          title: "Gagal",
          text: error.error || "Gagal memperbarui informasi user.",
          icon: "error",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setUpdating(false);
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

              <div className={`grid grid-cols-2 gap-px border-t -mx-8 -mb-8 md:-mx-10 md:-mb-10 mt-auto ${isDark ? "bg-zinc-900 border-zinc-900" : "bg-zinc-200 border-zinc-200"}`}>
                <button
                  onClick={() => handleEditClick(user)}
                  disabled={user.role === "admin"}
                  className={`py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border-r disabled:opacity-20 cursor-pointer ${
                    isDark
                      ? "border-zinc-900 text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-900"
                      : "border-zinc-200 text-zinc-655 text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-50"
                  }`}
                >
                  Edit Info
                </button>
                <button
                  onClick={() => handleToggleBanUser(user)}
                  disabled={user.id === JSON.parse(atob(token.split(".")[1])).userId}
                  className={`py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 disabled:opacity-20 cursor-pointer ${
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

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg p-8 rounded-none border transition-all duration-300 ${
              isDark ? "bg-zinc-950 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-900"
            }`}
          >
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[9px] font-black opacity-45 uppercase tracking-[0.2em]">Profile Configuration</span>
                <h2 className="text-2xl font-serif tracking-tight mt-1">
                  Edit User Info / <span className="italic">{selectedUser.username}</span>
                </h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-2xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none">
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Username field */}
              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 font-mono text-sm ${
                    isDark ? "border-zinc-800" : "border-zinc-200"
                  }`}
                  required
                />
              </div>

              {/* Buyer specific fields */}
              {selectedUser.role === "buyer" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-sm ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-sm ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 font-mono text-sm ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Seller specific fields */}
              {selectedUser.role === "seller" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Store Name</label>
                    <input
                      type="text"
                      value={editForm.store_name}
                      onChange={(e) => setEditForm({ ...editForm, store_name: e.target.value })}
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-sm ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Store Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows="3"
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-sm resize-none ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Contact Phone</label>
                    <input
                      type="text"
                      value={editForm.contact_phone}
                      onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                      className={`w-full py-2 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 font-mono text-sm ${
                        isDark ? "border-zinc-800" : "border-zinc-200"
                      }`}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`flex-1 py-4 text-[9px] uppercase tracking-[0.2em] font-bold border transition-colors cursor-pointer ${
                    isDark ? "border-zinc-800 text-zinc-350 text-zinc-300 hover:bg-zinc-900 hover:text-white" : "border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`flex-1 py-4 text-[9px] uppercase tracking-[0.2em] font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? "bg-white text-zinc-950 border-white hover:bg-transparent hover:text-white"
                      : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                  } disabled:opacity-50`}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCRUD;
