import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function EditUser({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setForm({ username: user.username, password: "" });
      } else {
        navigate("/manage-users");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { username: form.username };
      if (form.password) updateData.password = form.password;
      const res = await fetch(`${AUTH_URL}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        navigate("/manage-users");
      } else {
        Swal.fire({ icon: "error", title: "Update Failed" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return null;

  return (
    <div className="py-12 px-6 max-w-md mx-auto">
      <Link
        to="/manage-users"
        className={`inline-flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-200 ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Audit
      </Link>

      <div className="mb-16 text-center">
        <h1 className="text-5xl font-serif italic mb-4">Edit Profile.</h1>
        <p className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Modifying System Identity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-8">
          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Identity / Username</label>
            <input
              type="text"
              placeholder="Identifier"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
              required
            />
          </div>
          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>New Credentials (Optional)</label>
            <input
              type="password"
              placeholder="Reset Key"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className={`w-full py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Commit Changes
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-users")}
            className={`w-full py-4 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border border-transparent ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
          >
            Dismiss
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;
