import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function LoginPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AUTH_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/catalog");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Login failed",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className={`p-8 md:p-12 rounded-none border transition-all duration-200 max-w-md w-full ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
        <div className="mb-12">
          <h2 className="text-5xl font-serif italic mb-4">Login.</h2>
          <p className={`text-xs uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Access your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-5 rounded-none transition-all duration-300 active:scale-95 font-bold text-[10px] uppercase tracking-[0.2em] border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Sign In
          </button>
        </form>
        <div className="mt-12 space-y-4">
          <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            New here?{" "}
            <Link to="/register-buyer" className={`underline underline-offset-4 ${isDark ? "text-zinc-100 hover:text-white" : "text-zinc-900 hover:text-black"}`}>
              Create an account
            </Link>
          </p>
          <Link to="/" className={`block text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-700 hover:text-zinc-500" : "text-zinc-300 hover:text-zinc-500"}`}>
            ← Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
