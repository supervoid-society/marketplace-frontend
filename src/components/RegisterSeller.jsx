import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function RegisterSeller() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    store_name: "",
    description: "",
    contact_phone: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userRes = await fetch(`${AUTH_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          role: "seller",
        }),
      });
      const userData = await userRes.json();
      if (userData.id) {
        const sellerRes = await fetch(`${AUTH_URL}/sellers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userData.id,
            store_name: registerForm.store_name,
            description: registerForm.description,
            contact_phone: registerForm.contact_phone,
          }),
        });
        const sellerData = await sellerRes.json();
        if (sellerData.id) {
          await fetch(`${AUTH_URL}/auth/balance/${userData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "seller", amount: 0 }),
          });
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Registrasi berhasil! Silakan login.",
          });
          navigate("/login");
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Gagal membuat profil penjual: " + (sellerData.error || "Unknown error"),
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal membuat akun: " + (userData.error || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Terjadi kesalahan saat registrasi" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-8 flex items-center justify-center">
      <div className="w-full flex justify-center">
        <div className={`p-8 md:p-12 rounded-none border transition-all duration-200 max-w-lg w-full ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Merchant.</h2>
            <p className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Seller Registration</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-8">
                <div>
                  <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
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
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                      isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                    }`}
                    required
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Store Name</label>
                  <input
                    type="text"
                    placeholder="Store Name"
                    value={registerForm.store_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, store_name: e.target.value })}
                    className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                      isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={registerForm.contact_phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, contact_phone: e.target.value })}
                    className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                      isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                    }`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Store Description</label>
              <textarea
                placeholder="Description"
                value={registerForm.description}
                onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 min-h-[100px] ${
                  isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                }`}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-6 rounded-none transition-all duration-300 active:scale-95 font-bold text-[10px] uppercase tracking-[0.3em] border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
            >
              Register Store
            </button>
          </form>
          <div className="mt-12 text-center space-y-4">
            <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              Already have an account?{" "}
              <Link to="/login" className={`underline underline-offset-4 ${isDark ? "text-zinc-100 hover:text-white" : "text-zinc-900 hover:text-black"}`}>
                Login
              </Link>
            </p>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-zinc-700" : "text-zinc-500"}`}>
              Looking to buy?{" "}
              <Link to="/register-buyer" className={`underline underline-offset-4 ${isDark ? "text-zinc-100 hover:text-white" : "text-zinc-900 hover:text-black"}`}>
                Register as Buyer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterSeller;
