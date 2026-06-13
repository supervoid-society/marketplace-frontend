import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Swal from "sweetalert2";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

function AddUser({ token }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AUTH_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate("/manage-users");
      } else {
        const error = await res.json();
        Swal.fire({ icon: "error", title: "Registration Error", text: error.error });
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        <h1 className="text-5xl font-serif italic mb-4">New Profile.</h1>
        <p className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Authorizing System Access</p>
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
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Credentials / Password</label>
            <input
              type="password"
              placeholder="Secret Key"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white placeholder-zinc-800 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-200 focus:border-black"}`}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className={`w-full py-6 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Verify & Create
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-users")}
            className={`w-full py-4 rounded-none text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 border border-transparent ${isDark ? "text-zinc-500 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900"}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
