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

  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Revoke Access?",
      text: "This user's account will be permanently terminated.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Terminate",
      confirmButtonColor: "#000",
      background: isDark ? "#09090b" : "#fff",
      color: isDark ? "#fff" : "#000",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${AUTH_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-12">
        <h2 className="text-4xl font-serif italic">Identity Audit</h2>
        <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Users Registry</span>
      </div>

      <div className="border border-zinc-100 dark:border-zinc-900 space-y-px bg-zinc-100 dark:bg-zinc-900">
        {users.map((user) => (
          <div key={user.id} className={`p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <div className="flex gap-8">
              <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mt-1">UID / {user.id.slice(-6)}</span>
              <div>
                <h3 className="text-xl font-serif tracking-tight mb-1">{user.username}</h3>
                <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${user.role === "admin" ? "text-indigo-500" : isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Access Level / {user.role}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                Joined / {new Date(user.created_at).toLocaleDateString("en-GB")}
              </span>
              <button onClick={() => handleDeleteUser(user.id)} className={`text-[10px] uppercase tracking-[0.3em] font-black text-rose-500 hover:underline`}>
                Terminate Access
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserCRUD;
