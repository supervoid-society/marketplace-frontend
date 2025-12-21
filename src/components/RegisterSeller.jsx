import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Swal from 'sweetalert2';

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function RegisterSeller() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    store_name: "",
    description: "",
    contact_phone: ""
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // First create user
      const userRes = await fetch(`${AUTH_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          role: "seller"
        }),
      });
      const userData = await userRes.json();
      if (userData.id) {
        // Then create seller profile
        const sellerRes = await fetch(`${AUTH_URL}/sellers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userData.id,
            store_name: registerForm.store_name,
            description: registerForm.description,
            contact_phone: registerForm.contact_phone
          }),
        });
        const sellerData = await sellerRes.json();
        if (sellerData.id) {
          // Set initial balance
          await fetch(`${AUTH_URL}/auth/balance/${userData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "seller", amount: 0 }),
          });
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Registrasi berhasil! Silakan login.',
          });
          navigate("/login");
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal membuat profil penjual: ' + (sellerData.error || "Unknown error"),
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal membuat akun: ' + (userData.error || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat registrasi',
      });
    }
  };

  return (
    <div className={`min-h-screen px-4 pt-24 pb-8 transition-all duration-200 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="flex justify-center">
          <div className={`backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border transition-all duration-200 ${isDark ? 'bg-black/80 border-gray-900' : 'bg-white/80 border-gray-200'}`}>
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 transition-all duration-200 ${isDark ? 'text-white' : 'text-gray-800'}`}>Daftar sebagai Penjual</h2>
            <p className={`transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Buat akun untuk menjual produk</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
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
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nama Toko</label>
              <input
                type="text"
                placeholder="Masukkan nama toko"
                value={registerForm.store_name}
                onChange={(e) => setRegisterForm({ ...registerForm, store_name: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Deskripsi Toko</label>
              <textarea
                placeholder="Deskripsikan toko Anda"
                value={registerForm.description}
                onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
                rows="3"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-all duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Telepon Kontak</label>
              <input
                type="tel"
                placeholder="Masukkan nomor telepon kontak"
                value={registerForm.contact_phone}
                onChange={(e) => setRegisterForm({ ...registerForm, contact_phone: e.target.value })}
                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500'
                    : 'border-gray-300 bg-white/50 text-black placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
            >
              Daftar
            </button>
          </form>
          <div className="text-center mt-6 space-y-2">
            <p className={`text-sm transition-all duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sudah punya akun?{" "}
              <Link to="/login" className={`font-medium hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}>
                Masuk di sini
              </Link>
            </p>
            <p className={`text-sm transition-all duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ingin beli produk?{" "}
              <Link to="/register-buyer" className={`font-medium hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}>
                Daftar sebagai Pembeli
              </Link>
            </p>
          </div>
          </div>
        </div>
    </div>
  );
}

export default RegisterSeller;