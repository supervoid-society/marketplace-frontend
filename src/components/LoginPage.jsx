import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const AUTH_URL = import.meta.env.AUTH_SERVICE_URL;

function LoginPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-all duration-200 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className={`backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border transition-all duration-200 ${isDark ? 'bg-black/80 border-gray-900' : 'bg-white/80 border-gray-200'}`}>
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 transition-all duration-200 ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin Login</h2>
            <p className={`transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Masuk ke panel admin</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
            >
              Masuk
            </button>
          </form>
          <div className="text-center mt-6">
            <Link to="/" className={`text-sm transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
    </div>
  );
}

export default LoginPage;